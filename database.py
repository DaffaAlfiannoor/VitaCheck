import os
import sqlite3
from contextlib import contextmanager

DB_PATH = os.path.join(os.path.dirname(__file__), "vitacheck.db")


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


@contextmanager
def get_db():
    conn = get_connection()
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db():
    with get_db() as conn:
        try:
            conn.execute("ALTER TABLE users ADD COLUMN health_target TEXT")
        except sqlite3.OperationalError:
            pass  # Column might already exist
        
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at TEXT DEFAULT (datetime('now'))
            );
                
            CREATE TABLE IF NOT EXISTS predictions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER REFERENCES users(id),
                daily_screen_time_hours REAL,
                phone_usage_before_sleep_minutes INTEGER,
                sleep_duration_hours REAL,
                sleep_quality_score INTEGER,
                physical_activity_minutes INTEGER,
                notifications_received_per_day INTEGER,
                caffeine_intake_cups INTEGER,
                stress_level INTEGER,
                mental_fatigue_score INTEGER,
                risk_label TEXT,
                risk_score REAL,
                confidence REAL,
                created_at TEXT DEFAULT (datetime('now'))
            );
        """)
