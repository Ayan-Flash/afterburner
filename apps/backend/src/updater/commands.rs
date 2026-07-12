use std::sync::atomic::Ordering;
use std::time::Duration;

use tauri::{AppHandle, Emitter, Manager, State};
use tauri_plugin_updater::UpdaterExt;
use tracing::{error, info};

use super::{UpdateInfo, UpdateStatus, UpdaterState};

#[tauri::command]
pub async fn check_update(
    app: AppHandle,
    state: State<'_, UpdaterState>,
) -> Result<UpdateStatus, String> {
    let mut status = state.status.lock().await;
    *status = UpdateStatus::Checking;
    let _ = app.emit("update-status", status.clone());

    info!("Checking for updates...");

    let updater = app.updater().map_err(|e| e.to_string())?;
    match updater.check().await {
        Ok(Some(update)) => {
            info!(version = %update.version, "Update available");
            let info = UpdateInfo {
                version: update.version,
                date: update.date.map(|d| d.to_string()).unwrap_or_default(),
                body: update.body.unwrap_or_default(),
                download_url: String::new(),
            };
            *status = UpdateStatus::Available(info.clone());
            let _ = app.emit("update-status", status.clone());
            Ok(status.clone())
        }
        Ok(None) => {
            info!("No updates available");
            *status = UpdateStatus::UpToDate;
            let _ = app.emit("update-status", status.clone());
            Ok(status.clone())
        }
        Err(e) => {
            error!(error = %e, "Update check failed");
            *status = UpdateStatus::Error(e.to_string());
            let _ = app.emit("update-status", status.clone());
            Err(e.to_string())
        }
    }
}

#[tauri::command]
pub async fn start_update(
    app: AppHandle,
    state: State<'_, UpdaterState>,
) -> Result<String, String> {
    let status = state.status.lock().await;

    match &*status {
        UpdateStatus::Available(info) => {
            let version = info.version.clone();
            drop(status);

            let mut s = state.status.lock().await;
            *s = UpdateStatus::Downloading(0);
            let _ = app.emit("update-status", s.clone());
            drop(s);

            info!(%version, "Starting update download");

            let updater = app.updater().map_err(|e| e.to_string())?;
            let response = updater.check().await.map_err(|e| e.to_string())?;

            if let Some(update) = response {
                let version_clone = version.clone();
                let app_handle = app.clone();
                let progress_handle = app_handle.clone();

                let result = update
                    .download_and_install(
                        move |chunk, total| {
                            let total_val = total.unwrap_or(1);
                            let percent = if total_val > 0 {
                                ((chunk as f64 / total_val as f64) * 100.0) as u16
                            } else {
                                0
                            };
                            info!(%chunk, "Download progress: {}%", percent);
                            let s = progress_handle.state::<UpdaterState>();
                            let mut status = s.status.blocking_lock();
                            *status = UpdateStatus::Downloading(percent);
                            let _ = progress_handle.emit("update-status", status.clone());
                        },
                        || {},
                    )
                    .await;

                match result {
                    Ok(_) => {
                        info!(%version, "Update installed successfully");
                        let s = app_handle.state::<UpdaterState>();
                        let mut status = s.status.blocking_lock();
                        *status = UpdateStatus::Installing;
                        let _ = app_handle.emit("update-status", status.clone());
                        Ok(format!("Update to {} installed. Restart to apply.", version_clone))
                    }
                    Err(e) => {
                        error!(error = %e, "Update install failed");
                        let s = app_handle.state::<UpdaterState>();
                        let mut status = s.status.blocking_lock();
                        *status = UpdateStatus::Error(e.to_string());
                        let _ = app_handle.emit("update-status", status.clone());
                        Err(e.to_string())
                    }
                }
            } else {
                Err("No update available to install".to_string())
            }
        }
        UpdateStatus::Downloaded(info) => {
            let version = info.version.clone();
            drop(status);

            let updater = app.updater().map_err(|e| e.to_string())?;
            if let Some(update) = updater.check().await.map_err(|e| e.to_string())? {
                update
                    .download_and_install(|_, _| {}, || {})
                    .await
                    .map_err(|e| e.to_string())?;
                let mut s = state.status.lock().await;
                *s = UpdateStatus::Installing;
                let _ = app.emit("update-status", s.clone());
                Ok(format!("Update to {} installed. Restart to apply.", version))
            } else {
                Err("No downloaded update found".to_string())
            }
        }
        _ => Err("No update available to install".to_string()),
    }
}

#[tauri::command]
pub async fn get_update_status(
    state: State<'_, UpdaterState>,
) -> Result<UpdateStatus, String> {
    let status = state.status.lock().await;
    Ok(status.clone())
}

#[tauri::command]
pub async fn set_auto_check(
    state: State<'_, UpdaterState>,
    enabled: bool,
) -> Result<(), String> {
    state.auto_check_enabled.store(enabled, Ordering::SeqCst);
    info!(%enabled, "Auto update check");
    Ok(())
}

#[tauri::command]
pub async fn set_check_interval(
    state: State<'_, UpdaterState>,
    hours: u8,
) -> Result<(), String> {
    state.check_interval_hours.store(hours, Ordering::SeqCst);
    info!(%hours, "Update check interval set");
    Ok(())
}

pub fn spawn_auto_check(app: AppHandle) {
    let handle = app.clone();
    tauri::async_runtime::spawn(async move {
        let state = handle.state::<UpdaterState>();

        let initial_delay = state
            .check_interval_hours
            .load(Ordering::SeqCst)
            .max(1) as u64;

        tokio::time::sleep(Duration::from_secs(initial_delay * 3600)).await;

        loop {
            if !state.auto_check_enabled.load(Ordering::SeqCst) {
                tokio::time::sleep(Duration::from_secs(3600)).await;
                continue;
            }

            info!("Auto-checking for updates...");
            match handle.updater() {
                Ok(updater) => {
                    match updater.check().await {
                        Ok(Some(update)) => {
                            info!(version = %update.version, "Auto-update available");
                            let info = UpdateInfo {
                                version: update.version.clone(),
                                date: update.date.map(|d| d.to_string()).unwrap_or_default(),
                                body: update.body.unwrap_or_default(),
                                download_url: String::new(),
                            };
                            let mut s = state.status.lock().await;
                            *s = UpdateStatus::Available(info);
                            let _ = handle.emit("update-status", s.clone());
                            drop(s);

                            let _ = handle.emit("update-available", serde_json::json!({
                                "version": update.version,
                                "silent": false,
                            }));
                        }
                        Ok(None) => {
                            info!("No updates available (auto-check)");
                        }
                        Err(e) => {
                            error!(error = %e, "Auto-update check failed");
                        }
                    }
                }
                Err(e) => {
                    error!(error = %e, "Failed to get updater");
                }
            }

            let interval = state.check_interval_hours.load(Ordering::SeqCst).max(1) as u64;
            tokio::time::sleep(Duration::from_secs(interval * 3600)).await;
        }
    });
}
