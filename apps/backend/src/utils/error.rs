use serde::Serialize;
use thiserror::Error;

#[derive(Error, Debug, Serialize)]
pub enum AppError {
    #[error("GPU not found: {0}")]
    GpuNotFound(String),
    #[error("Failed to read GPU data: {0}")]
    GpuReadError(String),
    #[error("Failed to set GPU control: {0}")]
    GpuControlError(String),
    #[error("GPU provider not available: {0}")]
    GpuProviderNotAvailable(String),
    #[error("Profile not found: {0}")]
    ProfileNotFound(String),
    #[error("Profile already exists: {0}")]
    ProfileAlreadyExists(String),
    #[error("Invalid profile name: {0}")]
    InvalidProfileName(String),
    #[error("Profile parse error: {0}")]
    ProfileParseError(String),
    #[error("Backup not found: {0}")]
    BackupNotFound(String),
    #[error("Backup creation failed: {0}")]
    BackupCreateError(String),
    #[error("Backup restore failed: {0}")]
    BackupRestoreError(String),
    #[error("Backup export/import failed: {0}")]
    BackupTransferError(String),
    #[error("Marketplace profile not found: {0}")]
    MarketplaceNotFound(String),
    #[error("Marketplace publish failed: {0}")]
    MarketplacePublishError(String),
    #[error("Sync failed: {0}")]
    SyncError(String),
    #[error("Sync server error: {0}")]
    SyncServerError(String),
    #[error("Device not registered")]
    DeviceNotRegistered,
    #[error("Alert rule not found: {0}")]
    AlertRuleNotFound(String),
    #[error("Automation rule error: {0}")]
    AutomationError(String),
    #[error("Remote server error: {0}")]
    RemoteServerError(String),
    #[error("Overlay error: {0}")]
    OverlayError(String),
    #[error("Integration error: {0}")]
    IntegrationError(String),
    #[error("Configuration error: {0}")]
    ConfigError(String),
    #[error("Plugin error: {0}")]
    PluginError(String),
    #[error("Not implemented: {0}")]
    NotImplemented(String),
    #[error("Invalid argument: {0}")]
    InvalidArgument(String),
    #[error("Internal error: {0}")]
    Internal(String),
    #[error("IO error: {0}")]
    IoError(String),
}

impl From<std::io::Error> for AppError {
    fn from(e: std::io::Error) -> Self {
        AppError::IoError(e.to_string())
    }
}

impl From<crate::hardware::GpuProviderError> for AppError {
    fn from(e: crate::hardware::GpuProviderError) -> Self {
        match e {
            crate::hardware::GpuProviderError::GpuNotFound(id) => AppError::GpuNotFound(id),
            crate::hardware::GpuProviderError::ReadError(msg) => AppError::GpuReadError(msg),
            crate::hardware::GpuProviderError::ControlError(msg) => AppError::GpuControlError(msg),
            crate::hardware::GpuProviderError::NotAvailable(msg) => AppError::GpuProviderNotAvailable(msg),
        }
    }
}

impl From<serde_json::Error> for AppError {
    fn from(e: serde_json::Error) -> Self {
        AppError::Internal(e.to_string())
    }
}

impl From<rusqlite::Error> for AppError {
    fn from(e: rusqlite::Error) -> Self {
        AppError::Internal(e.to_string())
    }
}

pub type AppResult<T> = Result<T, AppError>;
