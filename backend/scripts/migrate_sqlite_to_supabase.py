from __future__ import annotations

import argparse
from pathlib import Path
import sys

from sqlalchemy import MetaData, Table, create_engine, select
from sqlalchemy.dialects.postgresql import insert as pg_insert

sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.core.config import settings

TABLES = [
    "user_account",
    "portfolio",
    "portfolio_holding",
    "paper_order",
    "credit_ledger",
]


def migrate(sqlite_path: Path) -> None:
    if not sqlite_path.exists():
        raise FileNotFoundError(f"SQLite file not found: {sqlite_path}")

    db_url = (settings.db_url or "").strip()
    if not db_url:
        raise RuntimeError("DATABASE_URL is missing. Set it to your Supabase PostgreSQL URL.")

    source_engine = create_engine(f"sqlite:///{sqlite_path.as_posix()}", future=True)
    target_engine = create_engine(db_url, future=True)

    source_meta = MetaData()
    target_meta = MetaData()

    summary: dict[str, dict[str, int]] = {}

    with source_engine.connect() as source_conn, target_engine.begin() as target_conn:
        for table_name in TABLES:
            src_table = Table(table_name, source_meta, autoload_with=source_engine)
            dst_table = Table(table_name, target_meta, autoload_with=target_engine)

            rows = [dict(row._mapping) for row in source_conn.execute(select(src_table)).all()]
            if not rows:
                summary[table_name] = {"source": 0, "inserted": 0}
                continue

            pk_cols = [column.name for column in dst_table.primary_key.columns]
            if not pk_cols:
                raise RuntimeError(f"Table {table_name} has no primary key in target DB")

            inserted = 0
            batch_size = 500
            for start in range(0, len(rows), batch_size):
                batch = rows[start : start + batch_size]
                stmt = pg_insert(dst_table).values(batch)
                stmt = stmt.on_conflict_do_nothing(index_elements=pk_cols)
                result = target_conn.execute(stmt)
                inserted += max(result.rowcount or 0, 0)

            summary[table_name] = {"source": len(rows), "inserted": inserted}

    print("Migration completed")
    print(f"Source SQLite: {sqlite_path}")
    print(f"Target Supabase: {target_engine.url}")
    for table_name in TABLES:
        stats = summary.get(table_name, {"source": 0, "inserted": 0})
        print(f"{table_name}: source={stats['source']} inserted={stats['inserted']}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Migrate local SQLite data into Supabase PostgreSQL")
    parser.add_argument(
        "--sqlite-path",
        default=str(Path(__file__).resolve().parents[1] / "dev.db"),
        help="Path to source SQLite database (default: backend/dev.db)",
    )
    args = parser.parse_args()
    migrate(Path(args.sqlite_path).resolve())


if __name__ == "__main__":
    main()
