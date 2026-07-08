use tauri::State;
use tracing::info;

use super::state::SharedState;

#[tauri::command]
pub fn save_profile(
    state: State<'_, SharedState>,
    name: String,
    gpu_id: String,
    core_offset: i32,
    mem_offset: i32,
    voltage_offset: i32,
    fan_speed: f64,
    power_limit: f64,
) -> Result<String, String> {
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

    let dir = dirs_next::config_dir()
        .ok_or("Failed to get config directory")?
        .join("gpucontrol-pro")
        .join("profiles");

    std::fs::create_dir_all(&dir).map_err(|e| e.to_string())?;

    let filename = format!("{}_{}.json", name.replace(' ', "_"), gpu_id);
    let path = dir.join(&filename);
    let content = serde_json::to_string_pretty(&profile).map_err(|e| e.to_string())?;
    std::fs::write(&path, content).map_err(|e| e.to_string())?;

    Ok(filename)
}

#[tauri::command]
pub fn load_profiles(state: State<'_, SharedState>) -> Result<Vec<serde_json::Value>, String> {
    let dir = dirs_next::config_dir()
        .ok_or("Failed to get config directory")?
        .join("gpucontrol-pro")
        .join("profiles");

    if !dir.exists() {
        return Ok(vec![]);
    }

    let mut profiles = Vec::new();
    let entries = std::fs::read_dir(&dir).map_err(|e| e.to_string())?;
    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        let content = std::fs::read_to_string(entry.path()).map_err(|e| e.to_string())?;
        if let Ok(profile) = serde_json::from_str(&content) {
            profiles.push(profile);
        }
    }

    Ok(profiles)
}

#[tauri::command]
pub fn delete_profile(state: State<'_, SharedState>, filename: String) -> Result<(), String> {
    info!(filename, "Deleting profile");
    let dir = dirs_next::config_dir()
        .ok_or("Failed to get config directory")?
        .join("gpucontrol-pro")
        .join("profiles");

    let path = dir.join(&filename);
    if path.exists() {
        std::fs::remove_file(&path).map_err(|e| e.to_string())?;
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
) -> Result<(), String> {
    info!(gpu_id, "Applying profile");
    state.monitoring.set_core_clock_offset(&gpu_id, core_offset)?;
    state.monitoring.set_memory_clock_offset(&gpu_id, mem_offset)?;
    state.monitoring.set_voltage_offset(&gpu_id, voltage_offset)?;
    state.monitoring.set_fan_speed(&gpu_id, fan_speed)?;
    state.monitoring.set_power_limit(&gpu_id, power_limit)?;
    Ok(())
}
