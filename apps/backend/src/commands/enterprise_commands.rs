use crate::enterprise::{EnterpriseConfig, EnterpriseStore, GroupPolicy, PolicyTarget};

#[tauri::command]
pub fn get_enterprise_config() -> EnterpriseConfig {
    let store = EnterpriseStore::new();
    store.load_config()
}

#[tauri::command]
pub fn save_enterprise_config(config: EnterpriseConfig) -> Result<(), String> {
    let store = EnterpriseStore::new();
    store.save_config(&config);
    Ok(())
}

#[tauri::command]
pub fn list_group_policies() -> Vec<GroupPolicy> {
    let store = EnterpriseStore::new();
    let ids = store.list_policies();
    let mut policies = vec![];
    for id in ids {
        if let Some(p) = store.load_policy(&id) {
            policies.push(p);
        }
    }
    policies
}

#[tauri::command]
pub fn create_group_policy(
    name: String,
    description: String,
    target: PolicyTarget,
) -> Result<GroupPolicy, String> {
    let store = EnterpriseStore::new();
    let policy = GroupPolicy::new(name, description, target);
    store.save_policy(&policy);
    Ok(policy)
}

#[tauri::command]
pub fn update_group_policy(policy: GroupPolicy) -> Result<(), String> {
    let store = EnterpriseStore::new();
    store.save_policy(&policy);
    Ok(())
}

#[tauri::command]
pub fn delete_group_policy(id: String) -> Result<(), String> {
    let store = EnterpriseStore::new();
    store.delete_policy(&id);
    Ok(())
}

#[tauri::command]
pub fn toggle_group_policy(id: String, enabled: bool) -> Result<(), String> {
    let store = EnterpriseStore::new();
    if let Some(mut policy) = store.load_policy(&id) {
        policy.enabled = enabled;
        policy.updated_at = chrono::Utc::now().timestamp();
        store.save_policy(&policy);
        Ok(())
    } else {
        Err(format!("Policy {id} not found"))
    }
}
