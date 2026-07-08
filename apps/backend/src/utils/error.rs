use thiserror::Error;

#[derive(Error, Debug)]
pub enum AppError {
    #[error("Hardware access error: {0}")]
    HardwareError(String),
    #[error("Configuration error: {0}")]
    ConfigError(String),
    #[error("Plugin error: {0}")]
    PluginError(String),
    #[error("IO error: {0}")]
    IoError(#[from] std::io::Error),
}
