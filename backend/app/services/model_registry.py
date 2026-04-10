from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from threading import Lock
from typing import Any

import numpy as np

from app.core.config import settings

try:
    import joblib
except Exception:  # pragma: no cover
    joblib = None

try:
    import torch
    import torch.nn as nn
    import torch.nn.functional as F
except Exception:  # pragma: no cover
    torch = None
    nn = None
    F = None


MODEL_NAME_MAP = {
    "rf": "random-forest",
    "xgb": "xgboost",
    "gru": "att-gru",
    "lstm": "att-lstm",
    "hybrid_xgb": "hybrid-gru-xgboost",
    "hybrid_gru": "hybrid-gru",
    "with_sentiment_rf": "with-sentiment-rf",
    "with_sentiment_xgb": "with-sentiment-xgboost",
    "no_sentiment_rf": "no-sentiment-rf",
    "no_sentiment_xgb": "no-sentiment-xgboost",
}

CLASS_LABELS_3 = ["Down", "Flat", "Up"]


class TemporalAttention(nn.Module):  # type: ignore[misc]
    def __init__(self, hidden_size: int) -> None:
        super().__init__()
        self.attn_proj = nn.Linear(hidden_size, 1, bias=False)

    def forward(self, sequence_output: torch.Tensor) -> torch.Tensor:
        scores = self.attn_proj(sequence_output)
        weights = torch.softmax(scores, dim=1)
        return torch.sum(weights * sequence_output, dim=1)


class AttnRNNClassifier(nn.Module):  # type: ignore[misc]
    def __init__(
        self,
        rnn_type: str,
        input_size: int,
        hidden_size: int,
        num_layers: int,
        fc1_out: int,
        num_classes: int,
    ) -> None:
        super().__init__()
        if rnn_type == "gru":
            self.gru = nn.GRU(input_size=input_size, hidden_size=hidden_size, num_layers=num_layers, batch_first=True)
        else:
            self.lstm = nn.LSTM(input_size=input_size, hidden_size=hidden_size, num_layers=num_layers, batch_first=True)
        self.attention = TemporalAttention(hidden_size)
        self.ln = nn.LayerNorm(hidden_size)
        self.fc1 = nn.Linear(hidden_size, fc1_out)
        self.fc2 = nn.Linear(fc1_out, num_classes)

    def forward(self, features: torch.Tensor) -> torch.Tensor:
        if hasattr(self, "gru"):
            encoded, _ = self.gru(features)
        else:
            encoded, _ = self.lstm(features)
        pooled = self.attention(encoded)
        normalized = self.ln(pooled)
        hidden = F.relu(self.fc1(normalized))
        return self.fc2(hidden)


@dataclass(frozen=True)
class ModelArtifact:
    symbol: str
    timeframe: str
    model_key: str
    model_name: str
    extension: str
    path: Path


