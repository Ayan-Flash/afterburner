use std::net::TcpListener;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::thread;

use serde_json::Value;
use tracing::{error, info};

use super::api::RemoteApi;
use super::auth::AuthManager;

const POLL_INTERVAL_MS: u64 = 50;

enum HttpMethod {
    Get,
    Post,
    Delete,
    Unknown,
}

impl HttpMethod {
    fn from_str(s: &str) -> Self {
        match s.to_uppercase().as_str() {
            "GET" => HttpMethod::Get,
            "POST" => HttpMethod::Post,
            "DELETE" => HttpMethod::Delete,
            _ => HttpMethod::Unknown,
        }
    }
}

struct HttpRequest {
    method: HttpMethod,
    path: String,
    auth_header: Option<String>,
    _body: Option<String>,
}

struct HttpResponse {
    status: u16,
    content_type: &'static str,
    body: String,
}

impl HttpResponse {
    fn json(status: u16, body: &Value) -> Self {
        Self {
            status,
            content_type: "application/json",
            body: serde_json::to_string(body).unwrap_or_default(),
        }
    }

    fn html(body: &str) -> Self {
        Self {
            status: 200,
            content_type: "text/html",
            body: body.to_string(),
        }
    }

    fn error(status: u16, message: &str) -> Self {
        Self::json(status, &serde_json::json!({ "error": message }))
    }

    fn to_bytes(&self) -> Vec<u8> {
        let status_text = match self.status {
            200 => "200 OK",
            201 => "201 Created",
            204 => "204 No Content",
            400 => "400 Bad Request",
            401 => "401 Unauthorized",
            404 => "404 Not Found",
            405 => "405 Method Not Allowed",
            500 => "500 Internal Server Error",
            _ => "500 Internal Server Error",
        };

        let headers = format!(
            "HTTP/1.1 {}\r\nContent-Type: {}\r\nContent-Length: {}\r\nAccess-Control-Allow-Origin: *\r\nAccess-Control-Allow-Methods: GET, POST, DELETE, OPTIONS\r\nAccess-Control-Allow-Headers: Authorization, Content-Type\r\nConnection: close\r\n\r\n",
            status_text,
            self.content_type,
            self.body.len()
        );

        let mut bytes = headers.into_bytes();
        bytes.extend_from_slice(self.body.as_bytes());
        bytes
    }
}

fn route_request(req: &HttpRequest, api: &RemoteApi, auth: &AuthManager, dashboard_html: &str) -> HttpResponse {
    if !req.auth_header.is_some() && req.path != "/" && req.path != "/api/status" && auth.is_enabled() {
        return HttpResponse::error(401, "Unauthorized - provide API key in Authorization header");
    }

    if let Some(ref header) = req.auth_header {
        if !auth.validate(Some(header)) {
            return HttpResponse::error(401, "Unauthorized - invalid API key");
        }
    }

    match (req.method, req.path.as_str()) {
        (HttpMethod::Get, "/") => HttpResponse::html(dashboard_html),

        (HttpMethod::Get, "/api/status") => HttpResponse::json(200, &api.get_status()),

        (HttpMethod::Get, "/api/gpus") => HttpResponse::json(200, &api.list_gpus()),

        (HttpMethod::Get, p) if p.starts_with("/api/gpus/") && p.ends_with("/data") => {
            let gpu_id = &p["/api/gpus/".len()..p.len() - "/data".len()];
            if gpu_id.is_empty() {
                return HttpResponse::error(400, "Missing GPU ID");
            }
            HttpResponse::json(200, &api.get_gpu_data(gpu_id))
        }

        (HttpMethod::Get, p) if p.starts_with("/api/gpus/") && p.ends_with("/history") => {
            let rest = &p["/api/gpus/".len()..p.len() - "/history".len()];
            let parts: Vec<&str> = rest.split('/').collect();
            if parts.len() != 1 || parts[0].is_empty() {
                return HttpResponse::error(400, "Expected /api/gpus/{gpu_id}/history");
            }
            HttpResponse::json(200, &api.get_gpu_history(parts[0], 60))
        }

        (HttpMethod::Get, "/api/alerts") => HttpResponse::json(200, &api.get_alerts(100)),

        (HttpMethod::Get, "/api/health") => HttpResponse::json(200, &serde_json::json!({ "status": "ok" })),

        (HttpMethod::Get, _) => HttpResponse::error(404, "Not found"),
        _ => HttpResponse::error(405, "Method not allowed"),
    }
}

