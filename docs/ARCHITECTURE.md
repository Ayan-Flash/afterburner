# GPUControl Pro - Architecture Documentation

> **Version**: 1.0.0  
> **Last Updated**: 2024  
> **Status**: Phase 1 Complete

---

## Table of Contents

1. [Overview](#overview)
2. [Overall System Architecture](#overall-system-architecture)
3. [Frontend Architecture](#frontend-architecture)
4. [Backend Architecture](#backend-architecture)
5. [Shared Packages](#shared-packages)
6. [IPC Communication Flow](#ipc-communication-flow)
7. [Data Flow](#data-flow)
8. [Event Flow](#event-flow)
9. [Monitoring Engine](#monitoring-engine)
10. [Plugin System](#plugin-system)
11. [Overlay System](#overlay-system)
12. [Logging System](#logging-system)
13. [Update System](#update-system)

---

## Overview

GPUControl Pro follows a **layered architecture** with strict separation between the user interface and hardware access layers. This architecture ensures:

- **Security**: Hardware access is sandboxed in the backend
- **Maintainability**: Clear boundaries between layers
- **Testability**: Each layer can be tested independently
- **Scalability**: New hardware, features, and monitors can be added easily

### Core Principles

- **Separation of Concerns**: UI and hardware access are completely decoupled
- **Single Responsibility**: Each module has one clear purpose
- **Dependency Injection**: Loose coupling through interfaces
- **Type Safety**: Full TypeScript coverage with strict type checking
- **Event-Driven**: Asynchronous communication through events

---

## Overall System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         GPUControl Pro Application                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                        Tauri Runtime                              │  │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌───────────────────┐ │  │
│  │  │   Webview UI    │  │   Main Process  │  │   Renderer Process│ │  │
│  │  │   (React/TS)    │  │   (Tauri)       │  │   (Electron-like) │ │  │
│  │  └────────┬────────┘  └────────┬────────┘  └───────────────────┘ │  │
│  │           │                    │                                  │  │
│  │           └────────────────────┘                                  │  │
│  │                        │                                          │  │
│  └────────────────────────┼──────────────────────────────────────────┘  │
│                           │ Tauri IPC                                   │
│                           ▼                                           │  │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                      Rust Backend Layer                           │  │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌───────────────────┐ │  │
│  │  │  Tauri Commands │  │  Monitoring     │  │  Plugin Manager   │ │  │
│  │  │                 │  │  Engine         │  │                   │ │  │
│  │  └────────┬────────┘  └────────┬────────┘  └───────────────────┘ │  │
│  │           │                    │                                  │  │
│  │           └────────────────────┘                                  │  │
│  │                        │                                          │  │
│  └────────────────────────┼──────────────────────────────────────────┘  │
│                           │                                           │  │
│  ┌────────────────────────▼──────────────────────────────────────────┐  │
│  │                   Hardware Access Layer                           │  │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌───────────┐│  │
│  │  │   NVIDIA     │ │    AMD       │ │   Intel      │ │  System   ││  │
│  │  │   NVML       │ │   ADL        │ │   IGD        │ │  WMI/ETW  ││  │
│  │  └──────────────┘ └──────────────┘ └──────────────┘ └───────────┘│  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Architecture Layers

| Layer | Purpose | Technology | Communication |
|-------|---------|------------|---------------|
| UI Layer | User interface and presentation | React, TypeScript | IPC Messages |
| Backend Layer | Business logic and state management | Rust, Tauri | IPC Messages |
| Monitoring Layer | Data collection and aggregation | Custom | Internal Rust |
| Hardware Layer | Direct hardware access | NVML, ADL, WMI | Direct API calls |

---

## Frontend Architecture

### Layer Structure

```
Frontend Application
├── Pages (Route Components)
│   ├── HomePage
│   ├── MonitoringPage
│   ├── ControlPage
│   ├── ProfilesPage
│   └── SettingsPage
│
├── Layouts (Page Structure)
│   ├── MainLayout (Sidebar + Header + Content)
│   ├── DashboardLayout (Grid-based)
│   └── SettingsLayout (Form-based)
│
├── Feature Components (Complex UI)
│   ├── MonitoringDashboard
│   ├── FanControlPanel
│   ├── ClockControlPanel
│   └── ProfileManager
│
├── Composite Components (Component Combinations)
│   ├── GraphCard
│   ├── StatCard
│   ├── ControlSlider
│   └── ToggleButton
│
├── Base Components (UI Primitives)
│   ├── Button
│   ├── Input
│   ├── Card
│   ├── Modal
│   └── Tooltip
│
└── Primitive Components (Atomic Elements)
    ├── Icon
    ├── Text
    ├── Divider
    └── Spacer
```

### Component Hierarchy

```
App (Root)
├── Layout (MainLayout)
│   ├── Sidebar (Navigation)
│   ├── Header (Top bar with CTA)
│   └── Content (Route-based)
│       └── MonitoringPage
│           ├── MonitoringDashboard (Feature)
│           │   ├── GPUSelector (Composite)
│           │   ├── GraphContainer (Composite)
│           │   │   ├── Recharts Graph (Base)
│           │   │   └── Legend (Base)
│           │   └── StatsGrid (Composite)
│           │       ├── StatCard (Composite)
│           │       │   ├── Icon (Primitive)
│           │       │   ├── Label (Primitive)
│           │       │   └── Value (Primitive)
│           │       └── FanControl (Composite)
│           │           ├── Slider (Base)
│           │           └── ValueDisplay (Base)
│           └── ProfileManager (Feature)
│               ├── ProfileList (Composite)
│               └── ProfileActions (Composite)
```

### State Management Architecture

```
State Management
├── Backend State (Zustand)
│   ├── gpuStore (GPU state and data)
│   ├── monitoringStore (Monitoring configuration)
│   ├── profileStore (Profile management)
│   └── uiStore (UI state: modals, themes)
│
├── Backend State (Rust)
│   ├── HardwareState (Direct hardware data)
│   ├── MonitoringState (Engine state)
│   └── PluginState (Loaded plugins)
│
└── IPC Bridge (Tauri Commands)
    ├── getGpuData
    ├── setFanSpeed
    ├── saveProfile
    └── loadProfile
```

---

## Backend Architecture

### Module Structure

```
Backend (Rust)
├── main.rs (Entry point)
│
├── commands/ (Tauri Command Handlers)
│   ├── gpu_commands.rs
│   ├── monitoring_commands.rs
│   ├── profile_commands.rs
│   └── plugin_commands.rs
│
├── hardware/ (Hardware Access Modules)
│   ├── mod.rs
│   ├── gpu.rs (GPU interface)
│   ├── nvidia.rs (NVML implementation)
│   ├── amd.rs (ADL implementation)
│   ├── intel.rs (IGD implementation)
│   └── system.rs (System monitoring)
│
├── monitoring/ (Monitoring Engine)
│   ├── mod.rs
│   ├── engine.rs (Core engine)
│   ├── collector.rs (Data collection)
│   ├── aggregator.rs (Data aggregation)
│   └── exporter.rs (Data export)
│
├── plugins/ (Plugin System)
│   ├── mod.rs
│   ├── manager.rs (Plugin manager)
│   ├── loader.rs (Plugin loader)
│   └── types.rs (Plugin types)
│
├── stores/ (Backend State Management)
│   ├── mod.rs
│   ├── gpu_store.rs
│   ├── monitoring_store.rs
│   └── profile_store.rs
│
├── utils/ (Backend Utilities)
│   ├── mod.rs
│   ├── error.rs (Error handling)
│   ├── logging.rs (Logging utilities)
│   └── config.rs (Configuration)
│
└── lib.rs (Library entry point)
```

### Backend Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Rust Backend                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    Tauri Command Layer                        │  │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌───────┐│  │
│  │  │   GPU Cmds   │ │Monitoring Cmd│ │ Profile Cmds │ │Plugin ││  │
│  │  └──────────────┘ └──────────────┘ └──────────────┘ └───────┘│  │
│  └───────────────────────────────────────────────────────────────┘  │
│                              │                                      │
│                              ▼                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                   Business Logic Layer                        │  │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌───────┐│  │
│  │  │   GPU Store  │ │Monitor Store │ │Profile Store │ │Plugin ││  │
│  │  └──────────────┘ └──────────────┘ └──────────────┘ └───────┘│  │
│  └───────────────────────────────────────────────────────────────┘  │
│                              │                                      │
│                              ▼                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                   Hardware Access Layer                       │  │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌───────┐│  │
│  │  │   NVIDIA     │ │    AMD       │ │   Intel      │ │System ││  │
│  │  │   NVML       │ │   ADL        │ │   IGD        │ │WMI/ETW││  │
│  │  └──────────────┘ └──────────────┘ └──────────────┘ └───────┘│  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Shared Packages

### packages/common

**Purpose**: Shared types, constants, and utilities between frontend and backend.

**Contents**:
- TypeScript type definitions
- Rust type definitions (via `common-types` crate)
- Application constants (GPU types, fan curves, etc.)
- Shared utility functions
- Error types

**Key Files**:
```typescript
// packages/common/src/types/gpu.ts
export interface GPUInfo {
  id: string;
  name: string;
  vendor: 'nvidia' | 'amd' | 'intel';
  index: number;
}

// packages/common/src/constants/gpu.ts
export const GPU_VENDORS = ['nvidia', 'amd', 'intel'] as const;
```

### packages/monitoring

**Purpose**: Monitoring protocol and data structures.

**Contents**:
- Monitoring data structures
- Protocol definitions
- Engine interfaces
- Data aggregation utilities

**Key Files**:
```typescript
// packages/monitoring/src/types/data.ts
export interface MonitoringData {
  gpuId: string;
  timestamp: number;
  temperature: number;
  clockSpeed: number;
  memoryUsage: number;
  fanSpeed: number;
  powerUsage: number;
}
```

### packages/plugins

**Purpose**: Plugin system definitions and manager.

**Contents**:
- Plugin types and interfaces
- Plugin manager
- Plugin loader
- Plugin communication protocol

**Key Files**:
```typescript
// packages/plugins/src/types/plugin.ts
export interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  enabled: boolean;
  
  init(): Promise<void>;
  destroy(): Promise<void>;
}
```

---

## IPC Communication Flow

### Message Flow

```
Frontend (React Component)
    │
    │ 1. Call Tauri command
    │ invoke('gpu_get_data')
    │
    ▼
Tauri Runtime (Renderer Process)
    │
    │ 2. Serialize message
    │ JSON: { command: 'gpu_get_data' }
    │
    ▼
Tauri Runtime (Main Process)
    │
    │ 3. Route to Rust backend
    │
    ▼
Rust Backend (Command Handler)
    │
    │ 4. Execute command
    │ backend::commands::gpu::get_data()
    │
    ▼
Backend Store / Hardware
    │
    │ 5. Retrieve data
    │
    ▼
Rust Backend (Command Handler)
    │
    │ 6. Serialize response
    │ JSON: { success: true, data: {...} }
    │
    ▼
Tauri Runtime (Main Process)
    │
    │ 7. Send response
    │
    ▼
Tauri Runtime (Renderer Process)
    │
    │ 8. Deserialize response
    │
    ▼
Frontend (React Component)
    │
    │ 9. Update state
    │ setGpuData(response.data)
    │
    ▼
UI Re-render
```

### Command Categories

| Category | Commands | Purpose |
|----------|----------|---------|
| GPU | `gpu_get_all`, `gpu_get_data`, `gpu_get_info` | GPU enumeration and data |
| Monitoring | `monitoring_start`, `monitoring_stop`, `monitoring_get_config` | Monitoring control |
| Control | `control_set_fan`, `control_set_clock`, `control_apply_profile` | GPU control |
| Profiles | `profile_save`, `profile_load`, `profile_delete` | Profile management |
| Plugins | `plugin_load`, `plugin_unload`, `plugin_list` | Plugin management |

### Message Schema

```typescript
// Request
interface TauriRequest {
  command: string;
  payload?: Record<string, unknown>;
}

// Response (Success)
interface TauriResponseSuccess<T> {
  success: true;
  data: T;
  timestamp: number;
}

// Response (Error)
interface TauriResponseError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: string;
  };
  timestamp: number;
}
```

---

## Data Flow

### Complete Data Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      Windows Operating System                           │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    Hardware Layer                                 │  │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌───────────┐│  │
│  │  │   GPU        │ │   RAM        │ │   Power      │ │  Thermal  ││  │
│  │  │   Sensors    │ │   Sensors    │ │   Sensors    │ │  Sensors  ││  │
│  │  └───────┬──────┘ └───────┬──────┘ └───────┬──────┘ └───────┬───┘│  │
│  └──────────┼────────────────┼────────────────┼────────────────┼─────┘  │
│             │                │                │                │         │
│             ▼                ▼                ▼                ▼         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                  Windows API Layer                                │  │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌───────────┐│  │
│  │  │   NVML       │ │   ADL        │ │   WMI        │ │   ETW     ││  │
│  │  │   (NVIDIA)   │ │   (AMD)      │ │   (Windows)  │ │   (Events)││  │
│  │  └───────┬──────┘ └───────┬──────┘ └───────┬──────┘ └───────┬───┘│  │
│  └──────────┼────────────────┼────────────────┼────────────────┼─────┘  │
│             │                │                │                │         │
│             └────────────────┴────────────────┴────────────────┘         │
│                              │                                          │
│                              ▼                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                 Rust Hardware Layer (hardware/)                   │  │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌───────────┐│  │
│  │  │   Nvidia     │ │    AMD       │ │   Intel      │ │  System   ││  │
│  │  │   Module     │ │   Module     │ │   Module     │ │  Module   ││  │
│  │  └───────┬──────┘ └───────┬──────┘ └───────┬──────┘ └───────┬───┘│  │
│  └──────────┼────────────────┼────────────────┼────────────────┼─────┘  │
│             │                │                │                │         │
│             └────────────────┴────────────────┴────────────────┘         │
│                              │                                          │
│                              ▼                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │               Rust Monitoring Engine (monitoring/)                │  │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌───────────┐│  │
│  │  │  Collector   │ │  Aggregator  │ │  Exporter    │ │  Buffer   ││  │
│  │  │  (Raw Data)  │ │  (Normalize) │ │  (Format)    │ │  (Cache)  ││  │
│  │  └───────┬──────┘ └───────┬──────┘ └───────┬──────┘ └───────┬───┘│  │
│  └──────────┼────────────────┼────────────────┼────────────────┼─────┘  │
│             │                │                │                │         │
│             └────────────────┴────────────────┴────────────────┘         │
│                              │                                          │
│                              ▼                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                  Rust Backend (backend/)                          │  │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌───────────┐│  │
│  │  │  Tauri       │ │  Stores      │ │  Plugins     │ │  Config   ││  │
│  │  │  Commands    │ │  (State)     │ │  Manager     │ │  Manager  ││  │
│  │  └──────────────┘ └──────────────┘ └──────────────┘ └───────────┘│  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                              │                                          │
│                              ▼ Tauri IPC                                │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                  Frontend Services (frontend/)                    │  │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌───────────┐│  │
│  │  │  GPU Service │ │Monitor Service│ │Profile Service│ │Plugin   ││  │
│  │  └───────┬──────┘ └───────┬──────┘ └───────┬──────┘ └───────┬───┘│  │
│  └──────────┼────────────────┼────────────────┼────────────────┼─────┘  │
│             │                │                │                │         │
│             └────────────────┴────────────────┴────────────────┘         │
│                              │                                          │
│                              ▼                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │              Zustand Stores (frontend/stores/)                    │  │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌───────────┐│  │
│  │  │  GPU Store   │ │Monitor Store │ │Profile Store │ │UI Store   ││  │
│  │  └──────────────┘ └──────────────┘ └──────────────┘ └───────────┘│  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                              │                                          │
│                              ▼                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │              React Components (frontend/components/)              │  │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌───────────┐│  │
│  │  │  Monitoring  │ │  Control     │ │  Profile     │ │ Settings  ││  │
│  │  │  Dashboard   │ │  Panel       │ │  Manager     │ │  UI       ││  │
│  │  └──────────────┘ └──────────────┘ └──────────────┘ └───────────┘│  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Event Flow

### Event Categories

```
Events
├── Hardware Events
│   ├── gpu_connected
│   ├── gpu_disconnected
│   ├── gpu_temperature_critical
│   ├── gpu_fan_failure
│   └── gpu_power_limit_exceeded
│
├── Monitoring Events
│   ├── monitoring_data_updated
│   ├── monitoring_profile_changed
│   └── monitoring_threshold_breach
│
├── Control Events
│   ├── control_fan_speed_changed
│   ├── control_clock_speed_changed
│   └── control_profile_applied
│
├── Profile Events
│   ├── profile_saved
│   ├── profile_loaded
│   ├── profile_deleted
│   └── profile_switched
│
└── Plugin Events
    ├── plugin_loaded
    ├── plugin_unloaded
    ├── plugin_error
    └── plugin_data_updated
```

### Event Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                     Event Bus (Backend)                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────┐         ┌─────────────────┐                   │
│  │  Event Source   │         │  Event Handler  │                   │
│  │  (Hardware/API) │────────►│  (Backend)      │                   │
│  └─────────────────┘         └────────┬────────┘                   │
│                                       │                            │
│                                       ▼                            │
│  ┌─────────────────┐         ┌─────────────────┐                   │
│  │  Event Store    │         │  Event Queue    │                   │
│  │  (Buffer)       │         │  (FIFO)         │                   │
│  └─────────────────┘         └────────┬────────┘                   │
│                                       │                            │
│                                       ▼                            │
│  ┌─────────────────┐         ┌─────────────────┐                   │
│  │  Event Bus      │◄────────│  Event Router   │                   │
│  │  (Publish/      │         │  (Filter/       │                   │
│  │   Subscribe)    │         │   Forward)      │                   │
│  └─────────────────┘         └────────┬────────┘                   │
│                                       │                            │
│                                       ▼                            │
│  ┌─────────────────┐         ┌─────────────────┐                   │
│  │  IPC Bridge     │         │  Frontend       │                   │
│  │  (Tauri)        │────────►│  Event Listeners│                   │
│  └─────────────────┘         └─────────────────┘                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Monitoring Engine

### Architecture

```
Monitoring Engine
├── Engine (Core)
│   ├── start()
│   ├── stop()
│   ├── add_target()
│   └── remove_target()
│
├── Collector (Data Collection)
│   ├── collect_gpu_data()
│   ├── collect_system_data()
│   └── collect_temperature_data()
│
├── Aggregator (Data Normalization)
│   ├── normalize_data()
│   ├── calculate_stats()
│   └── apply_filters()
│
├── Exporter (Data Formatting)
│   ├── format_gpu_data()
│   ├── format_time_series()
│   └── export_to_json()
│
└── Buffer (Data Caching)
    ├── push_sample()
    ├── get_samples()
    └── clear_buffer()
```

### Data Flow

```
Hardware Sensors
    │
    ▼
Collector (Raw Data)
    │
    ▼
Aggregator (Normalized Data)
    │
    │  - Convert units
    │  - Calculate averages
    │  - Apply filters
    ▼
Buffer (Time-Series Cache)
    │
    │  - Store last N samples
    │  - Maintain time window
    ▼
Exporter (Query Format)
    │
    │  - Format for API
    │  - Apply transformations
    ▼
Backend Store
    │
    ▼
Frontend (via IPC)
```

### Configuration

```rust
struct MonitoringConfig {
    sample_rate_ms: u64,
    buffer_size: usize,
    retention_hours: u32,
    triggers: Vec<TriggerConfig>,
}

struct TriggerConfig {
    metric: MetricType,
    threshold: f64,
    action: TriggerAction,
}
```

---

## Plugin System

### Architecture

```
Plugin System
├── Plugin Manager
│   ├── load_plugin()
│   ├── unload_plugin()
│   ├── enable_plugin()
│   └── disable_plugin()
│
├── Plugin Loader
│   ├── discover_plugins()
│   ├── validate_plugin()
│   └── instantiate_plugin()
│
├── Plugin Host
│   ├── provide_api()
│   ├── handle_events()
│   └── manage_lifecycle()
│
└── Plugin API
    ├── init()
    ├── destroy()
    ├── on_event()
    └── get_metadata()
```

### Plugin Types

| Type | Purpose | Example |
|------|---------|---------|
| Hardware | Add new GPU support | Intel ARC plugin |
| Monitoring | Add metrics | VRAM monitoring |
| Control | Add controls | OC profile automation |
| UI | Add UI elements | Custom dashboard |
| Export | Add export formats | CSV, JSON, XML |

### Plugin Interface

```rust
trait Plugin {
    fn id(&self) -> &str;
    fn name(&self) -> &str;
    fn version(&self) -> &str;
    
    fn init(&mut self) -> Result<(), PluginError>;
    fn destroy(&mut self) -> Result<(), PluginError>;
    
    fn on_event(&mut self, event: &PluginEvent) -> Result<(), PluginError>;
    fn get_data(&self) -> Result<PluginData, PluginError>;
}
```

---

## Overlay System

### Architecture

```
Overlay System
├── Overlay Manager
│   ├── create_overlay()
│   ├── destroy_overlay()
│   └── update_position()
│
├── Overlay Renderer
│   ├── render_gpu_stats()
│   ├── render_fan_speed()
│   └── render_clock_speeds()
│
├── Overlay Config
│   ├── position
│   ├── opacity
│   ├── visible_gpus
│   └── visible_metrics
│
└── Hook Manager
    ├── hook_present()
    ├── hook_resize()
    └── hook_focus()
```

### Overlay Features

- **Position**: Top-left, top-right, bottom-left, bottom-right
- **Opacity**: 25% - 100%
- **Metrics**: Customizable per GPU
- **Update Rate**: 10Hz, 30Hz, 60Hz
- **GPU Selection**: Show all or specific GPUs

---

## Logging System

### Architecture

```
Logging System
├── Logger
│   ├── info()
│   ├── warn()
│   ├── error()
│   └── debug()
│
├── Logger Config
│   ├── level
│   ├── file_path
│   ├── max_size
│   └── max_files
│
├── Logger Backend
│   ├── Console
│   ├── File
│   └── System (Windows Event Log)
│
└── Log Format
    ├── Timestamp
    ├── Level
    ├── Module
    └── Message
```

### Log Levels

| Level | Purpose | Example |
|-------|---------|---------|
| `trace` | Detailed debugging | Function entry/exit |
| `debug` | Debug information | Variable states |
| `info` | General information | Application start |
| `warn` | Warnings | Deprecated API usage |
| `error` | Errors | Failed operations |
| `critical` | Critical failures | Hardware access failure |

---

## Update System

### Architecture

```
Update System
├── Update Manager
│   ├── check_for_updates()
│   ├── download_update()
│   └── install_update()
│
├── Update Source
│   ├── GitHub Releases
│   ├── Custom API
│   └── Local File
│
├── Update Verification
│   ├── Signature verification
│   ├── Hash verification
│   └── Integrity check
│
└── Update Notification
    ├── Tray notification
    ├── In-app notification
    └── Email notification
```

### Update Flow

```
1. Check for Updates (Manual/Auto)
   │
   ▼
2. Query Update Source (GitHub API)
   │
   ▼
3. Compare Versions
   │
   ▼
4. If New Version Available
   │
   ▼
5. Download Update (Signed)
   │
   ▼
6. Verify Signature/Hash
   │
   ▼
7. Install Update (Silent/Manual)
   │
   ▼
8. Restart Application
```

---

## Version History

| Version | Date | Status | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2024-01-01 | Phase 1 Complete | Initial architecture and documentation |

---

## References

- [Tauri Documentation](https://tauri.app)
- [Rust API Guidelines](https://rust-lang.github.io/api-guidelines/)
- [React Best Practices](https://react.dev/learn)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

*Last updated: 2024-01-01*
