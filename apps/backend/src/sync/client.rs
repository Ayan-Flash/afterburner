use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::thread;
use std::time::Duration;

use tracing::{error, info};

use super::protocol::{DeviceInfo, SyncDirection, SyncManifest, SyncPayload, SyncResult};
use super::store::{SyncState, SyncStore};

pub struct SyncClient {
    running: Arc<AtomicBool>,
    state: Arc<std::sync::Mutex<SyncState>>,
}

impl SyncClient {
    pub fn new() -> Self {
        let store = SyncStore::new();
        let state = store.load();
        Self {
            running: Arc::new(AtomicBool::new(false)),
            state: Arc::new(std::sync::Mutex::new(state)),
        }
    }

    pub fn get_state(&self) -> SyncState {
        self.state.lock().unwrap().clone()
    }

    pub fn update_state(&self, f: impl FnOnce(&mut SyncState)) {
        let mut state = self.state.lock().unwrap();
        f(&mut state);
        let store = SyncStore::new();
        store.save(&state);
    }

    pub fn device_info(&self) -> DeviceInfo {
        let state = self.get_state();
        DeviceInfo {
            device_id: state.device_id,
            machine_name: std::env::var("COMPUTERNAME")
                .unwrap_or_else(|_| "unknown".into()),
            os: std::env::consts::OS.into(),
            version: env!("CARGO_PKG_VERSION").into(),
            gpu_count: 0,
        }
    }

    pub fn start(&self) {
        if self.running.load(Ordering::SeqCst) {
            return;
        }
        self.running.store(true, Ordering::SeqCst);
        let running = self.running.clone();
        let state_arc = self.state.clone();

        thread::spawn(move || {
            info!("Sync client started");

            while running.load(Ordering::SeqCst) {
                let state = state_arc.lock().unwrap().clone();

                if state.enabled && !state.server_url.is_empty() {
                    if let Err(e) = Self::do_sync(&state) {
                        error!("Sync failed: {e}");
                    }
                }

                for _ in 0..30 {
                    if !running.load(Ordering::SeqCst) {
                        return;
                    }
                    thread::sleep(Duration::from_secs(1));
                }
            }
        });
    }

    pub fn stop(&self) {
        self.running.store(false, Ordering::SeqCst);
    }

    pub fn is_running(&self) -> bool {
        self.running.load(Ordering::SeqCst)
    }

    pub fn sync_now(&self) -> Result<SyncResult, String> {
        let state = self.get_state();
        if state.server_url.is_empty() {
            return Err("No sync server configured".into());
        }
        Self::do_sync(&state)
    }

    fn do_sync(state: &SyncState) -> Result<SyncResult, String> {
        let profiles: Option<String> = None;

        let client = reqwest::blocking::Client::new();
        let payload = SyncPayload {
            profiles_json: profiles,
            reports_json: None,
            policies_json: None,
            device_info: None,
        };

        let resp = client
            .post(format!("{}/api/sync", state.server_url.trim_end_matches('/')))
            .header("Authorization", format!("Bearer {}", state.api_key))
            .json(&payload)
            .send()
            .map_err(|e| format!("Sync request failed: {e}"))?;

        if !resp.status().is_success() {
            return Err(format!("Sync server returned {}", resp.status()));
        }

        let result: SyncResult = resp
            .json()
            .map_err(|e| format!("Failed to parse sync response: {e}"))?;

        let store = SyncStore::new();
        let mut sync_state = store.load();
        sync_state.last_sync_at = Some(
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap_or_default()
                .as_secs() as i64,
        );
        store.save(&sync_state);

        info!("Sync completed: {} profiles, {} reports", result.profiles_synced, result.reports_synced);
        Ok(result)
    }

    pub fn register_device(&self, server_url: &str, api_key: &str) -> Result<(), String> {
        let info = self.device_info();
        let client = reqwest::blocking::Client::new();

        let resp = client
            .post(format!("{}/api/register", server_url.trim_end_matches('/')))
            .header("Authorization", format!("Bearer {}", api_key))
            .json(&info)
            .send()
            .map_err(|e| format!("Registration failed: {e}"))?;

        if !resp.status().is_success() {
            return Err(format!("Registration returned {}", resp.status()));
        }

        self.update_state(|s| {
            s.server_url = server_url.into();
            s.api_key = api_key.into();
            s.registered = true;
        });

        Ok(())
    }

    pub fn unregister(&self) {
        self.update_state(|s| {
            s.registered = false;
            s.api_key.clear();
        });
    }
}
