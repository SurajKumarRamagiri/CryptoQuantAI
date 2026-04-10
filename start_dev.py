from __future__ import annotations

import os
import signal
import shutil
import subprocess
import sys
import threading
import time
from urllib.error import URLError
from urllib.request import urlopen
from pathlib import Path


ROOT = Path(__file__).resolve().parent
VENV_PYTHON = (
    ROOT / ".venv" / "Scripts" / "python.exe"
    if sys.platform == "win32"
    else ROOT / ".venv" / "bin" / "python"
)


def get_python_executable():
    """Get the Python executable from venv or system."""
    if VENV_PYTHON.exists():
        return str(VENV_PYTHON)
    return sys.executable


os.chdir(ROOT)


def load_env_file(env_path: Path) -> dict[str, str]:
    """Load environment variables from .env file."""
    env_vars = {}
    if env_path.exists():
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, value = line.split("=", 1)
                    env_vars[key.strip()] = value.strip()
    return env_vars


_env_vars = load_env_file(ROOT / ".env")
for key, value in _env_vars.items():
    os.environ.setdefault(key, value)


def check_port(port: int) -> bool:
    """Check if a port is in use."""
    try:
        if sys.platform == "win32":
            result = subprocess.run(
                f'netstat -ano | findstr "LISTENING" | findstr ":{port}"',
                shell=True,
                capture_output=True,
                text=True,
            )
            return bool(result.stdout.strip())
        else:
            result = subprocess.run(f"lsof -i :{port}", shell=True, capture_output=True)
            return result.returncode == 0
    except Exception:
        return False


def find_free_port(start: int = 8000) -> int:
    """Find a free port starting from given port."""
    port = start
    while port < start + 100:
        if not check_port(port):
            return port
        port += 1
    return start


def resolve_pnpm_command() -> list[str]:
    for candidate in ("pnpm", "pnpm.cmd", "pnpm.exe"):
        resolved = shutil.which(candidate)
        if resolved:
            return [resolved]

    for candidate in ("corepack", "corepack.cmd", "corepack.exe"):
        resolved = shutil.which(candidate)
        if resolved:
            return [resolved, "pnpm"]

    raise FileNotFoundError(
        "Could not find pnpm/corepack in PATH. Install Node.js + pnpm, "
        "or enable corepack, then reopen your terminal."
    )


def stream_output(name: str, pipe) -> None:
    for line in iter(pipe.readline, ""):
        print(f"[{name}] {line}", end="")
    pipe.close()


def start_service(
    name: str, command: list[str], cwd: Path = ROOT, extra_env: dict = None
) -> subprocess.Popen:
    env = os.environ.copy()
    env["PYTHONPATH"] = str(ROOT / "backend")
    if extra_env:
        env.update(extra_env)

    process = subprocess.Popen(
        command,
        cwd=cwd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
        env=env,
    )

    assert process.stdout is not None
    thread = threading.Thread(
        target=stream_output, args=(name, process.stdout), daemon=True
    )
    thread.start()
    return process


def stop_service(process: subprocess.Popen) -> None:
    if process.poll() is not None:
        return

    process.terminate()
    try:
        process.wait(timeout=8)
    except subprocess.TimeoutExpired:
        process.kill()


def ensure_uvicorn_available() -> bool:
    python_exec = get_python_executable()
    check = subprocess.run(
        [python_exec, "-c", "import uvicorn"],
        cwd=ROOT,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        text=True,
    )
    return check.returncode == 0


def wait_for_backend(port: int = 8000, timeout_seconds: int = 60) -> bool:
    deadline = time.time() + timeout_seconds
    while time.time() < deadline:
        try:
            with urlopen(f"http://127.0.0.1:{port}/health", timeout=2) as response:
                if response.status == 200:
                    return True
        except (URLError, TimeoutError):
            time.sleep(1)
    return False


