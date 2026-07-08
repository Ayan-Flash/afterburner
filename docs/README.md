# GPUControl Pro

> **Professional GPU Monitoring & Control for Windows**  
> Enterprise-grade desktop application inspired by MSI Afterburner, built with modern architecture and production-quality code.

[![Version](https://img.shields.io/badge/version-0.1.0-blue)](https://github.com/yourorg/gpucontrol-pro/releases)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![Rust](https://img.shields.io/badge/rust-1.70+-orange)](https://www.rust-lang.org)
[![Tauri](https://img.shields.io/badge/tauri-v2.0+-blue)](https://tauri.app)
[![React](https://img.shields.io/badge/react-18+-blue)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/typescript-5.0+-blue)](https://typescriptlang.org)

---

## 🎯 Project Overview

GPUControl Pro is a professional desktop application that provides real-time GPU monitoring, overclocking capabilities, fan control, and performance optimization for Windows systems. Built from the ground up with enterprise-quality architecture, it serves as a modern alternative to legacy GPU control utilities.

### Vision

To create the most reliable, extensible, and user-friendly GPU monitoring and control application for Windows, setting new standards for desktop application architecture and performance.

### Goals

1. **Reliability**: Zero crashes, zero data corruption, production-grade stability
2. **Performance**: Sub-millisecond monitoring updates with minimal CPU overhead
3. **Extensibility**: Plugin system for future hardware support and features
4. **User Experience**: Intuitive interface with customizable layouts and workflows
5. **Security**: Sandboxed hardware access, secure communication channels

---

## 🚀 Features

### Phase 1 (Core Platform)
- ✅ Real-time GPU monitoring (clock speeds, temperatures, memory usage)
- ✅ Fan speed control with customizable profiles
- ✅ GPU clock overclocking/underclocking
- ✅ Multiple GPU support (NVIDIA, AMD, Intel)
- ✅ Profile management (save/load/switch profiles)
- ✅ System tray integration
- ✅ Auto-start on boot

### Phase 2 (Advanced Monitoring)
- ⏳ Power consumption monitoring
- ⏳ VRAM timing control
- ⏳ Voltage control
- ⏳ Batch profile management
- ⏳ Performance logging and analysis
- ⏳ Alert system (temperature, fan failure)

### Phase 3 (Professional Features)
- ⏳ Overlay for gaming (FPS, GPU usage, temperatures)
- ⏳ Scripting engine for automation
- ⏳ Remote monitoring via web interface
- ⏳ Multi-user support with permissions
- ⏳ Integration with streaming software (OBS, Streamlabs)

### Future
- ⏳ AI-powered optimization suggestions
- ⏳ Cloud profile synchronization
- ⏳ Community profile marketplace
- ⏳ Mobile companion app

---

## 🏗️ Technology Stack

### Desktop Runtime
- **Tauri v2** - Modern, secure desktop runtime
- **Rust** - System-level hardware access and performance-critical code

### Frontend
- **React 18** - UI component library
- **TypeScript** - Type-safe development
- **Vite** - Fast development and build tooling
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing
- **Zustand** - State management
- **Framer Motion** - Animations
- **Recharts** - Data visualization

### Monitoring & Hardware
- **LibreHardwareMonitor** - Hardware monitoring library
- **NVML (NVIDIA Management Library)** - NVIDIA GPU control
- **AMD ADL (Display Library)** - AMD GPU control
- **Windows APIs** - System integration
- **DXGI** - Graphics adapter enumeration
- **ETW** - Event tracing
- **WMI** - Windows management instrumentation

### Development Tools
- **ESLint** - Code quality
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **lint-staged** - Pre-commit checks
- **Rust Analyzer** - IDE support

---

## 📐 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         GPUControl Pro                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────┐         ┌─────────────────┐                   │
│  │   Frontend UI   │  IPC    │   Rust Backend  │                   │
│  │   (React/TS)    │◄───────►│   (Tauri/Rust)  │                   │
│  │                 │         │                 │                   │
│  │  • Components   │  Messages│  • Hardware     │                   │
│  │  • Stores       │         │    Access       │                   │
│  │  • Routing      │         │  • Monitoring   │                   │
│  │  • State        │         │    Engine       │                   │
│  └─────────────────┘         └─────────────────┘                   │
│                                     │                               │
│                                     ▼                               │
│                    ┌─────────────────────────────┐                  │
│                    │   Hardware Monitoring Layer │                  │
│                    ├─────────────────────────────┤                  │
│                    │  • NVIDIA (NVML)            │                  │
│                    │  • AMD (ADL)                │                  │
│                    │  • Intel (IGD)              │                  │
│                    │  • System (WMI/ETW)         │                  │
│                    └─────────────────────────────┘                  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Key Architectural Principles

- **Separation of Concerns**: UI and hardware access are completely decoupled
- **Single Responsibility**: Each module has one clear purpose
- **Scalability**: Architecture supports adding new hardware, features, and monitors
- **Type Safety**: Full TypeScript coverage with strict type checking
- **Testability**: Clean interfaces enable unit and integration testing
- **Maintainability**: Clear folder structure and documentation

---

## 📁 Folder Structure

```
gpucontrol-pro/
├── apps/                       # Applications
│   ├── frontend/              # React application (UI)
│   │   ├── src/
│   │   │   ├── assets/        # Static assets
│   │   │   ├── components/    # Reusable components
│   │   │   ├── hooks/         # Custom React hooks
│   │   │   ├── pages/         # Page components
│   │   │   ├── services/      # API services
│   │   │   ├── stores/        # Zustand state stores
│   │   │   ├── themes/        # Theme configurations
│   │   │   ├── types/         # TypeScript type definitions
│   │   │   ├── utils/         # Utility functions
│   │   │   └── App.tsx
│   │   └── package.json
│   └── backend/               # Tauri backend
│       ├── src/
│       │   ├── commands/      # Tauri commands
│       │   ├── hardware/      # Hardware access modules
│       │   ├── monitoring/    # Monitoring engine
│       │   ├── plugins/       # Plugin system
│       │   ├── stores/        # Backend state management
│       │   ├── utils/         # Backend utilities
│       │   └── main.rs
│       └── Cargo.toml
│
├── packages/                   # Shared packages
│   ├── common/                # Shared types, constants, utilities
│   │   ├── src/
│   │   │   ├── constants/     # Application constants
│   │   │   ├── types/         # Shared TypeScript types
│   │   │   ├── utils/         # Shared utilities
│   │   │   └── index.ts
│   │   └── package.json
│   ├── monitoring/            # Monitoring protocol definitions
│   │   ├── src/
│   │   │   ├── engine/        # Monitoring engine interface
│   │   │   ├── data/          # Data structures
│   │   │   └── index.ts
│   │   └── package.json
│   └── plugins/               # Plugin system definitions
│       ├── src/
│       │   ├── types/         # Plugin types
│       │   ├── manager/       # Plugin manager
│       │   └── index.ts
│       └── package.json
│
├── docs/                       # Documentation
│   ├── README.md              # This file
│   ├── ARCHITECTURE.md        # Detailed architecture
│   ├── PROJECT_STRUCTURE.md   # Folder structure explanation
│   ├── ROADMAP.md             # Development roadmap
│   ├── CODING_GUIDELINES.md   # Coding standards
│   ├── COMPONENT_GUIDE.md     # Component hierarchy
│   ├── STATE_MANAGEMENT.md    # State management guide
│   └── DATA_FLOW.md           # Data flow documentation
│
├── scripts/                    # Build and automation scripts
│   ├── build/                 # Build scripts
│   ├── deploy/                # Deployment scripts
│   └── dev/                   # Development scripts
│
├── tests/                      # Test files
│   ├── backend/               # Rust tests
│   ├── frontend/              # Frontend tests
│   └── integration/           # Integration tests
│
├── assets/                     # Project assets
│   ├── icons/                 # Application icons
│   ├── images/                # Images and screenshots
│   └── templates/             # Configuration templates
│
├── .github/                    # GitHub configuration
│   ├── workflows/             # CI/CD workflows
│   ├── ISSUE_TEMPLATE/        # Issue templates
│   └── PULL_REQUEST_TEMPLATE.md
│
├── .editorconfig              # Editor formatting rules
├── .env.example               # Environment variable template
├── .gitignore                 # Git ignore rules
├── Cargo.toml                 # Rust workspace configuration
├── package.json               # Root package.json
├── README.md                  # Project overview
└── tsconfig.json              # TypeScript configuration
```

---

## 🛠️ Installation

### Prerequisites

- **Rust**: 1.70+ ([Install](https://rustup.rs))
- **Node.js**: 18+ ([Install](https://nodejs.org))
- **npm**: 9+ or **pnpm**: 7+ ([Install](https://pnpm.io))
- **Git**: Latest ([Install](https://git-scm.com))

### Clone the Repository

```bash
git clone https://github.com/yourorg/gpucontrol-pro.git
cd gpucontrol-pro
```

### Install Dependencies

```bash
# Install Rust dependencies
cargo build

# Install Node.js dependencies
pnpm install
# or
npm install
```

### Build the Application

```bash
# Development build
pnpm dev

# Production build
pnpm build
```

### Run Tests

```bash
# Run all tests
pnpm test

# Run Rust tests only
cargo test

# Run frontend tests only
pnpm test:frontend
```

---

## 🚧 Development

### Start Development Server

```bash
pnpm dev
```

This starts both the Tauri backend and React frontend in development mode with hot-reload.

### Build for Production

```bash
pnpm build
```

### Run Linting

```bash
pnpm lint
```

### Format Code

```bash
pnpm format
```

### Common Tasks

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build production application |
| `pnpm lint` | Run ESLint on all code |
| `pnpm format` | Format code with Prettier |
| `pnpm test` | Run all tests |
| `pnpm check` | Run type checking |

---

## 📋 Project Roadmap

See [docs/ROADMAP.md](docs/ROADMAP.md) for detailed development phases.

### Current Phase: Phase 1 (Core Platform)
- [x] Project architecture and documentation
- [ ] Core monitoring engine
- [ ] GPU detection and enumeration
- [ ] Basic monitoring data collection
- [ ] Fan control interface
- [ ] Clock control interface
- [ ] Profile management system

### Upcoming Phases
- **Phase 2**: Advanced monitoring and logging
- **Phase 3**: Overlay and automation
- **Phase 4**: Professional features and integrations
- **Phase 5**: Mobile app and cloud sync

---

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md).

### Contribution Steps

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🚀 Future Plans

- **Phase 4**: Professional features (overlay, scripting, remote monitoring)
- **Phase 5**: Mobile companion app (iOS/Android)
- **Phase 6**: Cloud synchronization and profile marketplace
- **Phase 7**: AI-powered optimization and predictive analytics

---

## 🙏 Credits

- Inspired by [MSI Afterburner](https://www.msi.com/page/afterburner)
- Built with [Tauri](https://tauri.app)
- Monitoring powered by [LibreHardwareMonitor](https://github.com/LibreHardwareMonitor/LibreHardwareMonitor)
- Icons from [Phosphor Icons](https://phosphoricons.com)

---

## 📞 Contact

- **Website**: [https://gpucontrol.pro](https://gpucontrol.pro)
- **Email**: team@gpucontrol.pro
- **Issues**: [GitHub Issues](https://github.com/yourorg/gpucontrol-pro/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourorg/gpucontrol-pro/discussions)

---

<p align="center">
  <strong>Building the future of GPU monitoring, one commit at a time.</strong>
</p>
