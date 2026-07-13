use gpucontrol_pro_lib::database::Database;
use gpucontrol_pro_lib::hardware::GpuSample;

#[test]
fn test_database_open_and_schema() {
    let db = Database::open().expect("Failed to open database");
    let conn = db.conn();
    let version: i64 = conn
        .query_row("SELECT COALESCE(MAX(version), 0) FROM schema_version", [], |r| r.get(0))
        .unwrap();
    assert!(version >= 1);
}







#[test]
fn test_setting_roundtrip() {
    let db = Database::open().expect("Failed to open database");
    db.set_setting("theme", "dark").unwrap();
    let val = db.get_setting("theme").unwrap();
    assert_eq!(val, Some("dark".to_string()));

    db.set_setting("theme", "light").unwrap();
    let val = db.get_setting("theme").unwrap();
    assert_eq!(val, Some("light".to_string()));
}

#[test]
fn test_get_all_settings() {
    let db = Database::open().expect("Failed to open database");
    db.set_setting("test_key_1", "value_1").unwrap();
    db.set_setting("test_key_2", "value_2").unwrap();
    let all = db.get_all_settings().unwrap();
    assert!(all.len() >= 2);
}

#[test]
fn test_sample_insert_and_query() {
    let db = Database::open().expect("Failed to open database");
    let sample = GpuSample {
        gpu_id: "test-gpu-0".into(),
        timestamp: 1000,
        temperature_celsius: 65.0,
        core_clock_mhz: 1500.0,
        memory_clock_mhz: 2000.0,
        memory_used_mb: 2048,
        memory_total_mb: 8192,
        fan_speed_percent: 45.0,
        fan_rpm: 1500,
        power_watts: 120.0,
        core_voltage_mv: 950.0,
        core_utilization_percent: 50.0,
        memory_utilization_percent: 30.0,
    };

    db.insert_sample(&sample).unwrap();
    let samples = db.get_samples("test-gpu-0", 10, 0).unwrap();
    assert!(!samples.is_empty());
    assert_eq!(samples[0].temperature_celsius, 65.0);
}

#[test]
fn test_alert_event_insert() {
    let db = Database::open().expect("Failed to open database");
    db.insert_alert_event(
        "alert-1", "gpu-0", "rule-1", "temperature",
        "Warning", "High temperature", 85.0, 80.0, 1000,
    )
    .unwrap();

    let events = db.get_alert_events("gpu-0", 10).unwrap();
    assert!(!events.is_empty());
    assert_eq!(events[0]["metric"], "temperature");

    let acked = db.acknowledge_alert("alert-1").unwrap();
    assert!(acked);
}

#[test]
fn test_clear_samples() {
    let db = Database::open().expect("Failed to open database");
    let sample = GpuSample {
        gpu_id: "test-gpu-clear".into(),
        timestamp: 999,
        temperature_celsius: 50.0,
        core_clock_mhz: 1000.0,
        memory_clock_mhz: 1500.0,
        memory_used_mb: 1024,
        memory_total_mb: 4096,
        fan_speed_percent: 30.0,
        fan_rpm: 1200,
        power_watts: 80.0,
        core_voltage_mv: 800.0,
        core_utilization_percent: 20.0,
        memory_utilization_percent: 10.0,
    };
    db.insert_sample(&sample).unwrap();

    let deleted = db.clear_samples(1000).unwrap();
    assert!(deleted > 0);
}