pub struct RemoteServer {
    port: u16,
    shutdown: Arc<AtomicBool>,
    thread: Option<thread::JoinHandle<()>>,
}

impl RemoteServer {
    pub fn start(
        port: u16,
        api: RemoteApi,
        auth: AuthManager,
        dashboard_html: &str,
    ) -> Result<Self, String> {
        let addr = format!("127.0.0.1:{}", port);
        let listener = TcpListener::bind(&addr).map_err(|e| format!("Failed to bind: {}", e))?;
        listener
            .set_nonblocking(true)
            .map_err(|e| format!("Failed to set nonblocking: {}", e))?;

        let actual_port = listener.local_addr().map_err(|e| e.to_string())?.port();
        let shutdown = Arc::new(AtomicBool::new(false));
        let shutdown_clone = Arc::clone(&shutdown);

        let api = Arc::new(api);
        let auth = Arc::new(auth);
        let dashboard_html = dashboard_html.to_string();

        let thread = thread::spawn(move || {
            info!("Remote monitoring server started on port {}", actual_port);
            loop {
                if shutdown_clone.load(Ordering::Relaxed) {
                    info!("Remote server shutdown requested");
                    break;
                }

                match listener.accept() {
                    Ok((stream, _)) => {
                        let api = Arc::clone(&api);
                        let auth = Arc::clone(&auth);
                        let dashboard_html = dashboard_html.clone();
                        thread::spawn(move || {
                            handle_connection(stream, &api, &auth, &dashboard_html);
                        });
                    }
                    Err(ref e) if e.kind() == std::io::ErrorKind::WouldBlock => {
                        thread::sleep(std::time::Duration::from_millis(POLL_INTERVAL_MS));
                    }
                    Err(e) => {
                        error!("Remote server accept error: {}", e);
                        thread::sleep(std::time::Duration::from_millis(100));
                    }
                }
            }
            info!("Remote monitoring server stopped");
        });

        Ok(Self {
            port: actual_port,
            shutdown,
            thread: Some(thread),
        })
    }

    pub fn port(&self) -> u16 {
        self.port
    }

    pub fn url(&self) -> String {
        format!("http://127.0.0.1:{}", self.port)
    }

    pub fn stop(&mut self) {
        self.shutdown.store(true, Ordering::Relaxed);
        if let Some(thread) = self.thread.take() {
            let _ = thread.join();
        }
    }
}

impl Drop for RemoteServer {
    fn drop(&mut self) {
        self.stop();
    }
}

fn handle_connection(
    mut stream: std::net::TcpStream,
    api: &RemoteApi,
    auth: &AuthManager,
    dashboard_html: &str,
) {
    let mut reader = std::io::BufReader::new(&mut stream);

    let mut start_line = String::new();
    if reader.read_line(&mut start_line).is_err() {
        return;
    }
    let parts: Vec<&str> = start_line.trim().split_whitespace().collect();
    if parts.len() < 2 {
        return;
    }

    let method = HttpMethod::from_str(parts[0]);
    let path = parts[1].to_string();

    let mut auth_header = None;
    let mut content_length: usize = 0;

    loop {
        let mut line = String::new();
        if reader.read_line(&mut line).is_err() {
            return;
        }
        let trimmed = line.trim();
        if trimmed.is_empty() {
            break;
        }
        if let Some(value) = trimmed.strip_prefix("Authorization: ") {
            auth_header = Some(value.to_string());
        }
        if let Some(value) = trimmed.strip_prefix("Content-Length: ") {
            content_length = value.parse().unwrap_or(0);
        }
    }

    let _body = if content_length > 0 {
        let mut buf = vec![0u8; content_length];
        if reader.read_exact(&mut buf).is_ok() {
            Some(String::from_utf8_lossy(&buf).to_string())
        } else {
            None
        }
    } else {
        None
    };

    let request = HttpRequest { method, path, auth_header, _body };
    let response = route_request(&request, api, auth, dashboard_html);
    let bytes = response.to_bytes();

    let _ = std::io::Write::write_all(&mut stream, &bytes);
}
