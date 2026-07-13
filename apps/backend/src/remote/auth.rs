use std::sync::RwLock;
use std::sync::atomic::{AtomicBool, Ordering};

pub struct AuthManager {
    enabled: AtomicBool,
    api_key: RwLock<Option<String>>,
}

impl Default for AuthManager {
    fn default() -> Self {
        Self::new()
    }
}

impl AuthManager {
    pub fn new() -> Self {
        Self {
            enabled: AtomicBool::new(false),
            api_key: RwLock::new(None),
        }
    }

    pub fn set_key(&self, key: String) {
        let mut api_key = self.api_key.write().unwrap_or_else(|e| e.into_inner());
        *api_key = Some(key);
        self.enabled.store(true, Ordering::SeqCst);
    }

    pub fn clear_key(&self) {
        let mut api_key = self.api_key.write().unwrap_or_else(|e| e.into_inner());
        *api_key = None;
        self.enabled.store(false, Ordering::SeqCst);
    }

    pub fn validate(&self, header: Option<&str>) -> bool {
        if !self.enabled.load(Ordering::SeqCst) {
            return true;
        }
        let api_key = self.api_key.read().unwrap_or_else(|e| e.into_inner());
        match (header, api_key.as_ref()) {
            (Some(h), Some(key)) => h == key,
            _ => false,
        }
    }

    pub fn is_enabled(&self) -> bool {
        self.enabled.load(Ordering::SeqCst)
    }

    pub fn generate_key(&self) -> String {
        use rand::Rng;
        let mut rng = rand::thread_rng();
        let key: String = (0..32).map(|_| rng.gen_range(b'a'..=b'z') as char).collect();
        key
    }
}
