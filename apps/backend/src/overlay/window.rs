//! Real, transparent, always-on-top overlay window.
//!
//! The overlay is a second Tauri webview window (label `overlay`) that loads
//! the same frontend bundle. `main.tsx` detects the window label and renders a
//! lightweight HUD (`OverlayHud`) instead of the full app. The window is:
//! - transparent + borderless, so only the HUD graphics are visible;
//! - always-on-top and skip-taskbar, so it floats over games;
//! - click-through (`set_ignore_cursor_events`), so it never steals input.
//!
//! Positioning honours `OverlayConfig::position` (the four screen corners).

use tauri::{AppHandle, Manager, PhysicalPosition, WebviewUrl, WebviewWindow, WebviewWindowBuilder};

use super::config::{OverlayConfig, OverlayPosition};

/// Window label used for the overlay throughout the app.
pub const OVERLAY_LABEL: &str = "overlay";

/// Overlay window size (logical px). Fixed so corner-positioning is stable; the
/// HUD lays itself out compactly within this box.
const OVERLAY_WIDTH: f64 = 300.0;
const OVERLAY_HEIGHT: f64 = 240.0;
/// Gap between the overlay and the screen edge (logical px).
const EDGE_MARGIN: f64 = 24.0;

/// Create (if needed) and show the overlay window, positioned per `config`.
pub fn show_overlay(app: &AppHandle, config: &OverlayConfig) -> Result<(), String> {
    let window = match app.get_webview_window(OVERLAY_LABEL) {
        Some(existing) => existing,
        None => WebviewWindowBuilder::new(
            app,
            OVERLAY_LABEL,
            WebviewUrl::App("index.html".into()),
        )
        .title("Overlay")
        .inner_size(OVERLAY_WIDTH, OVERLAY_HEIGHT)
        .transparent(true)
        .decorations(false)
        .always_on_top(true)
        .skip_taskbar(true)
        .resizable(false)
        .maximizable(false)
        .minimizable(false)
        .shadow(false)
        .focused(false)
        .visible(false)
        .build()
        .map_err(|e| format!("Failed to create overlay window: {e}"))?,
    };

    // Click-through so the overlay never intercepts game input.
    let _ = window.set_ignore_cursor_events(true);
    apply_position(&window, config)?;
    window.show().map_err(|e| e.to_string())?;
    let _ = window.set_always_on_top(true);
    Ok(())
}

/// Close the overlay window if it exists.
pub fn hide_overlay(app: &AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window(OVERLAY_LABEL) {
        window.close().map_err(|e| e.to_string())?;
    }
    Ok(())
}

/// Reposition an already-open overlay to match an updated config. No-op when the
/// overlay window is not currently open.
pub fn reposition(app: &AppHandle, config: &OverlayConfig) -> Result<(), String> {
    if let Some(window) = app.get_webview_window(OVERLAY_LABEL) {
        apply_position(&window, config)?;
    }
    Ok(())
}

/// Place the window in the configured corner of its current monitor.
fn apply_position(window: &WebviewWindow, config: &OverlayConfig) -> Result<(), String> {
    let monitor = window
        .current_monitor()
        .ok()
        .flatten()
        .or_else(|| window.primary_monitor().ok().flatten());
    let Some(monitor) = monitor else {
        // No monitor info (headless / virtual) — leave the OS default position.
        return Ok(());
    };

    let scale = monitor.scale_factor();
    let m_size = monitor.size(); // physical px
    let m_pos = monitor.position(); // physical px
    let win_size = window.outer_size().map_err(|e| e.to_string())?; // physical px
    let margin = EDGE_MARGIN * scale;

    let (mw, mh) = (m_size.width as f64, m_size.height as f64);
    let (ww, wh) = (win_size.width as f64, win_size.height as f64);

    let (x, y) = match config.position {
        OverlayPosition::TopLeft => (margin, margin),
        OverlayPosition::TopRight => (mw - ww - margin, margin),
        OverlayPosition::BottomLeft => (margin, mh - wh - margin),
        OverlayPosition::BottomRight => (mw - ww - margin, mh - wh - margin),
    };

    let px = (m_pos.x as f64 + x).max(m_pos.x as f64);
    let py = (m_pos.y as f64 + y).max(m_pos.y as f64);
    window
        .set_position(PhysicalPosition::new(px, py))
        .map_err(|e| e.to_string())?;
    Ok(())
}
