# Phase 3 Implementation Plan

## Priority Order
1. **Remote Monitoring** - Embedded HTTP server + standalone dashboard
2. **Overlay System** - In-game HUD overlay + configuration
3. **Other** - Scripting Engine foundations, Multi-User support

---

## 1. Remote Monitoring

### Backend (Rust)

**New module: `apps/backend/src/remote/`**
| File | Purpose |
|------|---------|
| `mod.rs` | Module declarations |
| `server.rs` | Embedded `axum` HTTP server lifecycle (start/stop on configurable port) |
| `api.rs` | REST endpoints (`/api/gpus`, `/api/gpu/:id/data`, `/api/gpu/:id/history`, `/api/alerts`) |
| `auth.rs` | Simple API token authentication middleware |
| `dashboard.html` | Single-page dashboard served at `/` (embedded at compile time via `include_str!`) |

**New IPC commands** (in `commands/remote_commands.rs`):
- `start_remote_server(port: u16, api_key: String)` → `Result<String, String>` (returns URL)
- `stop_remote_server()` → `Result<(), String>`
- `get_remote_server_status()` → `Result<Value, String>` (running, port, url)

**AppState wiring**: `AppState` gains `remote: Arc<RwLock<Option<RemoteServer>>>` where `RemoteServer` holds the shutdown handle + port.

**Cargo.toml additions**: `axum`, `tower-http` (cors), `tokio-tungstenite` (optional), `include_dir` (embed dashboard)

### Frontend (Standalone Dashboard HTML)
Embedded HTML file with:
- Real-time GPU metrics cards (fetch polling `/api/gpu/:id/data`)
- Mini SVG charts for each GPU (like RealtimeChart)
- Alert history list
- Auto-refresh every 1s
- API key auth header
- Dark theme matching app colors

### Frontend (Tauri App)
**New service methods**: `remoteService.start(port, apiKey)`, `.stop()`, `.getStatus()`
**New page component**: `RemotePage` (or integrated into SettingsPage)
- Start/Stop server toggle
- Port input (default 8080)
- API key generation/display
- Quick-link button to open `http://localhost:{port}` in browser

---

## 2. Overlay System

### Backend (Rust)

**New module: `apps/backend/src/overlay/`**
| File | Purpose |
|------|---------|
| `mod.rs` | Module declarations |
| `game_detection.rs` | Process enumeration via `sysinfo` crate, known game list |
| `config.rs` | OverlayConfig struct (enabled metrics, position, colors, opacity) |
| `renderer.rs` | Overlay data formatting (what to display) |

**New IPC commands** (in `commands/overlay_commands.rs`):
- `start_overlay(config: OverlayConfig)` → `Result<(), String>`
- `stop_overlay()` → `Result<(), String>`
- `get_overlay_config()` → `Result<OverlayConfig, String>`
- `update_overlay_config(config: OverlayConfig)` → `Result<(), String>`
- `get_detected_games()` → `Result<Vec<String>, String>`
- `is_game_running()` → `Result<bool, String>`

**Cargo.toml additions**: `sysinfo` (game detection)

### Frontend (Tauri App)
**New page component**: `OverlayPage`
- Enable/disable overlay toggle
- Metric picker (checkboxes for temp, core clock, fan, power, etc.)
- Position picker (top-left, top-right, bottom-left, bottom-right)
- Color picker per metric
- Opacity slider
- Auto-hide when no game detected toggle
- Preview mockup

**Service methods**: `overlayService.start(config)`, `.stop()`, `.getConfig()`, `.updateConfig(config)`, `.getDetectedGames()`, `.isGameRunning()`

---

## 3. Scripting Engine Foundations

### Backend (Rust)

**New module: `apps/backend/src/scripting/`**
| File | Purpose |
|------|---------|
| `mod.rs` | Module declarations |
| `engine.rs` | Script execution engine (mlua integration placeholder) |
| `types.rs` | Script type definitions |
| `api.rs` | Script API bindings (what functions scripts can call) |

**New IPC commands** (in `commands/script_commands.rs`):
- `run_script(script: String)` → `Result<String, String>`
- `list_scripts()` → `Result<Vec<Value>, String>`
- `save_script(name: String, content: String)` → `Result<(), String>`
- `delete_script(name: String)` → `Result<(), String>`

**Cargo.toml additions**: `mlua` (or `rlua` for Lua scripting)

### Frontend
- Scripts page with code editor (monaco editor or textarea)
- Script save/load/delete
- Output log panel

---

## 4. Multi-User Support (Foundation)

### Backend (Rust)

**New module: `apps/backend/src/auth/`**
| File | Purpose |
|------|---------|
| `mod.rs` | Module declarations |
| `user.rs` | User struct, profile sharing |
| `permissions.rs` | Permission enum, permission checks |

**New IPC commands**:
- `create_user(username, password)` → placeholder
- `login(username, password)` → placeholder
- `get_permissions()` → placeholder

---

## Files to Modify

### Rust Backend
| File | Change |
|------|--------|
| `apps/backend/Cargo.toml` | Add `axum`, `tower-http`, `tokio-tungstenite`, `sysinfo` |
| `apps/backend/src/lib.rs` | Add `pub mod remote`, `pub mod overlay` |
| `apps/backend/src/main.rs` | Add new modules, register IPC commands |
| `apps/backend/src/commands/mod.rs` | Add `pub mod remote_commands`, `pub mod overlay_commands` |
| `apps/backend/src/commands/state.rs` | Add remote server and overlay config to AppState |

### Frontend
| File | Change |
|------|--------|
| `apps/frontend/src/services/gpuService.ts` | Add `remoteService`, `overlayService` |
| `apps/frontend/src/services/index.ts` | Auto (re-exports `gpuService.ts`) |
| `apps/frontend/src/pages/index.ts` | Add `RemotePage`, `OverlayPage` exports |
| `apps/frontend/src/App.tsx` | Add remote/overlay to page registry |
| `apps/frontend/src/components/layout/Sidebar.tsx` | Add nav items for Remote + Overlay |
| NEW: `apps/frontend/src/pages/RemotePage.tsx` | Remote monitoring config page |
| NEW: `apps/frontend/src/pages/OverlayPage.tsx` | Overlay configuration page |
| NEW: `apps/frontend/src/stores/remoteStore.ts` | Remote server state |
| NEW: `apps/frontend/src/stores/overlayStore.ts` | Overlay configuration state |

---

## Verification

1. `npx tsc --noEmit` from `apps/frontend/` - **must pass with 0 errors**
2. `npx vite build` from `apps/frontend/` - **must succeed**
3. All previous pages still render correctly (no regressions)
