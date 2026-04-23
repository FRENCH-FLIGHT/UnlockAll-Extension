# 🔓 UnlockAll – Web Freedom & Accessibility

**UnlockAll** is a professional-grade browser extension designed to restore user agency and accessibility by bypassing artificial website restrictions. It gives you back control over how you interact with the web.

## 🌟 Key Features

### 🖱️ Mouse & Content Control
- **Right-Click Restoration**: Re-enables the native context menu on sites that disable it.
- **Advanced Text Selection**: Overrides `user-select: none` and other protections to let you highlight any content.
- **Visible Cursor Force**: Ensures your mouse pointer remains visible even when hidden by CSS or scripts.
- **Interactive Overlays**: Neutralizes transparent layers that prevent you from clicking on underlying content.

### 📋 Clipboard & Interaction
- **Smart Clipboard Access**: Restores native Copy, Cut, and Paste functionality (Ctrl+C/V/X).
- **Shortcut Preservation**: Prevents websites from hijacking standard browser keyboard shortcuts.
- **Focus Hijack Protection**: Stops websites from forcefully stealing your cursor focus or locking your input fields.

### 📜 Navigation & Layout
- **Infinite Scroll Unlock**: Removes artificial scroll-locks, ensuring you can navigate the full page.
- **Native Drag & Drop**: Re-enables dragging of images and links for better productivity.
- **Crystal-Clear Printing**: Bypasses "blank page" print protections. What you see is what you print.
- **Smart Overlay Cleaner**: Automatically detects and removes intrusive modals, paywalls, and full-screen blockers.

### ⚙️ Advanced Tools
- **Silent DevTools Mode**: Prevents websites from detecting that the Developer Tools console is open.
- **Debugger Immunity**: Neutralizes "anti-debug" loops that freeze your browser during inspection.
- **Console Privacy**: Prevents websites from clearing your console history via `console.clear()`.

---

## 🚀 Installation

### Chrome / Edge (Developer Mode)
1. Download this repository as a ZIP and extract it.
2. Navigate to `chrome://extensions/`.
3. Enable **Developer Mode** (top-right toggle).
4. Click **Load unpacked** and select the extension folder.

### Firefox
1. Navigate to `about:debugging`.
2. Click **This Firefox** → **Load Temporary Add-on...**.
3. Select the `manifest.json` file.

---

## 🛠️ Architecture

UnlockAll uses a multi-layered injection strategy to ensure maximum compatibility across all modern web frameworks.

- **`manifest.json`**: Extension configuration (Manifest V3).
- **`inject.js`**: Core Logic – Runs in the page context to handle real-time overrides.
- **`content.js`**: Communication bridge between the UI and the page.
- **`background.js`**: Background service worker for state management.
- **`popup.html/js/css`**: Sleek Dark Mode user interface.

---

## ⚠️ Known Limitations
- **System Pages**: Browser internal pages (e.g., Settings, History) cannot be modified for security reasons.
- **Server-Side Paywalls**: Content that is never sent by the server cannot be recovered.
- **Strict Security Policies (CSP)**: Extremely strict Content-Security-Policy settings on some sites may limit certain features.

---

## 📜 License
This project is released under the **MIT License**. It is intended for personal use and accessibility purposes. Users are responsible for complying with the terms of service of the websites they visit.