class ModelRegistry:
    def __init__(self) -> None:
        self._lock = Lock()
        self._scanned = False
        self._artifacts: list[ModelArtifact] = []
        self._model_cache: dict[str, Any] = {}
        self._scaler_cache: dict[str, Any] = {}
        self._torch_cache: dict[str, Any] = {}

    def _resolve_model_dir(self) -> Path:
        if settings.artifact_dir:
            return Path(settings.artifact_dir)

        project_root = Path(__file__).resolve().parents[3]
        return project_root.parent.parent / "notebooks" / "CryptoOutput (1)" / "models"

    def _parse_filename(self, model_path: Path) -> ModelArtifact | None:
        parts = model_path.stem.split("_")
        if len(parts) < 3:
            return None

        symbol = parts[0]
        timeframe = parts[1]
        model_key = "_".join(parts[2:])
        if "scaler" in model_key:
            return None

        model_name = MODEL_NAME_MAP.get(model_key, model_key.replace("_", "-"))
        return ModelArtifact(
            symbol=symbol,
            timeframe=timeframe,
            model_key=model_key,
            model_name=model_name,
            extension=model_path.suffix.lower(),
            path=model_path,
        )

    def _scan(self) -> None:
        model_dir = self._resolve_model_dir()
        if not model_dir.exists() or not model_dir.is_dir():
            self._artifacts = []
            self._scanned = True
            return

        discovered: list[ModelArtifact] = []
        for path in sorted(model_dir.iterdir()):
            if not path.is_file() or path.suffix.lower() not in {".joblib", ".pt", ".pth"}:
                continue
            artifact = self._parse_filename(path)
            if artifact:
                discovered.append(artifact)

        self._artifacts = discovered
        self._scanned = True

    def ensure_scanned(self) -> None:
        if self._scanned:
            return
        with self._lock:
            if not self._scanned:
                self._scan()

    def list_models(self) -> list[dict[str, Any]]:
        self.ensure_scanned()
        return [
            {
                "name": artifact.model_name,
                "symbol": artifact.symbol,
                "timeframe": artifact.timeframe,
                "family": self._family_for_extension(artifact.extension),
                "artifact_type": artifact.extension,
                "artifact_path": str(artifact.path),
                "active": True,
            }
            for artifact in self._artifacts
        ]

    def active_models(self, symbol: str, timeframe: str | None) -> list[dict[str, Any]]:
        self.ensure_scanned()
        items = [item for item in self.list_models() if item["symbol"] == symbol]
        if timeframe:
            exact = [item for item in items if item["timeframe"] == timeframe]
            return exact or items
        return items

    def predict(self, model_name: str, payload: dict[str, Any]) -> dict[str, Any]:
        self.ensure_scanned()

        symbol = str(payload.get("symbol") or "BTCUSDT")
        timeframe = str(payload.get("timeframe") or "1h")
        request_body = payload.get("payload") if isinstance(payload.get("payload"), dict) else payload

        candidate = self._select_artifact(model_name=model_name, symbol=symbol, timeframe=timeframe)
        if not candidate:
            return {
                "predicted_class": "Unknown",
                "class_probabilities": {},
                "confidence_score": 0.0,
                "model_name": model_name,
                "model_version": "artifact-missing",
                "symbol": symbol,
                "timeframe": timeframe,
                "artifact_status": "not_found",
            }

        if candidate.extension == ".joblib":
            return self._predict_with_joblib(candidate, request_body, symbol, timeframe)

        if candidate.extension in {".pt", ".pth"}:
            return self._predict_with_torch(candidate, request_body, symbol, timeframe)

        return {
            "predicted_class": "Unknown",
            "class_probabilities": {},
            "confidence_score": 0.0,
            "model_name": candidate.model_name,
            "model_version": "artifact-registered",
            "symbol": symbol,
            "timeframe": candidate.timeframe,
            "artifact_status": "registered_non_joblib",
            "artifact_path": str(candidate.path),
        }

    def _predict_with_joblib(
        self,
        artifact: ModelArtifact,
        payload: dict[str, Any],
        symbol: str,
        timeframe: str,
    ) -> dict[str, Any]:
        if joblib is None:
            return {
                "predicted_class": "Unknown",
                "class_probabilities": {},
                "confidence_score": 0.0,
                "model_name": artifact.model_name,
                "model_version": "joblib-missing",
                "symbol": symbol,
                "timeframe": artifact.timeframe,
                "artifact_status": "joblib_not_installed",
            }

        model = self._load_joblib(artifact.path)
        features = self._extract_features(payload, model)

        scaler = self._find_scaler(symbol=artifact.symbol, timeframe=artifact.timeframe, model_key=artifact.model_key)
        if scaler is not None:
            try:
                features = scaler.transform(features)
            except Exception:
                pass

        predicted_value = model.predict(features)[0]
        probabilities = self._predict_proba(model, features)

        if artifact.model_name == "hybrid-gru-xgboost":
            hybrid_gru_artifact = self._find_hybrid_gru_partner(artifact)
            if hybrid_gru_artifact is not None:
                torch_result = self._predict_with_torch(hybrid_gru_artifact, payload, symbol, timeframe)
                torch_probs = torch_result.get("class_probabilities", {})
                probabilities = self._fuse_probabilities(probabilities, torch_probs)
                if probabilities:
                    predicted_value = max(probabilities, key=probabilities.get)

        confidence = max(probabilities.values()) if probabilities else 0.5

        return {
            "predicted_class": str(predicted_value),
            "class_probabilities": probabilities,
            "confidence_score": float(confidence),
            "model_name": artifact.model_name,
            "model_version": "artifact-loaded",
            "symbol": artifact.symbol,
            "timeframe": artifact.timeframe,
            "artifact_status": "ok",
            "artifact_path": str(artifact.path),
        }

    def _predict_with_torch(
        self,
        artifact: ModelArtifact,
        payload: dict[str, Any],
        symbol: str,
        timeframe: str,
    ) -> dict[str, Any]:
        if torch is None or nn is None or F is None:
            return {
                "predicted_class": "Unknown",
                "class_probabilities": {},
                "confidence_score": 0.0,
                "model_name": artifact.model_name,
                "model_version": "torch-missing",
                "symbol": symbol,
                "timeframe": artifact.timeframe,
                "artifact_status": "torch_not_installed",
            }

        try:
            model, input_size = self._load_torch_model(artifact)
            sequence = self._extract_sequence_features(payload, input_size)
            tensor = torch.tensor(sequence, dtype=torch.float32)
            model.eval()
            with torch.no_grad():
                logits = model(tensor)
                probs = torch.softmax(logits, dim=-1).cpu().numpy()[0]
            prob_map = self._build_probability_map(probs)
            predicted_label = max(prob_map, key=prob_map.get) if prob_map else "Unknown"
            confidence = max(prob_map.values()) if prob_map else 0.0
            return {
                "predicted_class": predicted_label,
                "class_probabilities": prob_map,
                "confidence_score": float(confidence),
                "model_name": artifact.model_name,
                "model_version": "artifact-loaded",
                "symbol": artifact.symbol,
                "timeframe": artifact.timeframe,
                "artifact_status": "ok",
                "artifact_path": str(artifact.path),
            }
        except Exception as exc:
            return {
                "predicted_class": "Unknown",
                "class_probabilities": {},
                "confidence_score": 0.0,
                "model_name": artifact.model_name,
                "model_version": "torch-load-failed",
                "symbol": symbol,
                "timeframe": artifact.timeframe,
                "artifact_status": "torch_load_failed",
                "artifact_error": str(exc),
                "artifact_path": str(artifact.path),
            }

    def _select_artifact(self, model_name: str, symbol: str, timeframe: str) -> ModelArtifact | None:
        candidates = [a for a in self._artifacts if a.model_name == model_name]
        if not candidates:
            normalized = model_name.replace("_", "-")
            candidates = [a for a in self._artifacts if a.model_name == normalized or a.model_key == model_name]
        if not candidates:
            return None

        exact = [a for a in candidates if a.symbol == symbol and a.timeframe == timeframe]
        if exact:
            return exact[0]

        same_symbol = [a for a in candidates if a.symbol == symbol]
        if same_symbol:
            return same_symbol[0]

        return candidates[0]

    def _load_joblib(self, path: Path) -> Any:
        cache_key = str(path)
        if cache_key in self._model_cache:
            return self._model_cache[cache_key]
        model = joblib.load(path)
        self._model_cache[cache_key] = model
        return model

    def _load_torch_model(self, artifact: ModelArtifact) -> tuple[Any, int]:
        cache_key = str(artifact.path)
        cached = self._torch_cache.get(cache_key)
        if cached is not None:
            return cached

        state_dict = torch.load(artifact.path, map_location="cpu", weights_only=False)
        if hasattr(state_dict, "state_dict"):
            state_dict = state_dict.state_dict()
        if not isinstance(state_dict, dict):
            raise ValueError("Unsupported torch artifact format")

        rnn_type = "gru" if any(str(k).startswith("gru.") for k in state_dict.keys()) else "lstm"
        prefix = "gru" if rnn_type == "gru" else "lstm"

        input_size = int(state_dict[f"{prefix}.weight_ih_l0"].shape[1])
        hidden_size = int(state_dict[f"{prefix}.weight_hh_l0"].shape[1])
        num_layers = len([k for k in state_dict.keys() if str(k).startswith(f"{prefix}.weight_ih_l")])
        fc1_out = int(state_dict["fc1.weight"].shape[0])
        num_classes = int(state_dict["fc2.weight"].shape[0])

        model = AttnRNNClassifier(
            rnn_type=rnn_type,
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            fc1_out=fc1_out,
            num_classes=num_classes,
        )
        model.load_state_dict(state_dict, strict=True)

        self._torch_cache[cache_key] = (model, input_size)
        return model, input_size

    def _find_scaler(self, symbol: str, timeframe: str, model_key: str) -> Any | None:
        model_dir = self._resolve_model_dir()
        candidates = [
            f"{symbol}_{timeframe}_{model_key.replace('rf', 'scaler').replace('xgb', 'scaler')}.joblib",
            f"{symbol}_{timeframe}_scaler.joblib",
            f"{symbol}_{timeframe}_with_sentiment_scaler.joblib",
            f"{symbol}_{timeframe}_no_sentiment_scaler.joblib",
        ]

        for filename in candidates:
            scaler_path = model_dir / filename
            if not scaler_path.exists() or joblib is None:
                continue
            cache_key = str(scaler_path)
            if cache_key in self._scaler_cache:
                return self._scaler_cache[cache_key]
            try:
                scaler = joblib.load(scaler_path)
                self._scaler_cache[cache_key] = scaler
                return scaler
            except Exception:
                continue
        return None

    def _extract_features(self, payload: dict[str, Any], model: Any) -> np.ndarray:
        expected = int(getattr(model, "n_features_in_", 12))
        features = payload.get("features")
        if features is None:
            sequence = payload.get("sequence")
            if sequence is not None:
                seq = np.asarray(sequence, dtype=float)
                if seq.ndim == 3:
                    matrix = seq[:, -1, :]
                    return np.resize(matrix, (matrix.shape[0], expected))
                if seq.ndim == 2:
                    matrix = seq[-1:, :]
                    return np.resize(matrix, (matrix.shape[0], expected))
            return np.zeros((1, expected), dtype=float)

        matrix = np.asarray(features, dtype=float)
        if matrix.ndim == 1:
            matrix = matrix.reshape(1, -1)
        if matrix.shape[1] != expected:
            matrix = np.resize(matrix, (matrix.shape[0], expected))
        return matrix

    def _extract_sequence_features(self, payload: dict[str, Any], input_size: int) -> np.ndarray:
        sequence = payload.get("sequence")
        if sequence is None:
            features = payload.get("features")
            if features is None:
                return np.zeros((1, 20, input_size), dtype=float)
            feature_array = np.asarray(features, dtype=float)
            if feature_array.ndim == 1:
                if feature_array.shape[0] == input_size:
                    return feature_array.reshape(1, 1, input_size)
                return np.resize(feature_array, (1, 1, input_size))
            if feature_array.ndim == 2:
                return np.resize(feature_array, (1, feature_array.shape[0], input_size))
            if feature_array.ndim == 3:
                return np.resize(feature_array, (feature_array.shape[0], feature_array.shape[1], input_size))
            return np.zeros((1, 20, input_size), dtype=float)

        seq_array = np.asarray(sequence, dtype=float)
        if seq_array.ndim == 2:
            return np.resize(seq_array, (1, seq_array.shape[0], input_size))
        if seq_array.ndim == 3:
            return np.resize(seq_array, (seq_array.shape[0], seq_array.shape[1], input_size))
        return np.zeros((1, 20, input_size), dtype=float)

    def _predict_proba(self, model: Any, features: np.ndarray) -> dict[str, float]:
        if not hasattr(model, "predict_proba"):
            return {}

        try:
            proba = model.predict_proba(features)
            row = proba[0]
            classes = getattr(model, "classes_", list(range(len(row))))
            return {str(classes[i]): float(row[i]) for i in range(len(row))}
        except Exception:
            return {}

    def _find_hybrid_gru_partner(self, xgb_artifact: ModelArtifact) -> ModelArtifact | None:
        for artifact in self._artifacts:
            if (
                artifact.symbol == xgb_artifact.symbol
                and artifact.timeframe == xgb_artifact.timeframe
                and artifact.model_key == "hybrid_gru"
                and artifact.extension in {".pt", ".pth"}
            ):
                return artifact
        return None

    def _build_probability_map(self, probs: np.ndarray) -> dict[str, float]:
        if probs.size == 0:
            return {}
        if probs.shape[0] == 3:
            labels = CLASS_LABELS_3
        else:
            labels = [str(i) for i in range(probs.shape[0])]
        return {labels[i]: float(probs[i]) for i in range(len(labels))}

    def _fuse_probabilities(self, base: dict[str, float], aux: dict[str, float]) -> dict[str, float]:
        if not base and not aux:
            return {}
        if not base:
            return aux
        if not aux:
            return base

        keys = set(base.keys()) | set(aux.keys())
        fused = {key: (float(base.get(key, 0.0)) + float(aux.get(key, 0.0))) / 2.0 for key in keys}
        total = sum(fused.values())
        if total <= 0:
            return fused
        return {key: value / total for key, value in fused.items()}

    @staticmethod
    def _family_for_extension(extension: str) -> str:
        if extension == ".joblib":
            return "ml"
        return "dl"


registry = ModelRegistry()
