pub mod schema;
pub mod store;

use std::path::PathBuf;
use std::sync::Mutex;

use rusqlite::Connection;

pub struct Database {
    conn: Mutex<Connection>,
    data_dir: PathBuf,
}

impl Database {
    pub fn open() -> Result<Self, rusqlite::Error> {
        let data_dir = crate::utils::logging::log_dir()
            .parent()
            .map(|p| p.to_path_buf())
            .unwrap_or_else(|| {
                dirs_next::config_dir()
                    .unwrap_or_else(|| PathBuf::from("."))
                    .join("gpucontrol-pro")
            });

        std::fs::create_dir_all(&data_dir).ok();

        let db_path = data_dir.join("gpucontrol.db");
        let conn = Connection::open(&db_path)?;

        conn.execute_batch("PRAGMA journal_mode=WAL;")?;
        conn.execute_batch("PRAGMA foreign_keys=ON;")?;

        schema::initialize(&conn)?;

        tracing::info!("Database opened at {:?}", db_path);

        Ok(Self {
            conn: Mutex::new(conn),
            data_dir,
        })
    }

    pub fn conn(&self) -> std::sync::MutexGuard<'_, Connection> {
        self.conn.lock().expect("database lock poisoned")
    }

    pub fn data_dir(&self) -> &PathBuf {
        &self.data_dir
    }
}
