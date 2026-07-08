use crate::backup::{BackupEngine, BackupScope};

#[tauri::command]
pub fn create_backup(name: String, scope: BackupScope) -> Result<serde_json::Value, String> {
    let result = BackupEngine::create_backup(name, scope)?;
    Ok(serde_json::to_value(&result).unwrap_or_default())
}

#[tauri::command]
pub fn restore_backup(id: String, scope: BackupScope) -> Result<serde_json::Value, String> {
    let result = BackupEngine::restore_backup(&id, scope)?;
    Ok(serde_json::to_value(&result).unwrap_or_default())
}

#[tauri::command]
pub fn list_backups() -> Result<serde_json::Value, String> {
    let backups = BackupEngine::list_backups();
    Ok(serde_json::to_value(&backups).unwrap_or_default())
}

#[tauri::command]
pub fn delete_backup(id: String) {
    BackupEngine::delete_backup(&id);
}

#[tauri::command]
pub fn export_backup(id: String) -> Result<String, String> {
    BackupEngine::export_backup_path(&id)
}

#[tauri::command]
pub fn import_backup(file_path: String) -> Result<serde_json::Value, String> {
    let meta = BackupEngine::import_backup(&file_path)?;
    Ok(serde_json::to_value(&meta).unwrap_or_default())
}
