use std::collections::HashMap;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::time::Duration;

use tokio::sync::RwLock;
use tracing::{error, info, warn};

use super::aggregator::{AggregatedMetrics, Aggregator};
use super::buffer::RingBuffer;
use super::collector::Collector;
use super::exporter::{ExportedSample, Exporter};
use crate::hardware::{GpuControlState, GpuIdentity, GpuProvider, GpuProviderError, GpuSample};

pub struct MonitoringEngine {
    collector: Collector,
    buffers: RwLock<HashMap<String, RingBuffer>>,
    running: AtomicBool,
    gpus: RwLock<Vec<GpuIdentity>>,
    sample_hooks: std::sync::Mutex<Vec<Box<dyn Fn(&GpuSample) + Send + Sync>>>,
}

impl MonitoringEngine {
    pub fn new(provider: Box<dyn GpuProvider>) -> Self {
        let collector = Collector::new(provider);
        let gpus = collector.enumerate_gpus();
        let mut buffers = HashMap::new();
        for gpu in &gpus {
            buffers.insert(gpu.id.clone(), RingBuffer::new(3600));
        }

        info!("Monitoring engine initialized with {} GPU(s)", gpus.len());

        Self {
            collector,
            buffers: RwLock::new(buffers),
            running: AtomicBool::new(false),
            gpus: RwLock::new(gpus),
            sample_hooks: std::sync::Mutex::new(vec![]),
        }
    }

    pub fn add_sample_hook<F>(&self, hook: F)
    where
        F: Fn(&GpuSample) + Send + Sync + 'static,
    {
        if let Ok(mut hooks) = self.sample_hooks.lock() {
            hooks.push(Box::new(hook));
        }
    }

    pub fn gpus(&self) -> Vec<GpuIdentity> {
        self.gpus.blocking_read().clone()
    }

    pub fn provider_name(&self) -> &str {
        self.collector.provider_name()
    }

    pub fn collect_once(&self, gpu_id: &str) -> Option<GpuSample> {
        let sample = self.collector.collect_sample(gpu_id)?;
        let mut buffers = self.buffers.blocking_write();
        if let Some(buf) = buffers.get_mut(gpu_id) {
            buf.push(sample.clone());
        }
        if let Ok(hooks) = self.sample_hooks.lock() {
            for hook in hooks.iter() {
                hook(&sample);
            }
        }
        Some(sample)
    }

    pub fn collect_all_once(&self) -> Vec<GpuSample> {
        let gpus = self.gpus.blocking_read();
        let mut samples = Vec::with_capacity(gpus.len());
        for gpu in gpus.iter() {
            if let Some(sample) = self.collect_once(&gpu.id) {
                samples.push(sample);
            }
        }
        samples
    }

    pub fn get_latest(&self, gpu_id: &str) -> Option<GpuSample> {
        let buffers = self.buffers.blocking_read();
        buffers.get(gpu_id).and_then(|b| b.get_latest().cloned())
    }

    pub fn get_history(&self, gpu_id: &str, count: usize) -> Vec<GpuSample> {
        let buffers = self.buffers.blocking_read();
        buffers
            .get(gpu_id)
            .map(|b| b.get_range(count).into_iter().cloned().collect())
            .unwrap_or_default()
    }

    pub fn get_exported_samples(&self, gpu_id: &str, count: usize) -> Vec<ExportedSample> {
        let samples = self.get_history(gpu_id, count);
        let refs: Vec<&GpuSample> = samples.iter().collect();
        Exporter::export_samples(&refs)
    }

    pub fn get_aggregated(&self, gpu_id: &str, count: usize) -> Option<AggregatedMetrics> {
        let buffers = self.buffers.blocking_read();
        let samples = buffers.get(gpu_id)?;
        let refs = samples.get_range(count);
        if refs.is_empty() {
            return None;
        }
        Some(Aggregator::aggregate(gpu_id, &refs))
    }

    pub fn get_control_state(&self, gpu_id: &str) -> Result<GpuControlState, GpuProviderError> {
        self.collector.provider_ref().read_control_state(gpu_id)
    }

    pub fn set_fan_speed(&self, gpu_id: &str, percent: f64) -> Result<(), GpuProviderError> {
        self.collector.provider_ref().set_fan_speed(gpu_id, percent)
    }

    pub fn set_core_clock_offset(&self, gpu_id: &str, offset_mhz: i32) -> Result<(), GpuProviderError> {
        self.collector
            .provider_ref()
            .set_core_clock_offset(gpu_id, offset_mhz)
    }

    pub fn set_memory_clock_offset(&self, gpu_id: &str, offset_mhz: i32) -> Result<(), GpuProviderError> {
        self.collector
            .provider_ref()
            .set_memory_clock_offset(gpu_id, offset_mhz)
    }

    pub fn set_power_limit(&self, gpu_id: &str, percent: f64) -> Result<(), GpuProviderError> {
        self.collector.provider_ref().set_power_limit(gpu_id, percent)
    }

    pub fn set_voltage_offset(&self, gpu_id: &str, offset_mv: i32) -> Result<(), GpuProviderError> {
        self.collector
            .provider_ref()
            .set_voltage_offset(gpu_id, offset_mv)
    }

    pub fn export_csv(&self, gpu_id: &str, count: usize) -> String {
        let samples = self.get_history(gpu_id, count);
        let refs: Vec<&GpuSample> = samples.iter().collect();
        Exporter::export_to_csv(&refs)
    }

    pub fn start(&self) {
        self.running.store(true, Ordering::Relaxed);
        info!("Monitoring engine started");
    }

    pub fn stop(&self) {
        self.running.store(false, Ordering::Relaxed);
        info!("Monitoring engine stopped");
    }

    pub fn is_running(&self) -> bool {
        self.running.load(Ordering::Relaxed)
    }
}
