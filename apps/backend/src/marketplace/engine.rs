use serde::{Deserialize, Serialize};
use serde_json::Value;
use tracing::error;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProfileRating {
    pub profile_id: String,
    pub score: u8,
    pub comment: String,
    pub author: String,
    pub timestamp: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MarketplaceProfile {
    pub id: String,
    pub name: String,
    pub description: String,
    pub author: String,
    pub author_id: String,
    pub gpu_model: String,
    pub gpu_vendor: String,
    pub driver_version: String,
    pub profile_data: Value,
    pub tags: Vec<String>,
    pub rating_avg: f64,
    pub rating_count: u32,
    pub download_count: u32,
    pub created_at: i64,
    pub updated_at: i64,
    pub version: String,
}

pub struct MarketplaceEngine;

impl MarketplaceEngine {
    pub fn list_profiles(store: &MarketplaceStore, filter: &str, search: &str) -> Vec<MarketplaceProfile> {
        let all = store.load_all();
        let mut filtered: Vec<MarketplaceProfile> = all
            .into_iter()
            .filter(|p| {
                let matches_filter = if filter.is_empty() || filter == "all" {
                    true
                } else if filter == "rated" {
                    p.rating_count > 0
                } else if filter == "popular" {
                    p.download_count > 10
                } else if filter == "mine" {
                    p.author_id == "local"
                } else {
                    p.tags.iter().any(|t| t == &filter)
                };
                let matches_search = if search.is_empty() {
                    true
                } else {
                    let s = search.to_lowercase();
                    p.name.to_lowercase().contains(&s)
                        || p.description.to_lowercase().contains(&s)
                        || p.gpu_model.to_lowercase().contains(&s)
                        || p.tags.iter().any(|t| t.to_lowercase().contains(&s))
                };
                matches_filter && matches_search
            })
            .collect();
        filtered.sort_by(|a, b| b.rating_avg.partial_cmp(&a.rating_avg).unwrap_or(std::cmp::Ordering::Equal));
        filtered
    }

    pub fn get_profile(store: &MarketplaceStore, id: &str) -> Option<MarketplaceProfile> {
        store.load_all().into_iter().find(|p| p.id == id)
    }

    pub fn publish_profile(store: &MarketplaceStore, profile: MarketplaceProfile) -> Result<MarketplaceProfile, String> {
        let mut all = store.load_all();
        if all.iter().any(|p| p.id == profile.id) {
            if let Some(existing) = all.iter_mut().find(|p| p.id == profile.id) {
                *existing = profile.clone();
            }
        } else {
            all.push(profile.clone());
        }
        store.save_all(&all);
        Ok(profile)
    }

    pub fn delete_profile(store: &MarketplaceStore, id: &str) -> bool {
        let mut all = store.load_all();
        let len = all.len();
        all.retain(|p| p.id != id);
        if all.len() < len {
            store.save_all(&all);
            true
        } else {
            false
        }
    }

    pub fn rate_profile(store: &MarketplaceStore, profile_id: &str, rating: ProfileRating) -> Result<MarketplaceProfile, String> {
        let mut all = store.load_all();
        let profile = all.iter_mut().find(|p| p.id == profile_id)
            .ok_or_else(|| "Profile not found".to_string())?;

        profile.rating_count += 1;
        let total = profile.rating_avg * (profile.rating_count as f64 - 1.0) + rating.score as f64;
        profile.rating_avg = total / profile.rating_count as f64;
        profile.updated_at = chrono::Utc::now().timestamp();
        let cloned = profile.clone();
        store.save_all(&all);
        Ok(cloned)
    }

    pub fn download_profile(store: &MarketplaceStore, id: &str) -> Option<MarketplaceProfile> {
        let mut all = store.load_all();
        let profile = all.iter_mut().find(|p| p.id == id)?;
        profile.download_count += 1;
        let cloned = profile.clone();
        store.save_all(&all);
        Some(cloned)
    }

    pub fn import_profile(store: &MarketplaceStore, json_str: &str) -> Result<MarketplaceProfile, String> {
        let profile: MarketplaceProfile = serde_json::from_str(json_str)
            .map_err(|e| format!("Invalid profile format: {e}"))?;
        let mut all = store.load_all();
        if !all.iter().any(|p| p.id == profile.id) {
            all.push(profile.clone());
            store.save_all(&all);
        }
        Ok(profile)
    }

    pub fn export_profile(store: &MarketplaceStore, id: &str) -> Result<String, String> {
        let profile = store.load_all().into_iter()
            .find(|p| p.id == id)
            .ok_or_else(|| "Profile not found".to_string())?;
        serde_json::to_string_pretty(&profile)
            .map_err(|e| format!("Serialization error: {e}"))
    }
}