def main() -> int:
    print("[INFO] Killing any process on port 8000...")
    try:
        if sys.platform == "win32":
            os.system(
                "netstat -ano | findstr :8000 | findstr LISTENING > temp_ports.txt"
            )
            if Path("temp_ports.txt").exists():
                with open("temp_ports.txt", "r") as f:
                    for line in f:
                        parts = line.split()
                        if len(parts) >= 5 and parts[-1].isdigit():
                            pid = parts[-1]
                            os.system(f"taskkill /F /PID {pid} 2>nul")
                Path("temp_ports.txt").unlink(missing_ok=True)
        else:
            os.system("lsof -ti:8000 | xargs kill -9 2>/dev/null")
    except Exception:
        pass
    time.sleep(2)

    backend_port = 8000

    if not ensure_uvicorn_available():
        print("[ERROR] uvicorn is not available in the current Python environment.")
        print("[INFO] Activate your project venv and install backend dependencies:")
        print("[INFO] pip install -r backend/requirements.txt")
        return 1

    try:
        pnpm_command = resolve_pnpm_command()
    except FileNotFoundError as exc:
        print(f"[ERROR] {exc}")
        print("[INFO] Try: npm i -g pnpm")
        print("[INFO] Or: corepack enable")
        return 1

    env = os.environ.copy()
    env["PYTHONPATH"] = str(ROOT / "backend")
    env.update(_env_vars)

    print(f"[INFO] Starting backend on http://127.0.0.1:{backend_port} ...")
    python_exec = get_python_executable()
    backend = subprocess.Popen(
        [
            python_exec,
            "-m",
            "uvicorn",
            "app.main:app",
            "--host",
            "127.0.0.1",
            "--port",
            str(backend_port),
            "--app-dir",
            "backend",
        ],
        cwd=ROOT,
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
    )

    backend_thread = threading.Thread(
        target=stream_output, args=("backend", backend.stdout), daemon=True
    )
    backend_thread.start()

    if not wait_for_backend(backend_port):
        print(
            f"[ERROR] Backend did not become healthy on http://127.0.0.1:{backend_port}/health"
        )
        return 1

    print("[INFO] Starting frontend on http://localhost:5173 ...")
    frontend = subprocess.Popen(
        [*pnpm_command, "dev"],
        cwd=ROOT / "frontend",
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
    )

    frontend_thread = threading.Thread(
        target=stream_output, args=("frontend", frontend.stdout), daemon=True
    )
    frontend_thread.start()

    services = [backend, frontend]

    print("[INFO] Both services started successfully!")
    print(f"[INFO] Backend:  http://127.0.0.1:{backend_port}")
    print("[INFO] Frontend: http://localhost:5173 (or next available port)")
    print("[INFO] Press Ctrl+C to stop all services")

    def _shutdown(signum, _frame) -> None:
        print("\n[INFO] Stopping services...")
        for p in services:
            p.terminate()
            try:
                p.wait(timeout=5)
            except subprocess.TimeoutExpired:
                p.kill()
        raise SystemExit(0)

    signal.signal(signal.SIGINT, _shutdown)
    if hasattr(signal, "SIGTERM"):
        signal.signal(signal.SIGTERM, _shutdown)

    try:
        while True:
            for proc in services:
                if proc.poll() is not None:
                    print(f"[WARN] A service exited. Stopping the other...")
                    for other in services:
                        if other is not proc:
                            other.terminate()
                    return proc.returncode or 0
            threading.Event().wait(0.5)
    except KeyboardInterrupt:
        _shutdown(signal.SIGINT, None)
        return 0

    if not ensure_uvicorn_available():
        print("[ERROR] uvicorn is not available in the current Python environment.")
        print("[INFO] Activate your project venv and install backend dependencies:")
        print("[INFO] pip install -r backend/requirements.txt")
        return 1

    try:
        pnpm_command = resolve_pnpm_command()
    except FileNotFoundError as exc:
        print(f"[ERROR] {exc}")
        print("[INFO] Try: npm i -g pnpm")
        print("[INFO] Or: corepack enable")
        return 1

    print(f"[INFO] Starting backend on http://127.0.0.1:{backend_port} ...")
    backend = start_service(
        "backend",
        [
            sys.executable,
            "-m",
            "uvicorn",
            "app.main:app",
            "--host",
            "127.0.0.1",
            "--port",
            str(backend_port),
            "--app-dir",
            "backend",
        ],
        cwd=ROOT,
        extra_env=_env_vars,
    )

    if not wait_for_backend(backend_port):
        print(
            f"[ERROR] Backend did not become healthy on http://127.0.0.1:{backend_port}/health"
        )
        stop_service(backend)
        return 1

    print("[INFO] Starting frontend on http://localhost:5173 ...")
    frontend = start_service(
        "frontend",
        [*pnpm_command, "dev:frontend"],
        extra_env=_env_vars,
    )
    services = [backend, frontend]

    print("[INFO] Both services started successfully!")
    print(f"[INFO] Backend:  http://127.0.0.1:{backend_port}")
    print("[INFO] Frontend: http://localhost:5173 (or next available port)")
    print("[INFO] Press Ctrl+C to stop all services")

    def _shutdown(signum, _frame) -> None:
        print("\n[INFO] Stopping services...")
        for proc in services:
            stop_service(proc)
        raise SystemExit(0)

    signal.signal(signal.SIGINT, _shutdown)
    if hasattr(signal, "SIGTERM"):
        signal.signal(signal.SIGTERM, _shutdown)

    try:
        while True:
            for proc in services:
                if proc.poll() is not None:
                    print(f"[WARN] A service exited. Stopping the other service...")
                    for other in services:
                        if other is not proc:
                            stop_service(other)
                    return proc.returncode or 0
            threading.Event().wait(0.5)
    except KeyboardInterrupt:
        _shutdown(signal.SIGINT, None)
        return 0


if __name__ == "__main__":
    sys.exit(main())
