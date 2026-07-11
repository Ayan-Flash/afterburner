Armoury Crate UI Reconstruction — Implementation Plan
Goal
Rebuild the frontend of the existing Tauri v2 + React application to be a pixel-accurate clone of the ASUS Armoury Crate dashboard interface (reference image), with one intentional modification: replace the Aura Sync panel with a GPU Monitoring panel that visually mirrors the CPU panel.

Background & Current State
The existing codebase is a fully different UI — a modern card-based GPU monitoring dashboard using Tailwind CSS. It shares zero visual resemblance to the reference. The entire frontend UI layer must be rebuilt from scratch while preserving the backend Tauri/Rust data pipeline.

What We Keep
Backend: All Rust commands (gpu_commands.rs, monitoring, hardware providers) remain unchanged
Services: gpuService.ts (Tauri invoke wrappers) — kept and extended
Stores: gpuStore.ts — kept, extended with CPU data support
Build system: vite.config.ts, package.json, tauri.conf.json
What Gets Rebuilt
All React components (sidebar, header, dashboard, gauge, panels)
All CSS (replacing Tailwind with CSS Modules/handcrafted CSS)
The main App.tsx and layout structure
Visual Reverse Engineering — Reference Analysis
From the reference image, here are the extracted measurements and specifications:

Overall Layout
Window: ~1024×576px content area (fixed, not responsive)
Title bar: Native Windows title bar with "Armoury Crate" text + ROG logo, ~32px
Sidebar: ~48px wide (icon-only, collapsed), dark background
Header/Dashboard bar: "Dashboard" title + system info strip, ~40px
Main content: Split into left (gauge area ~45%) and right (panels ~55%)
Bottom tabs: "Frequency / Temperature / Usage / Fan / Voltage" tab bar, ~36px
Color Palette (extracted from reference)
Element	Color
Window background	#1a1a2e to #16213e dark navy gradient
Sidebar bg	#0f0f1a very dark
Sidebar active icon	light blue-white with glow
Panel bg	#1a1d2e dark with subtle border
Panel border	#2a2d3e muted border
Panel title bar	Dark with right-side settings icon
Corner decorations	Small L-shaped cyan/blue corners on panels
Accent glow	Cyan/teal #00d4ff type color
Red accent	#ff3333 / #cc0000 (gauge red zone)
Blue accent	#3399ff / #0088ff (gauge blue zone, frequency bars)
Text primary	#ffffff white
Text secondary	#8899aa muted gray-blue
CPU core cards bg	Dark #1e2030 with left color accent bar
Footer tabs bg	#0f1020 darker
Active tab	Slightly lighter bg with top border accent
Sidebar (~48px wide)
7-8 icon buttons vertically stacked
Icons: info(i), layout grid, device+, layers, lightbulb, notification bell
Active state: brighter icon, possible left accent bar
Bottom: notification icon with red badge count
Header Bar
Left: "Dashboard" in bold ~18px white
Center-left: System specs text: "ROG STRIX B550-E GAMING • AMD Ryzen 7 2700X Eight-Core Processor • DRAM (32GB & 2133) • BIOS ver.8003"
Right: Two icon buttons (grid view toggles)
CPU Gauge (centerpiece, left area)
Large ~280px diameter circular gauge
Sweep angle ~270° (from ~225° to ~-45°, bottom gap)
Tick marks: ~60+ small ticks around the circumference
Color gradient on the arc: blue→red (cool→hot) from left to right
Multiple concentric rings (3-4 rings with decreasing opacity)
Inner digital trace pattern (circuit-board-like decorative lines)
Center: Large "3467" in bold monospace ~48px, "MHz" below ~14px, "CPU" below that
Scale labels: "0" at left bottom, "Max" at right bottom
Needle/highlight: bright sweep indicator at current value position
Glow effect: ambient glow matching the current value zone color
Dot markers along the arc
CPU Core Cards (below gauge, 2×2 grid)
4 cards: CPU Core 0, Core 1, Core 2, Core 3
Each: small icon/dot, "CPU Core X" label, large frequency value (e.g., "4139 MHz")
Left accent bar on each card (colored strip)
Background: dark panel with subtle border
Approximate card size: ~180×60px each
CPU Panel (top-right, "CPU Core 0")
Title bar: "CPU Core 0" with settings icon (gear/dots)
Frequency row: "Frequency" label + "4139MHz" value, with blue bar graph below
CPU Core Voltage: "0.976V"
Temperature: "31°C"
Panel has corner decorations (small L-shaped cyan marks at corners)
GPU Panel (top-right, replaces "Aura Sync")
Title: "GPU RTX 3060" with same settings icon
Same visual structure as CPU panel
Frequency: "219MHz"
GPU Voltage: "0.625V"
Temperature: "33°C"
Usage: "8%"
VRAM: "1.3/12GB"
GPU Memory Clock (additional metric)
Fan Speed Panel (middle-right)
Title bar: "Fan Speed" with corner decorations
4 fan icons in a row: Silence, Standard, Turbo, Full speed
Stylized fan/propeller SVG icons
Labels below each icon
Game Launcher Panel (bottom-left of right section)
Title: "Game Launcher" with corner decorations
Row of game icons with names below (Aim Lab, Xuan-Yuan Sword VII, Door Kickers 2, 9 Monkeys of Shaolin)
My Profile Panel (bottom-right)
Title: "My Profile" with corner decorations
Hexagonal/geometric ROG-style icon
"Welcome to ARMOURY CRATE" text
"Log In" and "Register Your Product" buttons
Bottom Tabs
5 tabs: Frequency, Temperature, Usage, Fan, Voltage
Active tab (Frequency) has highlighted/active state
Proposed Changes
Phase 1: Foundation — CSS System & Layout Shell
IMPORTANT

