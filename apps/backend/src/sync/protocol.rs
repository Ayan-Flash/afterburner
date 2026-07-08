use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeviceInfo {
    pub device_id: String,
    pub machine_name: String,
    pub os: String,
    pub version: String,
    pub gpu_count: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyncManifest {
    pub profiles_updated_at: Option<i64>,
    pub reports_updated_at: Option<i64>,
    pub policies_version: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyncPayload {
    pub profiles_json: Option<String>,
    pub reports_json: Option<String>,
    pub policies_json: Option<String>,
    pub device_info: Option<DeviceInfo>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyncStatus {
    pub last_sync_at: Option<i64>,
    pub next_sync_at: Option<i64>,
    pub is_syncing: bool,
    pub error: Option<String>,
    pub server_url: String,
    pub device_registered: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SyncDirection {
    Upload,
    Download,
    Bidirectional,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyncResult {
    pub success: bool,
    pub profiles_synced: usize,
    pub reports_synced: usize,
    pub policies_synced: bool,
    pub error: Option<String>,
}
