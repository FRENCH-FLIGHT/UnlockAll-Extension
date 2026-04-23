/**
 * UnlockAll – popup.js
 * Manages the popup UI, settings, and communication with content script.
 */

const DEFAULT_SETTINGS = {
  contextmenu:    true,
  selectstart:    true,
  clipboard:      true,
  keyboard:       true,
  dragdrop:       true,
  scroll:         false,   // Désactivé par défaut (casse trop de sites)
  cursor:         true,
  pointerEvents:  false,   // Désactivé par défaut (très risqué)
  print:          true,
  overlays:       false,   // Désactivé par défaut
  devtools:       false,
  consoleProtect: false,
  focus:          false,   // Désactivé par défaut
};

// Feature → display group mapping for counter
const GROUPS = {
  mouse:    ['contextmenu', 'selectstart', 'cursor', 'pointerEvents'],
  keyboard: ['clipboard', 'keyboard', 'focus'],
  behavior: ['scroll', 'dragdrop', 'print', 'overlays'],
  advanced: ['devtools', 'consoleProtect'],
};

let currentSettings = { ...DEFAULT_SETTINGS };
let currentTabId = null;

// ─────────────────────────────────────────────
// TOAST
// ─────────────────────────────────────────────
let toastTimer = null;
function showToast(msg, type = 'success', duration = 1800) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = `toast ${type} show`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

// ─────────────────────────────────────────────
// UPDATE UI
// ─────────────────────────────────────────────
function updateUI(settings) {
  // Set toggle states
  document.querySelectorAll('input[data-key]').forEach(input => {
    const key = input.dataset.key;
    if (key in settings) {
      input.checked = settings[key];
    }
  });

  // Update group counters
  Object.entries(GROUPS).forEach(([group, keys]) => {
    const countEl = document.getElementById(`count-${group === 'mouse' ? 'mouse' : group === 'keyboard' ? 'keyboard' : group === 'behavior' ? 'behavior' : 'advanced'}`);
    if (!countEl) return;
    const active = keys.filter(k => settings[k]).length;
    const total  = keys.length;
    countEl.textContent = `${active}/${total}`;
    countEl.classList.toggle('all-active', active === total);
  });

  // Update status badge
  const allActive = Object.values(settings).every(Boolean);
  const anyActive = Object.values(settings).some(Boolean);
  const badge = document.getElementById('statusBadge');
  const statusText = badge.querySelector('.status-text');

  if (anyActive) {
    badge.classList.remove('inactive');
    statusText.textContent = allActive ? 'Tout actif' : 'Actif';
  } else {
    badge.classList.add('inactive');
    statusText.textContent = 'Inactif';
  }

  // Update sync dot
  const syncDot = document.getElementById('syncDot');
  syncDot.classList.remove('syncing');
}

// ─────────────────────────────────────────────
// APPLY SETTING TO CURRENT TAB
// ─────────────────────────────────────────────
async function applySettings(newSettings) {
  currentSettings = { ...currentSettings, ...newSettings };

  // Indicate sync
  const syncDot = document.getElementById('syncDot');
  syncDot.classList.add('syncing');

  // Save to storage
  await chrome.storage.sync.set(currentSettings);

  // Send to active tab
  if (currentTabId) {
    try {
      await chrome.tabs.sendMessage(currentTabId, {
        action: 'updateSettings',
        settings: currentSettings,
      });
    } catch (_) {
      // Tab might not have the content script (e.g. chrome:// pages)
    }
  }

  updateUI(currentSettings);
  setTimeout(() => syncDot.classList.remove('syncing'), 500);
}

// ─────────────────────────────────────────────
// TOGGLE LISTENERS
// ─────────────────────────────────────────────
function initToggles() {
  document.querySelectorAll('input[data-key]').forEach(input => {
    input.addEventListener('change', () => {
      const key = input.dataset.key;
      applySettings({ [key]: input.checked });
    });
  });
}

// ─────────────────────────────────────────────
// QUICK ACTION BUTTONS
// ─────────────────────────────────────────────
function initQuickActions() {
  // Unlock All
  document.getElementById('btnUnlockAll').addEventListener('click', () => {
    const all = {};
    Object.keys(DEFAULT_SETTINGS).forEach(k => { all[k] = true; });
    applySettings(all);
    showToast('✓ Tout activé !', 'success');
  });

  // Lock All
  document.getElementById('btnLockAll').addEventListener('click', () => {
    const none = {};
    Object.keys(DEFAULT_SETTINGS).forEach(k => { none[k] = false; });
    applySettings(none);
    showToast('Tout désactivé', 'info');
  });

  // Remove Overlays now
  document.getElementById('btnOverlays').addEventListener('click', async () => {
    if (currentTabId) {
      try {
        await chrome.tabs.sendMessage(currentTabId, { action: 'removeOverlays' });
        showToast('✓ Overlays supprimés', 'success');
      } catch (_) {
        showToast('Impossible sur cette page', 'error');
      }
    }
  });
}

// ─────────────────────────────────────────────
// UTILITY BUTTONS
// ─────────────────────────────────────────────
function initUtils() {
  // View Source
  document.getElementById('btnViewSource').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.url && !tab.url.startsWith('chrome')) {
      chrome.tabs.create({ url: 'view-source:' + tab.url });
    } else {
      showToast('Non disponible sur cette page', 'error');
    }
  });

  // Copy URL
  document.getElementById('btnCopyUrl').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.url) {
      try {
        await navigator.clipboard.writeText(tab.url);
        showToast('✓ URL copiée', 'success');
      } catch (_) {
        showToast('Erreur de copie', 'error');
      }
    }
  });

  // Open in Incognito
  document.getElementById('btnOpenIncognito').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.url) {
      chrome.windows.create({ url: tab.url, incognito: true }, (w) => {
        if (chrome.runtime.lastError) {
          showToast('Activez le mode incognito dans les paramètres d\'extension', 'error', 3000);
        }
      });
    }
  });
}

// ─────────────────────────────────────────────
// LOAD SETTINGS
// ─────────────────────────────────────────────
async function loadSettings() {
  const stored = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  currentSettings = { ...DEFAULT_SETTINGS, ...stored };
  updateUI(currentSettings);
}

// ─────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  // Get current tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  currentTabId = tab?.id;

  initToggles();
  initQuickActions();
  initUtils();
  await loadSettings();
});

// Listen for storage changes (from other popups/windows)
chrome.storage.onChanged.addListener((changes) => {
  const updated = {};
  Object.entries(changes).forEach(([key, { newValue }]) => {
    updated[key] = newValue;
  });
  currentSettings = { ...currentSettings, ...updated };
  updateUI(currentSettings);
});
