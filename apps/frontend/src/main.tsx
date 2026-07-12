import React from 'react';
import ReactDOM from 'react-dom/client';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { App } from './App';
import { OverlayHud } from './components/overlay/OverlayHud';
import './index.css';

/* The backend spawns a second webview window (label `overlay`) that loads this
   same bundle. Detect that window and render the lightweight transparent HUD
   instead of the full application. Falls back to the main app in a plain
   browser preview where the Tauri window API is unavailable. */
function isOverlayWindow(): boolean {
  try {
    return getCurrentWindow().label === 'overlay';
  } catch {
    return false;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>{isOverlayWindow() ? <OverlayHud /> : <App />}</React.StrictMode>,
);