The entire Tailwind CSS system will be removed and replaced with handcrafted CSS. This is required because the reference uses very specific dark, textured styling that cannot be accurately replicated with utility classes.

[MODIFY] 
index.html
Add Google Fonts link (Inter + JetBrains Mono)
Change title to "Armoury Crate"
Remove Tailwind body classes
[NEW] 
armoury-crate.css
Complete handcrafted CSS system matching reference colors, spacing, typography
CSS custom properties for all extracted colors
Panel styles, corner decorations, glow effects
Gauge styles, sidebar styles, header styles
[MODIFY] 
index.css
Remove all Tailwind directives and utility classes
Import the new CSS system
Phase 2: Layout Components
[MODIFY] 
MainLayout.tsx
Restructure to match reference: title bar → sidebar + main area → bottom tabs
Fixed dimensions matching the reference
[NEW] 
TitleBar.tsx
Custom title bar with "Armoury Crate" text, ROG icon, window controls
[MODIFY] 
Sidebar.tsx
Rebuild as ~48px icon-only sidebar matching reference
6-7 icons matching the reference exactly
Active state with glow effect
[MODIFY] 
Header.tsx
"Dashboard" title + system specs strip + right-side toggle icons
Phase 3: CPU Gauge Component
[NEW] 
CpuGauge.tsx
SVG/Canvas-based circular gauge matching reference exactly
Tick marks, concentric rings, digital trace decorations
Gradient arc (blue→red), needle, glow effects
Center value display (MHz + CPU label)
Animation: smooth sweep on value updates
[NEW] 
CpuGauge.module.css
Gauge-specific styles, glow, animations
Phase 4: CPU Core Cards
[NEW] 
CpuCoreCards.tsx
2×2 grid of CPU core frequency cards
Each with color accent bar, core label, frequency value
Matching the reference card dimensions and styling
Phase 5: Info Panels
[NEW] 
CpuPanel.tsx
"CPU Core 0" panel with frequency, voltage, temperature
Blue bar graph for frequency
Corner decorations, settings icon
Matching reference panel dimensions exactly
[NEW] 
GpuPanel.tsx
"GPU RTX 3060" panel — visually identical to CPU panel
Shows: Frequency, GPU Voltage, Temperature, Usage, VRAM, GPU Memory Clock
Same border, corners, typography, spacing, gradient, shadow
[NEW] 
PanelFrame.tsx
Shared panel frame component with corner decorations
Used by CPU, GPU, Fan, Game Launcher, Profile panels
Phase 6: Fan, Game Launcher, Profile Panels
[NEW] 
FanPanel.tsx
"Fan Speed" panel with 4 fan mode icons (Silence, Standard, Turbo, Full speed)
[NEW] 
GameLauncher.tsx
"Game Launcher" panel with game icon grid
[NEW] 
ProfilePanel.tsx
"My Profile" with ROG icon, welcome text, Log In / Register buttons
Phase 7: Bottom Navigation
[NEW] 
BottomTabs.tsx
5-tab bar: Frequency, Temperature, Usage, Fan, Voltage
Active tab highlighting matching reference
Phase 8: Dashboard Page Assembly
[MODIFY] 
DashboardPage.tsx
Complete rewrite assembling all armoury components
Layout: Gauge (left) + Panels grid (right)
Core cards below gauge
Bottom tabs
[MODIFY] 
App.tsx
Simplified routing (dashboard-focused)
Remove loading states that don't match reference
Phase 9: Data Integration
[NEW] 
cpuService.ts
CPU data service wrapping Tauri invoke for CPU metrics
Will need corresponding Rust backend commands (or extend simulated provider)
Backend: Extend for CPU data
The backend already has simulated hardware providers
May need to add CPU-specific commands or use WMI provider for CPU data
Open Questions
IMPORTANT

Q1: CPU Data Source — The reference shows CPU data (core frequencies, voltages, temperatures). The current Rust backend only has GPU monitoring. Should I:

(a) Add real CPU monitoring via WMI/sysinfo crate in Rust, or
(b) Use simulated/mock CPU data for now and focus on UI accuracy first?
IMPORTANT

Q2: Window Title Bar — The reference shows a custom title bar with "Armoury Crate" and window controls (minimize/maximize/close). Should I:

(a) Keep the native Windows title bar and just change the title text, or
(b) Implement a custom frameless window with a custom title bar component?
IMPORTANT

Q3: Tailwind Removal — The existing codebase uses Tailwind CSS extensively across 15+ page components and many shared components. Since we're only rebuilding the Dashboard page to match the reference:

(a) Remove Tailwind entirely and rewrite everything in handcrafted CSS, or
(b) Keep Tailwind for non-dashboard pages and use CSS Modules only for the new Armoury Crate components?
IMPORTANT

Q4: Window Size — The reference appears to be a fixed-size application (~1024×576 content). Should I:

(a) Make the window fixed-size (not resizable), or
(b) Keep it resizable but design for a specific target size?
Verification Plan
After Each Component
Run npm run dev in the frontend
Screenshot the component/page
Visually compare with reference image
Measure pixel differences in spacing, color, size
Iterate until indistinguishable
Automated Tests
npm run typecheck — Ensure TypeScript compiles
npm run build — Ensure production build succeeds
Manual Verification
Side-by-side comparison of rendered output vs reference image at each phase
Request user approval before proceeding to next section