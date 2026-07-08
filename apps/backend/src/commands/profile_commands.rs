use tauri::State;
use tracing::info;

use super::state::SharedState;
use crate::utils::error::{AppError, AppResult};

fn profiles_dir() -> AppResult<std::path::PathBuf> {
    let dir = dirs_next::config_dir()
        .ok_or_else(|| AppError::ConfigError("Failed to get config directory".into()))?
        .join("gpucontrol-pro")
        .join("profiles");
    std::fs::create_dir_all(&dir)?;
    Ok(dir)
}

#[tauri::command]
pub fn save_profile(
    _state: State<'_, SharedState>,
    name: String,
    gpu_id: String,
    core_offset: i32,
    mem_offset: i32,
    voltage_offset: i32,
    fan_speed: f64,
    power_limit: f64,
) -> AppResult<String> {
    if name.trim().is_empty() {
        return Err(AppError::InvalidArgument("Profile name cannot be empty".into()));
    }
    if name.contains('/') || name.contains('\\') || name.contains('\0') {
        return Err(AppError::InvalidProfileName(
            "Profile name contains invalid characters".into(),
        ));
    }

    info!(name, gpu_id, "Saving profile");
    let profile = serde_json::json!({
        "name": name,
        "gpu_id": gpu_id,
        "core_offset": core_offset,
        "mem_offset": mem_offset,
        "voltage_offset": voltage_offset,
        "fan_speed": fan_speed,
        "power_limit": power_limit,
        "created_at": chrono::Utc::now().to_rfc3339(),
    });

    let dir = profiles_dir()?;
    let filename = format!("{}_{}.json", name.replace(' ', "_"), gpu_id);
    let path = dir.join(&filename);
    let content = serde_json::to_string_pretty(&profile)?;
    std::fs::write(&path, content)?;

    Ok(filename)
}

#[tauri::command]
pub fn load_profiles(_state: State<'_, SharedState>) -> AppResult<Vec<serde_json::Value>> {
    let dir = profiles_dir()?;

    if !dir.exists() {
        return Ok(vec![]);
    }

    let mut profiles = Vec::new();
    let entries = std::fs::read_dir(&dir)?;
    for entry in entries {
        let entry = entry?;
        let content = std::fs::read_to_string(entry.path())?;
        if let Ok(profile) = serde_json::from_str(&content) {
            profiles.push(profile);
        }
    }

    Ok(profiles)
}

#[tauri::command]
pub fn delete_profile(_state: State<'_, SharedState>, filename: String) -> AppResult<()> {
    info!(filename, "Deleting profile");
    let dir = profiles_dir()?;
    let path = dir.join(&filename);
    if path.exists() {
        std::fs::remove_file(&path)?;
    }
    Ok(())
}

#[tauri::command]
pub fn apply_profile(
    state: State<'_, SharedState>,
    gpu_id: String,
    core_offset: i32,
    mem_offset: i32,
    voltage_offset: i32,
    fan_speed: f64,
    power_limit: f64,
) -> AppResult<()> {
    info!(gpu_id, "Applying profile");
    state.monitoring.set_core_clock_offset(&gpu_id, core_offset)?;
    state.monitoring.set_memory_clock_offset(&gpu_id, mem_offset)?;
    state.monitoring.set_voltage_offset(&gpu_id, voltage_offset)?;
    state.monitoring.set_fan_speed(&gpu_id, fan_speed)?;
    state.monitoring.set_power_limit(&gpu_id, power_limit)?;
    Ok(())
}
