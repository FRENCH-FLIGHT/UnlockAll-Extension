# 🔓 UnlockAll – Page Freedom

**UnlockAll** is a professional-grade browser extension that restores user agency on the web. It bypasses artificial restrictions, gives you full visibility into what a page is doing, and lets you take control.

---

## ✨ Features

### 🛡️ Protection layers
- **Right-click restoration** — re-enables native context menus
- **Text selection** — removes `user-select:none` and `selectstart` blocks
- **Copy / Cut / Paste** — restores clipboard shortcuts everywhere
- **Keyboard shortcuts** — prevents pages from hijacking Ctrl+A, F5, etc.
- **Drag & Drop** — re-enables dragging of images, files and links
- **Scroll unlock** — removes `overflow:hidden` scroll locks
- **Print bypass** — allows Ctrl+P on restricted pages
- **Cursor restore** — forces cursor display when hidden by CSS
- **Focus anti-steal** — blocks automatic `focus()` / `blur()` calls
- **Tab visibility spoof** — keeps `document.hidden = false` permanently
- **Pointer events** — neutralises CSS overlays blocking clicks
- **Auto overlay removal** — detects and hides paywalls / modals automatically

### 🔬 Advanced
- **DevTools detection bypass** — multiple vectors covered (timing, resize, debugger injection, Proxy traps, Error.stack fingerprinting)
- **Console protection** — prevents `console.clear()` and toString getter tricks
- **Custom user scripts** — run your own JavaScript at `document_start`, `document_end`, or `document_idle`

### 🍪 Cookie Manager (floating panel)
- List, search, filter all cookies for the current site
- Create, edit, delete individual cookies
- Full form: name, value, domain, path, expiry, Secure, HttpOnly, Session flags
- Export cookies to JSON / Import from JSON file
- Drag the panel anywhere on screen

### 📡 Resource & Script Viewer (floating panel)
- Real-time interception of **XHR**, **Fetch**, **Script**, **CSS**, and **Image** loads
- Filter by type or search by URL
- View the content of any intercepted resource
- Block future requests to a specific URL
- Download or patch (replace) resource content
- Drag the panel anywhere on screen

### 🌍 UI
- 4-language support: 🇫🇷 French · 🇬🇧 English · 🇪🇸 Spanish · 🇩🇪 German
- Dark mode & Light mode
- Save custom default settings / restore factory defaults
- 5-tab popup: Protections · Overlays · Cookies · Scripts · Settings

---

## 🚀 Installation

### Chrome / Edge (Developer Mode)
1. Download and extract this repository as a ZIP.
2. Go to `chrome://extensions/`.
3. Enable **Developer Mode** (top-right toggle).
4. Click **Load unpacked** and select the extension folder.

### Firefox
> Requires Firefox 128+ (Manifest V3 with `world: "MAIN"`)
1. Go to `about:debugging` → **This Firefox**.
2. Click **Load Temporary Add-on** → select `manifest.json`.

---

## 🛠️ Architecture

```
unlockall-extension/
├── manifest.json        MV3 manifest — permissions, content scripts
├── inject.js            MAIN world — all bypass layers + floating panels
├── content.js           Isolated world — secure bridge + cookie proxy
├── background.js        Service worker — token generation + cookie API
├── popup.html           Extension popup UI
├── popup.css            Popup styles (dark + light themes)
├── popup.js             Popup logic — i18n, settings, cookie/script/overlay management
└── icons/               Extension icons (16, 48, 128 px)
```

### Communication flow
```
popup.js
  │  chrome.tabs.sendMessage()
  ▼
content.js  (isolated world)
  │  window.postMessage({ token })   ← authenticated
  ▼
inject.js   (MAIN world)
  │  applies overrides to page context
  ▼
Page
```

---

## ⚠️ Known limitations
- **Browser internal pages** (`chrome://`, `about:`) cannot be modified.
- **Server-side paywalls** (content never sent) cannot be recovered.
- **Strict CSP** sites may limit some features.
- DevTools bypass is marked experimental — advanced timing-based detections may still work on some sites.

---

## 📜 License

MIT License — intended for personal use and accessibility purposes.  
Users are responsible for complying with the terms of service of the websites they visit.

---

## 📋 Changelog

### v2.1.0
- **Cookie Manager** — full floating panel with create/edit/delete/export/import, powered by the `chrome.cookies` API
- **Resource & Script Viewer** — real-time XHR/Fetch/Script/CSS/Image tracker with block, view, download, and patch capabilities
- **Floating panels** — implemented in Shadow DOM (`mode: closed`) so they are invisible to page scripts
- **Security: postMessage token authentication** — a rotating secret token (generated in the service worker, inaccessible to page scripts) is required to authenticate every message sent to `inject.js`; messages with missing or invalid tokens are silently dropped
- **Security: payload whitelist** — incoming settings payloads are validated against a strict whitelist of allowed keys before `Object.assign` is called
- **Optimisation: debounced MutationObserver** — mutations are buffered for 120 ms and processed in a single batch; newly added nodes are handled individually instead of triggering a full `querySelectorAll` on each mutation
- **Stealth: nativeToString()** — all patched prototype methods expose `function name() { [native code] }` to prevent fingerprinting via `Function.prototype.toString`
- **Stealth: Symbol guard** — the internal guard property uses a non-enumerable Symbol, invisible to `Object.keys()` and `for...in`
- **Stealth: Shadow DOM closed panels** — floating UI panels are attached as `mode: "closed"` shadow roots; `document.querySelector` and `document.querySelectorAll` cannot reach their internals
- **Stealth: Error.stack filtering** — extension file paths are stripped from stack traces to prevent detection via error monitoring
- **Stealth: Proxy trap neutralisation** — the `console.id` getter trick (used by some DevTools detectors) is neutralised
- **DevTools bypass: expanded** — now covers Function/eval debugger injection, outerWidth/outerHeight spoofing, alert filtering, performance.now jitter, fast-interval throttling, Error.stack fingerprinting, and Proxy-based console detection
- **Cancel picker** — the overlay picker mode can now be cancelled via the button or Escape key
- **Cookie proxy** — `content.js` acts as a transparent proxy between `inject.js` (MAIN world, no chrome API access) and `background.js` (has `cookies` permission)

### v2.0.0
- Multi-layer bypass engine (L1–L9)
- `world: "MAIN"` injection for prototype-level overrides
- Overlay manager with picker and restore list
- Custom user scripts with 3 execution phases
- 4-language i18n system
- Dark / light theme
- User-defined default settings + factory reset

### v1.0.0
- Initial release: right-click, text selection, clipboard, keyboard shortcuts, drag & drop, scroll, print, cursor, overlay removal
