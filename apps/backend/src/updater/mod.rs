pub mod commands;

use std::sync::atomic::{AtomicBool, AtomicU8};
use std::sync::Arc;
use tokio::sync::Mutex;

#[derive(Debug, Clone, PartialEq, serde::Serialize, serde::Deserialize)]
pub struct UpdateInfo {
    pub version: String,
    pub date: String,
    pub body: String,
    pub download_url: String,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, PartialEq)]
pub enum UpdateStatus {
    Idle,
    Checking,
    Available(UpdateInfo),
    Downloading(u16),
    Downloaded(UpdateInfo),
    Installing,
    Error(String),
    UpToDate,
}

impl Default for UpdateStatus {
    fn default() -> Self {
        Self::Idle
    }
}

pub struct UpdaterState {
    pub status: Arc<Mutex<UpdateStatus>>,
    pub auto_check_enabled: AtomicBool,
    pub check_interval_hours: AtomicU8,
}

impl UpdaterState {
    pub fn new() -> Self {
        Self {
            status: Arc::new(Mutex::new(UpdateStatus::Idle)),
            auto_check_enabled: AtomicBool::new(true),
            check_interval_hours: AtomicU8::new(24),
        }
    }
}

impl Default for UpdaterState {
    fn default() -> Self {
        Self::new()
    }
}
