/**
 * UnlockAll – background.js (Service Worker)
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

// First install: set defaults
chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === 'install') {
    chrome.storage.sync.set(DEFAULT_SETTINGS);
  }
});

// Update badge based on active features
async function updateBadge(tabId) {
  const settings = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  const activeCount = Object.values(settings).filter(Boolean).length;
  const total = Object.keys(DEFAULT_SETTINGS).length;

  chrome.action.setBadgeText({ text: activeCount === total ? 'ALL' : String(activeCount), tabId });
  chrome.action.setBadgeBackgroundColor({ color: activeCount > 0 ? '#22c55e' : '#64748b', tabId });
}

// Update badge when tab changes
chrome.tabs.onActivated.addListener(({ tabId }) => updateBadge(tabId));
chrome.storage.onChanged.addListener(async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab) updateBadge(tab.id);
});
