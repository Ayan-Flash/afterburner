#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Thin binary entry point. All application logic lives in the library crate
// (`lib.rs::run`) so modules are compiled once (not duplicated between the bin
// and lib) and the app stays mobile-entry-point compatible.
fn main() {
    gpucontrol_pro_lib::run();
}
