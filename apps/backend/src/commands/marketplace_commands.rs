use crate::marketplace::{MarketplaceEngine, MarketplaceProfile, ProfileRating, MarketplaceStore};

#[tauri::command]
pub fn list_marketplace_profiles(filter: String, search: String) -> Vec<MarketplaceProfile> {
    let store = MarketplaceStore::new();
    MarketplaceEngine::list_profiles(&store, &filter, &search)
}

#[tauri::command]
pub fn get_marketplace_profile(id: String) -> Option<MarketplaceProfile> {
    let store = MarketplaceStore::new();
    MarketplaceEngine::get_profile(&store, &id)
}

#[tauri::command]
pub fn publish_marketplace_profile(profile: MarketplaceProfile) -> Result<MarketplaceProfile, String> {
    let store = MarketplaceStore::new();
    MarketplaceEngine::publish_profile(&store, profile)
}

#[tauri::command]
pub fn delete_marketplace_profile(id: String) -> bool {
    let store = MarketplaceStore::new();
    MarketplaceEngine::delete_profile(&store, &id)
}

#[tauri::command]
pub fn rate_marketplace_profile(profile_id: String, rating: ProfileRating) -> Result<MarketplaceProfile, String> {
    let store = MarketplaceStore::new();
    MarketplaceEngine::rate_profile(&store, &profile_id, rating)
}

#[tauri::command]
pub fn download_marketplace_profile(id: String) -> Result<MarketplaceProfile, String> {
    let store = MarketplaceStore::new();
    MarketplaceEngine::download_profile(&store, &id).ok_or_else(|| "Profile not found".to_string())
}

#[tauri::command]
pub fn import_marketplace_profile(json: String) -> Result<MarketplaceProfile, String> {
    let store = MarketplaceStore::new();
    MarketplaceEngine::import_profile(&store, &json)
}

#[tauri::command]
pub fn export_marketplace_profile(id: String) -> Result<String, String> {
    let store = MarketplaceStore::new();
    MarketplaceEngine::export_profile(&store, &id)
}
