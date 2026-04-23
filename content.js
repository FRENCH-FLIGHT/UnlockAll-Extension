/**
 * UnlockAll – content.js
 * Runs in ISOLATED world. Bridges chrome.storage ↔ inject.js (MAIN world).
 */
(function () {
  'use strict';

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

  let currentSettings = { ...DEFAULT_SETTINGS };
  let injectReady = false;
  let pendingInit = null;

  // ─────────────────────────────────────────────
  // SEND TO inject.js
  // ─────────────────────────────────────────────
  function sendToInject(action, payload) {
    window.postMessage({ __unlockall: 'from_content', action, payload }, '*');
  }

  // ─────────────────────────────────────────────
  // LOAD & PUSH SETTINGS
  // ─────────────────────────────────────────────
  function loadAndApplySettings() {
    chrome.storage.sync.get(DEFAULT_SETTINGS, (stored) => {
      currentSettings = { ...DEFAULT_SETTINGS, ...stored };
      if (injectReady) {
        sendToInject('init', currentSettings);
      } else {
        pendingInit = currentSettings;
      }
    });
  }

  // ─────────────────────────────────────────────
  // LISTEN FOR inject.js READY SIGNAL
  // ─────────────────────────────────────────────
  window.addEventListener('message', (e) => {
    if (!e.data || e.data.__unlockall !== 'from_inject') return;
    const { action, payload } = e.data;

    if (action === 'ready') {
      injectReady = true;
      if (pendingInit) {
        sendToInject('init', pendingInit);
        pendingInit = null;
      }
    }
  });

  // ─────────────────────────────────────────────
  // LISTEN FOR MESSAGES FROM popup.js
  // ─────────────────────────────────────────────
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    switch (message.action) {
      case 'updateSettings': {
        const updated = { ...currentSettings, ...message.settings };
        currentSettings = updated;
        chrome.storage.sync.set(updated);
        sendToInject('update', updated);
        sendResponse({ success: true, settings: updated });
        break;
      }

      case 'getSettings': {
        sendResponse({ settings: currentSettings });
        break;
      }

      case 'removeOverlays': {
        sendToInject('removeOverlays', {});
        sendResponse({ success: true });
        break;
      }

      case 'ping': {
        sendResponse({ pong: true });
        break;
      }
    }
    return true; // async
  });

  // ─────────────────────────────────────────────
  // INIT
  // ─────────────────────────────────────────────
  loadAndApplySettings();

  // Fallback if inject.js ready message was missed
  setTimeout(() => {
    if (!injectReady) {
      injectReady = true;
      sendToInject('init', currentSettings);
    }
  }, 300);

})();
