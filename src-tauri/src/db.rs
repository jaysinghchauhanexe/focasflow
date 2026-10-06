use rusqlite::{Connection, Result};
use std::fs;
use std::path::PathBuf;

pub fn get_db_path() -> PathBuf {
    let mut path = dirs::data_dir().unwrap_or_else(|| PathBuf::from("."));
    path.push("com.focusflow.app");
    let _ = fs::create_dir_all(&path);
    path.push("focusflow.db");
    path
}

pub fn init_database() -> Result<Connection> {
    let db_path = get_db_path();
    let conn = Connection::open(db_path)?;

    conn.execute_batch(
        "
        CREATE TABLE IF NOT EXISTS tasks (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            duration INTEGER NOT NULL,
            priority TEXT NOT NULL,
            status TEXT NOT NULL,
            deadline TEXT,
            scheduled_date TEXT,
            scheduled_start TEXT,
            scheduled_end TEXT,
            category TEXT NOT NULL,
            project_id TEXT,
            energy_level TEXT,
            flexibility TEXT,
            moved_count INTEGER DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS habits (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            category TEXT NOT NULL,
            duration INTEGER NOT NULL,
            frequency TEXT NOT NULL,
            preferred_time TEXT NOT NULL,
            target INTEGER NOT NULL DEFAULT 1,
            completed_dates TEXT NOT NULL DEFAULT '[]',
            active INTEGER NOT NULL DEFAULT 1,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS routines (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            type TEXT NOT NULL,
            preferred_time TEXT NOT NULL,
            items TEXT NOT NULL,
            active INTEGER NOT NULL DEFAULT 1
        );

        CREATE TABLE IF NOT EXISTS goals (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            category TEXT NOT NULL,
            target_date TEXT,
            progress INTEGER NOT NULL DEFAULT 0,
            description TEXT,
            projects TEXT NOT NULL DEFAULT '[]'
        );

        CREATE TABLE IF NOT EXISTS schedule_blocks (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            block_type TEXT NOT NULL,
            item_id TEXT,
            date TEXT NOT NULL,
            start_time TEXT NOT NULL,
            end_time TEXT NOT NULL,
            category TEXT NOT NULL,
            is_fixed INTEGER NOT NULL DEFAULT 0,
            completed INTEGER NOT NULL DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS history_logs (
            id TEXT PRIMARY KEY,
            date TEXT NOT NULL,
            planned_minutes INTEGER NOT NULL,
            completed_minutes INTEGER NOT NULL,
            moved_minutes INTEGER NOT NULL,
            skipped_minutes INTEGER NOT NULL,
            completed_tasks_count INTEGER NOT NULL,
            total_tasks_count INTEGER NOT NULL,
            notes TEXT
        );

        CREATE TABLE IF NOT EXISTS app_settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        );
        ",
    )?;

    Ok(conn)
}
