"""
Database connection and session management using SQLAlchemy 2.0.
Supports PostgreSQL with TimescaleDB extensions and provides automatic SQLite fallback
for seamless local development and automated testing environments.
"""

from typing import Generator
from sqlalchemy import create_engine, text, Engine
from sqlalchemy.orm import sessionmaker, Session
from app.config import settings
from app.core.logging import get_logger
from app.models.base import Base

logger = get_logger("railblock.database")


def build_engine() -> tuple[Engine, str]:
    """
    Constructs the SQLAlchemy engine. Attempts connection to configured primary database.
    If primary PostgreSQL database is unreachable, gracefully falls back to local SQLite.
    """
    primary_url = settings.sync_database_url

    if primary_url.startswith("postgresql"):
        try:
            temp_engine = create_engine(
                primary_url,
                pool_pre_ping=True,
                future=True,
                connect_args={"connect_timeout": 1},
            )
            with temp_engine.connect():
                pass
            logger.info("Connected to PostgreSQL database", url=primary_url)
            return temp_engine, primary_url
        except Exception as exc:
            try:
                temp_engine.dispose()
            except Exception:
                pass
            fallback_url = "sqlite:///railblock_dev.db"
            logger.warning(
                "PostgreSQL instance unreachable. Falling back to local SQLite database.",
                reason=str(exc),
                fallback_url=fallback_url,
            )
            sqlite_engine = create_engine(
                fallback_url,
                echo=False,
                future=True,
                connect_args={"check_same_thread": False},
            )
            return sqlite_engine, fallback_url
    else:
        sqlite_engine = create_engine(
            primary_url,
            echo=False,
            future=True,
            connect_args={"check_same_thread": False},
        )
        return sqlite_engine, primary_url


engine, active_database_url = build_engine()

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    expire_on_commit=False,
)


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency yielding a database session with guaranteed teardown.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """
    Initializes database tables and enables TimescaleDB extensions if available.
    """
    logger.info("Initializing database schema...", database_url=active_database_url)

    # Import all models to ensure metadata is registered
    import app.models  # noqa: F401

    # Create all defined tables
    Base.metadata.create_all(bind=engine)

    # If running on PostgreSQL, enable TimescaleDB hypertable for train_timetable
    if "postgresql" in active_database_url:
        try:
            with engine.connect() as conn:
                logger.info("Configuring TimescaleDB extension and hypertables...")
                conn.execute(text("CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;"))
                # Adjust composite PK for TimescaleDB partitioning requirement
                conn.execute(text("ALTER TABLE train_timetable DROP CONSTRAINT IF EXISTS train_timetable_pkey CASCADE;"))
                conn.execute(text("ALTER TABLE train_timetable ADD PRIMARY KEY (id, arrival_time);"))
                conn.execute(
                    text(
                        "SELECT create_hypertable('train_timetable', 'arrival_time', if_not_exists => TRUE, migrate_data => TRUE);"
                    )
                )
                conn.commit()
                logger.info("TimescaleDB extension and hypertables configured successfully.")
        except Exception as exc:
            logger.warning(
                "TimescaleDB hypertable setup skipped or fallback to standard PostgreSQL",
                error=str(exc),
            )

    logger.info("Database schema initialized successfully.")
