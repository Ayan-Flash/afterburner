# GPUControl Pro - Project Structure Documentation

> **Version**: 1.0.0  
> **Last Updated**: 2024  
> **Status**: Phase 1 Complete

---

## Table of Contents

1. [Overview](#overview)
2. [Root Directory](#root-directory)
3. [apps/ Directory](#apps-directory)
4. [packages/ Directory](#packages-directory)
5. [docs/ Directory](#docs-directory)
6. [scripts/ Directory](#scripts-directory)
7. [tests/ Directory](#tests-directory)
8. [assets/ Directory](#assets-directory)
9. [.github/ Directory](#github-directory)
10. [Configuration Files](#configuration-files)
11. [Scalability Design](#scalability-design)

---

## Overview

GPUControl Pro follows a **monorepo** structure with clear separation between applications, shared packages, and support files. This structure enables:

- **Independent Development**: Each app can be developed and tested separately
- **Code Reuse**: Shared code is in packages, avoiding duplication
- **Scalability**: Easy to add new applications and packages
- **Maintainability**: Clear boundaries and responsibilities

---

## Root Directory

```
gpucontrol-pro/
```

### Purpose

Root directory containing project-wide configuration, documentation, and tooling.

### Files

| File | Purpose | Future Scalability |
|------|---------|-------------------|
| `package.json` | Root package.json for monorepo tooling | Add workspace scripts |
| `Cargo.toml` | Rust workspace configuration | Add more crates |
| `tsconfig.json` | TypeScript root configuration | Add project references |
| `README.md` | Project overview | Update with new features |
| `.editorconfig` | Editor formatting rules | Add more languages |
| `.env.example` | Environment variable template | Add more variables |
| `.gitignore` | Git ignore rules | Add more patterns |

### Why This Structure?

The root directory contains only essential configuration files that apply to the entire project. Application-specific configuration is in the respective `apps/` subdirectories.

---

## apps/ Directory

```
apps/
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── base/
│   │   │   ├── composite/
│   │   │   ├── feature/
│   │   │   ├── layout/
│   │   │   └── page/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── stores/
│   │   ├── themes/
│   │   ├── types/
│   │   ├── utils/
│   │   └── App.tsx
│   ├── public/
│   ├── tests/
│   ├── package.json
│   └── tsconfig.json
│
└── backend/
    ├── src/
    │   ├── commands/
    │   ├── hardware/
    │   │   ├── nvidia/
    │   │   ├── amd/
    │   │   ├── intel/
    │   │   └── system/
    │   ├── monitoring/
    │   │   ├── engine/
    │   │   ├── collector/
    │   │   ├── aggregator/
    │   │   └── exporter/
    │   ├── plugins/
    │   │   ├── manager/
    │   │   ├── loader/
    │   │   └── types/
    │   ├── stores/
    │   ├── utils/
    │   ├── main.rs
    │   └── lib.rs
    ├── build.rs
    ├── Cargo.toml
    └── tauri.conf.json
```

### apps/frontend/

**Purpose**: React application for the user interface.

**Why Separate?**
- Completely decoupled from hardware access
- Can be developed and tested independently
- Can be replaced with different UI frameworks
- Enables code sharing through packages

**Subdirectories**:

| Directory | Purpose | Scalability |
|-----------|---------|-------------|
| `assets/` | Static assets (images, fonts, icons) | Add more asset types |
| `components/` | UI components (Atomic Design) | Add more components |
| `hooks/` | Custom React hooks | Add more hooks |
| `pages/` | Page components | Add more pages |
| `services/` | API services (Tauri wrappers) | Add more services |
| `stores/` | Zustand state stores | Add more stores |
| `themes/` | Theme configurations | Add more themes |
| `types/` | TypeScript type definitions | Add more types |
| `utils/` | Utility functions | Add more utilities |

**Future Scalability**:
- Add `mobile/` subdirectory for mobile app
- Add `web/` subdirectory for web version
- Add `electron/` subdirectory for Electron alternative

### apps/backend/

**Purpose**: Tauri backend with Rust for hardware access.

**Why Separate?**
- Hardware access is isolated from UI
- Rust provides memory safety and performance
- Tauri provides secure IPC
- Can be tested independently

**Subdirectories**:

| Directory | Purpose | Scalability |
|-----------|---------|-------------|
| `commands/` | Tauri command handlers | Add more commands |
| `hardware/` | Hardware access modules | Add more hardware |
| `monitoring/` | Monitoring engine | Add more features |
| `plugins/` | Plugin system | Add more plugins |
| `stores/` | Backend state management | Add more stores |
| `utils/` | Backend utilities | Add more utilities |

**Future Scalability**:
- Add `overlay/` subdirectory for overlay engine
- Add `network/` subdirectory for network features
- Add `analytics/` subdirectory for telemetry

---

## packages/ Directory

```
packages/
├── common/
│   ├── src/
│   │   ├── constants/
│   │   │   ├── gpu.ts
│   │   │   ├── monitoring.ts
│   │   │   └── errors.ts
│   │   ├── types/
│   │   │   ├── gpu.ts
│   │   │   ├── monitoring.ts
│   │   │   └── profile.ts
│   │   ├── utils/
│   │   │   ├── numbers.ts
│   │   │   ├── strings.ts
│   │   │   └── arrays.ts
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
│
├── monitoring/
│   ├── src/
│   │   ├── engine/
│   │   │   ├── mod.rs
│   │   │   ├── engine.rs
│   │   │   └── config.rs
│   │   ├── data/
│   │   │   ├── mod.rs
│   │   │   ├── types.rs
│   │   │   └── buffer.rs
│   │   └── index.ts
│   ├── package.json
│   └── Cargo.toml
│
└── plugins/
    ├── src/
    │   ├── types/
    │   │   ├── mod.rs
    │   │   ├── plugin.rs
    │   │   └── event.rs
    │   ├── manager/
    │   │   ├── mod.rs
    │   │   ├── manager.rs
    │   │   └── loader.rs
    │   └── index.ts
    ├── package.json
    └── Cargo.toml
```

### packages/common/

**Purpose**: Shared types, constants, and utilities between frontend and backend.

**Why Separate?**
- Prevents code duplication
- Ensures type consistency
- Enables sharing of constants
- Reduces bundle size

**Contents**:

| File | Purpose | Scalability |
|------|---------|-------------|
| `constants/gpu.ts` | GPU-related constants | Add more constants |
| `constants/monitoring.ts` | Monitoring constants | Add more constants |
| `constants/errors.ts` | Error codes | Add more errors |
| `types/gpu.ts` | GPU type definitions | Add more types |
| `types/monitoring.ts` | Monitoring type definitions | Add more types |
| `types/profile.ts` | Profile type definitions | Add more types |
| `utils/numbers.ts` | Number utilities | Add more utilities |
| `utils/strings.ts` | String utilities | Add more utilities |
| `utils/arrays.ts` | Array utilities | Add more utilities |

**Future Scalability**:
- Add `graphql/` for shared GraphQL types
- Add `validation/` for shared validation schemas
- Add `formatters/` for shared formatting functions

### packages/monitoring/

**Purpose**: Monitoring protocol and data structures.

**Why Separate?**
- Encapsulates monitoring logic
- Can be used by other applications
- Enables testing of monitoring logic
- Clear separation of concerns

**Contents**:

| File | Purpose | Scalability |
|------|---------|-------------|
| `engine/mod.rs` | Engine module | Add more engine features |
| `engine/engine.rs` | Core engine | Add more engine features |
| `engine/config.rs` | Engine configuration | Add more config options |
| `data/mod.rs` | Data module | Add more data types |
| `data/types.rs` | Data type definitions | Add more data types |
| `data/buffer.rs` | Data buffer | Add more buffer features |

**Future Scalability**:
- Add `exporters/` for data export formats
- Add `aggregators/` for data aggregation
- Add `filters/` for data filtering

### packages/plugins/

**Purpose**: Plugin system definitions and manager.

**Why Separate?**
- Encapsulates plugin logic
- Can be used by other applications
- Enables third-party plugin development
- Clear separation of concerns

**Contents**:

| File | Purpose | Scalability |
|------|---------|-------------|
| `types/mod.rs` | Types module | Add more types |
| `types/plugin.rs` | Plugin type definitions | Add more types |
| `types/event.rs` | Event type definitions | Add more types |
| `manager/mod.rs` | Manager module | Add more manager features |
| `manager/manager.rs` | Plugin manager | Add more manager features |
| `manager/loader.rs` | Plugin loader | Add more loader features |

**Future Scalability**:
- Add `registry/` for plugin registry
- Add `marketplace/` for plugin marketplace
- Add `scripts/` for scripting engine

---

## docs/ Directory

```
docs/
├── README.md
├── ARCHITECTURE.md
├── PROJECT_STRUCTURE.md
├── ROADMAP.md
├── CODING_GUIDELINES.md
├── COMPONENT_GUIDE.md
├── STATE_MANAGEMENT.md
├── DATA_FLOW.md
├── references/
│   ├── site-type-templates.md
│   ├── navigation-patterns.md
│   └── mermaid-templates.md
└── assets/
    ├── images/
    └── diagrams/
```

### Purpose

All project documentation, including:

- **README.md**: Project overview
- **ARCHITECTURE.md**: Detailed architecture
- **PROJECT_STRUCTURE.md**: This file
- **ROADMAP.md**: Development roadmap
- **CODING_GUIDELINES.md**: Coding standards
- **COMPONENT_GUIDE.md**: Component hierarchy
- **STATE_MANAGEMENT.md**: State management guide
- **DATA_FLOW.md**: Data flow documentation

### Scalability

- Add more documentation files as needed
- Add `api/` for API documentation
- Add `tutorials/` for step-by-step guides
- Add `troubleshooting/` for common issues

---

## scripts/ Directory

```
scripts/
├── build/
│   ├── build-frontend.sh
│   ├── build-backend.sh
│   └── build-all.sh
├── deploy/
│   ├── deploy-windows.sh
│   ├── deploy-macos.sh
│   └── deploy-linux.sh
└── dev/
    ├── dev-frontend.sh
    ├── dev-backend.sh
    └── dev-all.sh
```

### Purpose

Build, deploy, and development scripts.

### Scalability

- Add more scripts for new platforms
- Add scripts for CI/CD
- Add scripts for testing

---

## tests/ Directory

```
tests/
├── backend/
│   ├── integration/
│   │   └── hardware/
│   ├── unit/
│   │   ├── commands/
│   │   ├── hardware/
│   │   ├── monitoring/
│   │   └── plugins/
│   └── fixtures/
│
├── frontend/
│   ├── integration/
│   │   └── pages/
│   ├── unit/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── stores/
│   │   └── utils/
│   └── fixtures/
│
└── integration/
    ├── e2e/
    │   └── smoke/
    └── api/
```

### Purpose

All test files, organized by layer.

### Scalability

- Add more test types
- Add performance tests
- Add security tests

---

## assets/ Directory

```
assets/
├── icons/
│   ├── svg/
│   └── png/
├── images/
│   ├── screenshots/
│   └── marketing/
└── templates/
    ├── config/
    └── code/
```

### Purpose

Project assets, including icons, images, and templates.

### Scalability

- Add more asset types
- Add asset optimization scripts
- Add asset versioning

---

## .github/ Directory

```
.github/
├── workflows/
│   ├── ci.yml
│   ├── release.yml
│   └── deploy.yml
├── ISSUE_TEMPLATE/
│   ├── bug_report.md
│   ├── feature_request.md
│   └── question.md
└── PULL_REQUEST_TEMPLATE.md
```

### Purpose

GitHub configuration, including workflows, issue templates, and PR templates.

### Scalability

- Add more workflows
- Add more templates
- Add more automation

---

## Configuration Files

### Root Configuration Files

| File | Purpose | Scalability |
|------|---------|-------------|
| `package.json` | Root package.json | Add workspace scripts |
| `Cargo.toml` | Rust workspace | Add more crates |
| `tsconfig.json` | TypeScript config | Add project references |
| `.editorconfig` | Editor rules | Add more languages |
| `.env.example` | Env template | Add more variables |
| `.gitignore` | Git ignore | Add more patterns |

### apps/frontend/package.json

```json
{
  "name": "gpucontrol-pro-frontend",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext ts,tsx",
    "format": "prettier --write src"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router": "^6.20.0",
    "zustand": "^4.4.0",
    "framer-motion": "^10.16.0",
    "recharts": "^2.10.0",
    "@tauri-apps/api": "^2.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@typescript-eslint/eslint-plugin": "^6.10.0",
    "@typescript-eslint/parser": "^6.10.0",
    "@vitejs/plugin-react": "^4.2.0",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.53.0",
    "eslint-config-prettier": "^9.0.0",
    "eslint-plugin-react": "^7.33.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-tailwindcss": "^3.13.0",
    "postcss": "^8.4.31",
    "prettier": "^3.1.0",
    "prettier-plugin-tailwindcss": "^0.5.9",
    "tailwindcss": "^3.3.5",
    "typescript": "^5.2.2",
    "vite": "^5.0.0"
  }
}
```

### apps/backend/Cargo.toml

```toml
[workspace]
members = [
    "."
]

[package]
name = "gpucontrol-pro-backend"
version = "0.1.0"
edition = "2021"

[dependencies]
tauri = { version = "2.0", features = [] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
tokio = { version = "1.34", features = ["full"] }
thiserror = "1.0"

[dependencies.nvidia-ml-sys]
version = "0.1"

[dependencies.adl]
version = "0.1"

[build-dependencies]
tauri-build = { version = "2.0", features = [] }

[features]
default = []
dev = ["tauri/dev"]
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    "paths": {
      "@/*": ["./apps/frontend/src/*"],
      "@common/*": ["./packages/common/src/*"],
      "@monitoring/*": ["./packages/monitoring/src/*"],
      "@plugins/*": ["./packages/plugins/src/*"]
    }
  },
  "include": ["apps/frontend/src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

---

## Scalability Design

### Adding New Applications

1. Create new directory in `apps/`
2. Add to `package.json` workspace
3. Add to `Cargo.toml` workspace if Rust
4. Add to CI/CD workflows
5. Add to documentation

### Adding New Packages

1. Create new directory in `packages/`
2. Add to root `package.json` workspace
3. Add to root `Cargo.toml` workspace if Rust
4. Add to TypeScript configuration
5. Document in `docs/`

### Adding New Hardware Support

1. Create new module in `apps/backend/src/hardware/`
2. Implement hardware interface
3. Add to monitoring engine
4. Add to plugins system
5. Test on target hardware

### Adding New Features

1. Add to `ROADMAP.md`
2. Create feature branch
3. Implement in appropriate layer
4. Add tests
5. Update documentation
6. Merge to main

---

*Last updated: 2024-01-01*
