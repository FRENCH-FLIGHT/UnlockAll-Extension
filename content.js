/**
 * UnlockAll v2.1 – content.js  (ISOLATED world, run_at: document_start)
 *
 * Rôle : pont sécurisé entre chrome.storage/runtime et inject.js (MAIN world).
 *
 * Sécurité postMessage :
 *   Le token est lu depuis chrome.storage.local — inaccessible aux scripts
 *   de la page — et inclus dans chaque message envoyé à inject.js.
 *   Inject.js le valide et rejette tout message sans token valide.
 *
 * Proxy cookies :
 *   inject.js demande les opérations cookies via postMessage ;
 *   on les exécute ici (monde isolé → accès chrome.cookies via background)
 *   et on renvoie la réponse à inject.js.
 */
(function () {
  'use strict';

  const BUS_IN  = '__ua_c2p__';  // content  → inject
  const BUS_OUT = '__ua_p2c__';  // inject   → content

  const DEFAULTS = {
    contextmenu: true, selectstart: true, clipboard: true, keyboard: true,
    dragdrop: true, scroll: false, cursor: true, pointerEvents: false,
    print: true, overlays: false, devtools: false, consoleProtect: false,
    focus: false, visibility: true,
  };

  let token   = null;
  let current = { ...DEFAULTS, customScripts: [] };
  let ready   = false;
  let pending = null;

  // ── Envoi sécurisé vers inject.js ──────────────────────────────
  function toInject(action, payload = {}) {
    if (!token) return;
    window.postMessage({ __ch: BUS_IN, __t: token, action, payload }, window.location.origin || '*');
  }

  // ── Proxy cookie : demandes venant de inject.js ─────────────────
  // inject.js ne peut pas appeler chrome.cookies directement (MAIN world).
  // Il envoie une demande via postMessage, on l'intercepte ici et on
  // contacte le background qui a la permission "cookies".
  function handleCookieRequest(payload) {
    const { op, url, name, domain, details } = payload || {};

    const bgAction = {
      getAll: 'cookies.getAll',
      set   : 'cookies.set',
      remove: 'cookies.remove',
    }[op];

    if (!bgAction) return;

    let bgMsg = { action: bgAction };
    if (op === 'getAll')  bgMsg.details = { url };
    if (op === 'set')     bgMsg.details = details;
    if (op === 'remove')  bgMsg.details = { url, name };

    chrome.runtime.sendMessage(bgMsg, resp => {
      if (chrome.runtime.lastError) return;
      // Réponse pour le panel cookie flottant dans inject.js
      window.postMessage({
        __ch    : BUS_OUT,
        action  : 'cookiesResponse',
        payload : resp?.cookies || (resp?.cookie ? [resp.cookie] : []),
      }, window.location.origin || '*');
    });
  }

  // ── Écoute des messages de inject.js → forward popup/background ─
  function setupMessageListener() {
    window.addEventListener('message', e => {
      if (!e.data || e.data.__ch !== BUS_OUT) return;
      const { action, payload } = e.data;

      // Signal prêt
      if (action === 'ready') {
        ready = true;
        if (pending) { toInject('init', pending); pending = null; }
        return;
      }

      // Demande de proxy cookies depuis inject.js
      if (action === 'cookiesRequest') {
        handleCookieRequest(payload);
        return;
      }

      // Tout le reste (overlayList, resourceList, pickerDone…) → popup
      try { chrome.runtime.sendMessage({ action, payload }); } catch (_) {}
    });
  }

  // ── Chargement des settings depuis storage ──────────────────────
  function loadAndApply() {
    chrome.storage.sync.get({ ...DEFAULTS, customScripts: '[]' }, raw => {
      let scripts = [];
      try { scripts = JSON.parse(raw.customScripts ?? '[]'); } catch (_) {}
      current = { ...DEFAULTS, ...raw, customScripts: scripts };
      if (ready)  toInject('init', current);
      else        pending = current;
    });
  }

  // ── Messages du popup → forward vers inject.js ──────────────────
  chrome.runtime.onMessage.addListener((msg, _sender, reply) => {
    switch (msg.action) {

      case 'updateSettings': {
        const scripts = msg.settings.customScripts ?? current.customScripts;
        current = { ...current, ...msg.settings, customScripts: scripts };
        chrome.storage.sync.set({ ...current, customScripts: JSON.stringify(scripts) });
        toInject('update', current);
        reply({ ok: true });
        break;
      }

      case 'getSettings':
        reply({ settings: current });
        break;

      // Actions directes → inject.js
      case 'removeOverlays':     toInject('removeOverlays');                     reply({ ok: true }); break;
      case 'restoreOverlay':     toInject('restoreOverlay',  { id: msg.id });    reply({ ok: true }); break;
      case 'restoreAllOverlays': toInject('restoreAllOverlays');                 reply({ ok: true }); break;
      case 'activatePicker':     toInject('activatePicker');                     reply({ ok: true }); break;
      case 'cancelPicker':       toInject('cancelPicker');                       reply({ ok: true }); break;
      case 'openCookiePanel':    toInject('openCookiePanel');                    reply({ ok: true }); break;
      case 'openResourcePanel':  toInject('openResourcePanel');                  reply({ ok: true }); break;
      case 'blockResource':      toInject('blockResource',   { url: msg.url });  reply({ ok: true }); break;
      case 'unblockResource':    toInject('unblockResource', { url: msg.url });  reply({ ok: true }); break;
      case 'clearResources':     toInject('clearResources');                     reply({ ok: true }); break;
      case 'getState':           toInject('getState');                           reply({ ok: true }); break;
      case 'ping':               reply({ pong: true }); break;
    }
    return true; // async reply
  });

  // ── Initialisation ──────────────────────────────────────────────
  async function init() {
    const { __ua_token } = await chrome.storage.local.get('__ua_token');
    token = __ua_token || null;

    setupMessageListener();
    loadAndApply();

    // Fallback si le signal 'ready' est manqué (race condition au démarrage)
    setTimeout(() => {
      if (!ready && pending) { ready = true; toInject('init', pending); pending = null; }
    }, 700);
  }

  init();
})();
