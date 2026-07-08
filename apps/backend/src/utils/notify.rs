use tauri::{AppHandle, Emitter};
use tauri_plugin_notification::NotificationExt;

/// Sends a native OS notification via the Tauri notification plugin.
pub fn send_notification(
    app: &AppHandle,
    title: &str,
    body: &str,
) {
    if let Err(e) = app.notification().builder()
        .title(title)
        .body(body)
        .show()
    {
        tracing::error!(error = %e, "Failed to send notification");
    }
}

/// Emits a custom event to the frontend for in-app notification display.
pub fn emit_alert_event(app: &AppHandle, event_type: &str, payload: &serde_json::Value) {
    let _ = app.emit(format!("alert:{}", event_type), payload.clone());
}

/// Sends both a native notification and a frontend event for critical alerts.
pub fn notify_critical_alert(
    app: &AppHandle,
    gpu_name: &str,
    metric: &str,
    value: f64,
    threshold: f64,
) {
    let title = format!("GPU Alert: {} - {}", gpu_name, metric);
    let body = format!("{:.1} (threshold: {:.1})", value, threshold);

    send_notification(app, &title, &body);

    let payload = serde_json::json!({
        "gpu": gpu_name,
        "metric": metric,
        "value": value,
        "threshold": threshold,
        "timestamp": chrono::Utc::now().timestamp_millis(),
    });
    emit_alert_event(app, "critical", &payload);
}
