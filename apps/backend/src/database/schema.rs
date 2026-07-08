use rusqlite::Connection;

pub fn initialize(conn: &Connection) -> Result<(), rusqlite::Error> {
    conn.execute_batch("PRAGMA journal_mode=WAL;")?;
    conn.execute_batch("PRAGMA foreign_keys=ON;")?;

    conn.execute_batch(
        "
        CREATE TABLE IF NOT EXISTS schema_version (
            version INTEGER PRIMARY KEY,
            applied_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS samples (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            gpu_id TEXT NOT NULL,
            timestamp INTEGER NOT NULL,
            temperature_celsius REAL NOT NULL,
            core_clock_mhz REAL NOT NULL,
            memory_clock_mhz REAL NOT NULL,
            memory_used_mb INTEGER NOT NULL,
            memory_total_mb INTEGER NOT NULL,
            fan_speed_percent REAL NOT NULL,
            fan_rpm INTEGER NOT NULL,
            power_watts REAL NOT NULL,
            core_voltage_mv REAL NOT NULL,
            core_utilization_percent REAL NOT NULL,
            memory_utilization_percent REAL NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_samples_gpu_time
            ON samples(gpu_id, timestamp DESC);

        CREATE TABLE IF NOT EXISTS alert_events (
            id TEXT PRIMARY KEY,
            gpu_id TEXT NOT NULL,
            rule_id TEXT NOT NULL,
            metric TEXT NOT NULL,
            severity TEXT NOT NULL,
            message TEXT NOT NULL,
            value REAL NOT NULL,
            threshold REAL NOT NULL,
            timestamp INTEGER NOT NULL,
            acknowledged INTEGER NOT NULL DEFAULT 0
        );

        CREATE INDEX IF NOT EXISTS idx_alerts_gpu_time
            ON alert_events(gpu_id, timestamp DESC);

        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS profiles (
            name TEXT NOT NULL,
            gpu_id TEXT NOT NULL,
            core_offset INTEGER NOT NULL DEFAULT 0,
            mem_offset INTEGER NOT NULL DEFAULT 0,
            voltage_offset INTEGER NOT NULL DEFAULT 0,
            fan_speed REAL NOT NULL DEFAULT 0,
            power_limit REAL NOT NULL DEFAULT 100,
            created_at TEXT NOT NULL,
            PRIMARY KEY (name, gpu_id)
        );

        CREATE TABLE IF NOT EXISTS automation_rules (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            enabled INTEGER NOT NULL DEFAULT 1,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS automation_conditions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            rule_id TEXT NOT NULL,
            metric TEXT NOT NULL,
            operator TEXT NOT NULL,
            value REAL NOT NULL,
            FOREIGN KEY (rule_id) REFERENCES automation_rules(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS automation_actions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            rule_id TEXT NOT NULL,
            action_type TEXT NOT NULL,
            target TEXT NOT NULL,
            value REAL NOT NULL,
            FOREIGN KEY (rule_id) REFERENCES automation_rules(id) ON DELETE CASCADE
        );
        ",
    )?;

    let version: i64 = conn
        .query_row(
            "SELECT COALESCE(MAX(version), 0) FROM schema_version",
            [],
            |row| row.get(0),
        )
        .unwrap_or(0);

    if version < 1 {
        conn.execute("INSERT INTO schema_version (version) VALUES (1)", [])?;
    }

    Ok(())
}
