use serde::Serialize;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::thread;
use tracing::{error, info};

#[derive(Debug, Clone, Serialize)]
pub struct ObsMetric {
    pub label: String,
    pub value: String,
    pub unit: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct ObsPayload {
    pub gpu_name: String,
    pub metrics: Vec<ObsMetric>,
    pub timestamp: u64,
}

pub struct ObsSource {
    running: Arc<AtomicBool>,
    port: u16,
}

impl ObsSource {
    pub fn new(port: u16) -> Self {
        Self {
            running: Arc::new(AtomicBool::new(false)),
            port,
        }
    }

    pub fn start(
        &self,
        get_metrics: Box<dyn Fn() -> ObsPayload + Send + Sync + 'static>,
    ) -> Result<(), String> {
        if self.running.load(Ordering::SeqCst) {
            return Err("OBS source is already running".into());
        }

        self.running.store(true, Ordering::SeqCst);
        let running = self.running.clone();
        let port = self.port;

        thread::spawn(move || {
            let addr = format!("127.0.0.1:{}", port);
            let server = match tiny_http::Server::http(&addr) {
                Ok(s) => {
                    info!("OBS Browser Source server started on {addr}");
                    s
                }
                Err(e) => {
                    error!("Failed to start OBS source server on {addr}: {e}");
                    return;
                }
            };

            while running.load(Ordering::SeqCst) {
                match server.recv_timeout(std::time::Duration::from_millis(500)) {
                    Ok(Some(request)) => {
                        let payload = get_metrics();
                        let json = serde_json::to_string(&payload).unwrap_or_default();
                        let response = tiny_http::Response::from_string(json)
                            .with_header(
                                "Access-Control-Allow-Origin: *"
                                    .parse::<tiny_http::Header>()
                                    .unwrap(),
                            )
                            .with_header(
                                "Content-Type: application/json"
                                    .parse::<tiny_http::Header>()
                                    .unwrap(),
                            );
                        let _ = request.respond(response);
                    }
                    Ok(None) => {}
                    Err(e) => {
                        error!("OBS server recv error: {e}");
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
}
