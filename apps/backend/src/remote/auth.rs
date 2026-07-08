use std::sync::RwLock;

pub struct AuthManager {
    enabled: bool,
    api_key: RwLock<Option<String>>,
}

impl AuthManager {
    pub fn new() -> Self {
        Self {
            enabled: false,
            api_key: RwLock::new(None),
        }
    }

    pub fn set_key(&self, key: String) {
        let mut api_key = self.api_key.write().unwrap();
        *api_key = Some(key);
        self.enabled = true;
    }

    pub fn clear_key(&self) {
        let mut api_key = self.api_key.write().unwrap();
        *api_key = None;
        self.enabled = false;
    }

    pub fn validate(&self, header: Option<&str>) -> bool {
        if !self.enabled {
            return true;
        }
        let api_key = self.api_key.read().unwrap();
        match (header, api_key.as_ref()) {
            (Some(h), Some(key)) => h == key,
            _ => false,
        }
    }

    pub fn is_enabled(&self) -> bool {
        self.enabled
    }

    pub fn generate_key(&self) -> String {
        use rand::Rng;
        let mut rng = rand::thread_rng();
        let key: String = (0..32).map(|_| rng.gen_range(b'a'..=b'z') as char).collect();
        key
    }
}
