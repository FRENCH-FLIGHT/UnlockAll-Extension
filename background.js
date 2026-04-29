/**
 * UnlockAll v2.1 – background.js (Service Worker)
 *
 * Responsabilités :
 *   1. Génère et rotation du token d'authentification postMessage
 *   2. Proxy chrome.cookies → appelé par content.js
 *   3. Badge de l'icône
 */

const FACTORY_DEFAULTS = {
  contextmenu: true,  selectstart: true,  clipboard: true,  keyboard: true,
  dragdrop: true,     scroll: false,      cursor: true,     pointerEvents: false,
  print: true,        overlays: false,    devtools: false,  consoleProtect: false,
  focus: false,       visibility: true,
};

// ── Token de session ─────────────────────────────────────────────
function generateToken() {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
}

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  await chrome.storage.local.set({ __ua_token: generateToken() });
  if (reason === 'install') {
    await chrome.storage.sync.set({
      ...FACTORY_DEFAULTS,
      customScripts: '[]',
      language: 'fr',
      theme: 'dark',
      userDefaults: null,
    });
  }
});

// Regénère le token à chaque démarrage du navigateur
chrome.runtime.onStartup.addListener(async () => {
  await chrome.storage.local.set({ __ua_token: generateToken() });
});

// ── Messages ─────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((msg, _sender, reply) => {
  switch (msg.action) {

    case 'getFactoryDefaults':
      reply({ defaults: FACTORY_DEFAULTS });
      return true;

    // ─ Cookies ─
    case 'cookies.getAll':
      chrome.cookies.getAll(msg.details || {}, cookies => {
        reply({ ok: true, cookies: cookies || [] });
      });
      return true;

    case 'cookies.getAll.domain':
      chrome.cookies.getAll({ domain: msg.domain }, cookies => {
        reply({ ok: true, cookies: cookies || [] });
      });
      return true;

    case 'cookies.set':
      chrome.cookies.set(msg.details, cookie => {
        if (chrome.runtime.lastError) reply({ ok: false, error: chrome.runtime.lastError.message });
        else reply({ ok: true, cookie });
      });
      return true;

    case 'cookies.remove':
      chrome.cookies.remove(msg.details, () => {
        if (chrome.runtime.lastError) reply({ ok: false, error: chrome.runtime.lastError.message });
        else reply({ ok: true });
      });
      return true;

    default:
      return false;
  }
});

// ── Badge ────────────────────────────────────────────────────────
async function updateBadge(tabId) {
  try {
    const s = await chrome.storage.sync.get(FACTORY_DEFAULTS);
    const active = Object.keys(FACTORY_DEFAULTS).filter(k => s[k]).length;
    await chrome.action.setBadgeText({ text: active > 0 ? String(active) : '', tabId });
    await chrome.action.setBadgeBackgroundColor({ color: active > 0 ? '#22c55e' : '#64748b', tabId });
  } catch (_) {}
}

chrome.tabs.onActivated.addListener(({ tabId }) => updateBadge(tabId));
chrome.storage.onChanged.addListener(async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab) updateBadge(tab.id);
});
