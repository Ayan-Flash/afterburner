use std::io::Read;
use std::sync::Arc;
use std::sync::atomic::{AtomicBool, Ordering};
use std::thread;

use serde_json::Value;
use tracing::{error, info};

use super::protocol::{DeviceInfo, SyncPayload, SyncResult};

pub struct SyncServer {
    running: Arc<AtomicBool>,
    port: u16,
}

impl SyncServer {
    pub fn new(port: u16) -> Self {
        Self {
            running: Arc::new(AtomicBool::new(false)),
            port,
        }
    }

    pub fn start(&self) -> Result<(), String> {
        if self.running.load(Ordering::SeqCst) {
            return Err("Sync server is already running".into());
        }

        self.running.store(true, Ordering::SeqCst);
        let running = self.running.clone();
        let port = self.port;

        thread::spawn(move || {
            let addr = format!("127.0.0.1:{}", port);
            let server = match tiny_http::Server::http(&addr) {
                Ok(s) => {
                    info!("Cloud sync server started on {addr}");
                    s
                }
                Err(e) => {
                    error!("Failed to start sync server on {addr}: {e}");
                    return;
                }
            };

            while running.load(Ordering::SeqCst) {
                match server.recv_timeout(std::time::Duration::from_millis(500)) {
                    Ok(Some(mut request)) => {
                        let response = Self::handle_request(&mut request);
                        let _ = request.respond(response);
                    }
                    Ok(None) => {}
                    Err(e) => {
                        error!("Sync server recv error: {e}");
                    }
                }
            }
        });

        Ok(())
    }

    pub fn stop(&self) {
        self.running.store(false, Ordering::SeqCst);
    }

    pub fn is_running(&self) -> bool {
        self.running.load(Ordering::SeqCst)
    }

    fn read_body(request: &mut tiny_http::Request) -> String {
        let mut body = String::new();
        let mut reader = request.as_reader();
        let _ = reader.read_to_string(&mut body);
        body
    }

    fn handle_request(request: &mut tiny_http::Request) -> tiny_http::Response<std::io::Cursor<Vec<u8>>> {
        let url = request.url().to_string();
        let method = request.method().as_str().to_string();

        let (status, body) = match (method.as_str(), url.as_str()) {
            ("POST", "/api/register") => Self::handle_register(request),
            ("POST", "/api/sync") => Self::handle_sync(request),
            ("GET", "/api/status") => Self::handle_status(),
            _ => (404, serde_json::json!({"error": "not found"}).to_string()),
        };

        tiny_http::Response::from_string(body)
            .with_status_code(status)
            .with_header(
                "Content-Type: application/json"
                    .parse::<tiny_http::Header>()
                    .unwrap(),
            )
            .with_header(
                "Access-Control-Allow-Origin: *"
                    .parse::<tiny_http::Header>()
                    .unwrap(),
            )
    }

    fn handle_register(request: &mut tiny_http::Request) -> (u16, String) {
        let body = Self::read_body(request);
        match serde_json::from_str::<DeviceInfo>(&body) {
            Ok(info) => {
                info!("Device registered: {} ({})", info.machine_name, info.device_id);
                let resp = serde_json::json!({
                    "success": true,
                    "device_id": info.device_id,
                    "message": "Device registered successfully"
                });
                (200, resp.to_string())
            }
            Err(e) => {
                let resp = serde_json::json!({"error": format!("Invalid registration: {e}")});
                (400, resp.to_string())
            }
        }
    }

    fn handle_sync(request: &mut tiny_http::Request) -> (u16, String) {
        let body = Self::read_body(request);
        match serde_json::from_str::<SyncPayload>(&body) {
            Ok(payload) => {
                let profiles_count = payload.profiles_json.as_ref()
                    .and_then(|j| serde_json::from_str::<Vec<Value>>(j).ok())
                    .map(|v| v.len())
                    .unwrap_or(0);

                let reports_count = payload.reports_json.as_ref()
                    .and_then(|j| serde_json::from_str::<Vec<Value>>(j).ok())
                    .map(|v| v.len())
                    .unwrap_or(0);

                let result = SyncResult {
                    success: true,
                    profiles_synced: profiles_count,
                    reports_synced: reports_count,
                    policies_synced: false,
                    error: None,
                };
                (200, serde_json::to_string(&result).unwrap_or_default())
            }
            Err(e) => {
                let resp = serde_json::json!({"error": format!("Invalid sync payload: {e}")});
                (400, resp.to_string())
            }
        }
    }

    fn handle_status() -> (u16, String) {
        let resp = serde_json::json!({
            "status": "running",
            "version": env!("CARGO_PKG_VERSION"),
            "uptime": "N/A",
        });
        (200, resp.to_string())
    }
}
