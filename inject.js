/**
 * UnlockAll v2.1 – inject.js  (world:"MAIN", run_at:"document_start")
 *
 * ─────────────────────────────────────────────────────────────────
 *  COUCHES DE BYPASS (L1–L9)
 *  L1  Event.prototype override  (plus profond possible)
 *  L2  addEventListener wrapping (filet par listener)
 *  L3  on* defineProperty traps  (assignations directes)
 *  L4  Sentinel en phase capture (avant tout listener page)
 *  L5  CSS !important injection
 *  L6  DOM walker + MutationObserver debounced 120 ms
 *  L7  Visibility / hidden API spoofing
 *  L8  DevTools / debugger detection bypass
 *  L9  Custom user scripts
 *
 *  SÉCURITÉ postMessage
 *  ─────────────────────────────────────────────────────────────
 *  Token unique généré par background.js, transmis via content.js
 *  (monde isolé → inaccessible aux scripts de la page).
 *  Chaque message entrant est authentifié par ce token.
 *  Le payload est validé contre une whitelist stricte de clés.
 *
 *  OPTIMISATION MutationObserver
 *  ─────────────────────────────────────────────────────────────
 *  Debounce 120 ms + traitement ciblé nœud par nœud (pas de
 *  querySelectorAll global à chaque mutation).
 *
 *  FURTIVITÉ
 *  ─────────────────────────────────────────────────────────────
 *  - Aucune propriété globale listable (Symbol non-énumérable)
 *  - Toutes les modifications de prototypes masquent leur origine
 *  - Éléments UI en Shadow DOM closed (invisibles à document.querySelector)
 *  - Attributs data-* retirés avant que le MutationObserver page puisse les lire
 *  - toString() des fonctions patchées renvoyent du code natif
 *  - Aucune trace dans window.__proto__ ni window.name
 * ─────────────────────────────────────────────────────────────────
 */
(function () {
  'use strict';

  // ── Guard furtif (Symbol non-énumérable, non-configurable) ───────
  const _GUARD = Symbol('__ua');
  if (window[_GUARD]) return;
  try {
    Object.defineProperty(window, _GUARD, {
      value: true, writable: false, enumerable: false, configurable: false,
    });
  } catch (_) { return; }

  // ════════════════════════════════════════════════════════════════
  // REFS NATIVES — capturées avant tout script de la page
  // ════════════════════════════════════════════════════════════════
  const N = {
    AEL      : EventTarget.prototype.addEventListener,
    REL      : EventTarget.prototype.removeEventListener,
    PD       : Event.prototype.preventDefault,
    SP       : Event.prototype.stopPropagation,
    SIP      : Event.prototype.stopImmediatePropagation,
    CC       : console.clear.bind(console),
    focus    : HTMLElement.prototype.focus,
    blur     : HTMLElement.prototype.blur,
    PM       : window.postMessage.bind(window),
    GCD      : Object.getOwnPropertyDescriptor.bind(Object),
    DP       : Object.defineProperty.bind(Object),
    GCS      : window.getComputedStyle.bind(window),
    sT       : window.setTimeout.bind(window),
    sI       : window.setInterval.bind(window),
    fetch    : window.fetch?.bind(window) ?? null,
    XHRopen  : XMLHttpRequest.prototype.open,
    XHRsend  : XMLHttpRequest.prototype.send,
    create   : document.createElement.bind(document),
    perfNow  : performance.now.bind(performance),
  };

  // Utilitaire : rendre une fonction patchée indiscernable du natif
  function nativeToString(fn, name) {
    try {
      Object.defineProperty(fn, 'name', { value: name, configurable: true });
      fn.toString = function () { return `function ${name}() { [native code] }`; };
      fn.toString.toString = function () { return `function toString() { [native code] }`; };
    } catch (_) {}
    return fn;
  }

  // ── Authentification token ────────────────────────────────────────
  let _authToken = null;
  let _tokenSet  = false;

  // Whitelist stricte des clés d'état acceptées dans les payloads
  const ALLOWED_STATE_KEYS = new Set([
    'contextmenu','selectstart','clipboard','keyboard','dragdrop',
    'scroll','cursor','pointerEvents','print','overlays','devtools',
    'consoleProtect','focus','visibility','customScripts',
  ]);

  function validatePayload(p) {
    if (!p || typeof p !== 'object' || Array.isArray(p)) return false;
    for (const k of Object.keys(p)) if (!ALLOWED_STATE_KEYS.has(k)) return false;
    return true;
  }

  // ── État ─────────────────────────────────────────────────────────
  const S = {
    contextmenu: true,  selectstart: true,  clipboard: true,  keyboard: true,
    dragdrop: true,     scroll: false,      cursor: true,     pointerEvents: false,
    print: true,        overlays: false,    devtools: false,  consoleProtect: false,
    focus: false,       visibility: true,   customScripts: [],
  };

  const EV = {
    contextmenu:'contextmenu', selectstart:'selectstart', mousedown:'selectstart',
    copy:'clipboard', cut:'clipboard', paste:'clipboard',
    keydown:'keyboard', keyup:'keyboard', keypress:'keyboard',
    dragstart:'dragdrop', drag:'dragdrop', dragend:'dragdrop',
    dragover:'dragdrop', drop:'dragdrop',
    wheel:'scroll', touchmove:'scroll',
    beforeprint:'print', visibilitychange:'visibility',
  };

  const ON = {
    oncontextmenu:'contextmenu', onselectstart:'selectstart',
    oncopy:'clipboard', oncut:'clipboard', onpaste:'clipboard',
    onkeydown:'keyboard', onkeyup:'keyboard', onkeypress:'keyboard',
    ondragstart:'dragdrop', ondrag:'dragdrop', ondragover:'dragdrop', ondrop:'dragdrop',
    onbeforeprint:'print', onblur:'focus',
  };

  function blocked(ev) { const k = EV[ev.type]; return !!(k && S[k]); }

  // ════════════════════════════════════════════════════════════════
  // L1 — Event.prototype override
  // ════════════════════════════════════════════════════════════════
  Event.prototype.preventDefault = nativeToString(function preventDefault() {
    if (blocked(this)) return;
    return N.PD.call(this);
  }, 'preventDefault');

  Event.prototype.stopPropagation = nativeToString(function stopPropagation() {
    if (blocked(this)) return;
    return N.SP.call(this);
  }, 'stopPropagation');

  Event.prototype.stopImmediatePropagation = nativeToString(function stopImmediatePropagation() {
    if (blocked(this)) return;
    return N.SIP.call(this);
  }, 'stopImmediatePropagation');

  // returnValue = false (legacy "return false")
  try {
    const rvd = N.GCD(Event.prototype, 'returnValue');
    if (rvd?.set) N.DP(Event.prototype, 'returnValue', {
      get: rvd.get, configurable: true,
      set(v) { if (v === false && blocked(this)) return; rvd.set.call(this, v); },
    });
  } catch (_) {}

  // ════════════════════════════════════════════════════════════════
  // L2 — addEventListener wrapping
  // ════════════════════════════════════════════════════════════════
  const _wmap = new WeakMap();

  EventTarget.prototype.addEventListener = nativeToString(function addEventListener(type, fn, opts) {
    const h = typeof fn === 'function' ? fn
            : (fn?.handleEvent) ? fn.handleEvent.bind(fn) : null;
    if (h && EV[type]) {
      let w = _wmap.get(fn);
      if (!w) {
        w = function (e) {
          const k = EV[e.type];
          if (k && S[k]) {
            const p  = e.preventDefault;
            const s  = e.stopPropagation;
            const si = e.stopImmediatePropagation;
            e.preventDefault = e.stopPropagation = e.stopImmediatePropagation = function () {};
            try { h.call(this, e); } catch (_) {}
            e.preventDefault = p; e.stopPropagation = s; e.stopImmediatePropagation = si;
          } else h.call(this, e);
        };
        _wmap.set(fn, w);
      }
      return N.AEL.call(this, type, w, opts);
    }
    return N.AEL.call(this, type, fn, opts);
  }, 'addEventListener');

  EventTarget.prototype.removeEventListener = nativeToString(function removeEventListener(type, fn, opts) {
    return N.REL.call(this, type, _wmap.get(fn) ?? fn, opts);
  }, 'removeEventListener');

  // ════════════════════════════════════════════════════════════════
  // L3 — on* property traps
  // ════════════════════════════════════════════════════════════════
  const PROTOS = [Document.prototype, HTMLElement.prototype, SVGElement.prototype, Window.prototype];

  function patchOnProp(proto, prop, key) {
    const d = N.GCD(proto, prop);
    if (!d?.configurable) return;
    const store = new WeakMap();
    N.DP(proto, prop, {
      enumerable: d.enumerable ?? true, configurable: true,
      get() { return S[key] ? null : (store.get(this) ?? null); },
      set(fn) { store.set(this, fn); if (d.set) d.set.call(this, S[key] ? null : fn); },
    });
  }

  Object.entries(ON).forEach(([p, k]) =>
    PROTOS.forEach(pr => { try { patchOnProp(pr, p, k); } catch (_) {} })
  );

  // ════════════════════════════════════════════════════════════════
  // L4 — Capture-phase sentinels
  // ════════════════════════════════════════════════════════════════
  Object.keys(EV).forEach(type => {
    N.AEL.call(document, type, e => {
      if (!blocked(e)) return;
      try { N.DP(e, 'defaultPrevented', { get: () => false, configurable: true }); } catch (_) {}
    }, { capture: true, passive: false });
  });

  // ════════════════════════════════════════════════════════════════
  // L5 — CSS injection
  // ════════════════════════════════════════════════════════════════
  let _css = null;

  function buildCSS() {
    const r = [];
    if (S.selectstart) r.push(
      `*,*::before,*::after{user-select:text!important;-webkit-user-select:text!important;-moz-user-select:text!important}`,
      `[class*="no-select"],[class*="noselect"],[class*="disable-select"],[unselectable="on"]{user-select:text!important;-webkit-user-select:text!important}`,
      `::selection{background:rgba(59,130,246,.3)!important;color:inherit!important}`
    );
    if (S.cursor) r.push(
      `*{cursor:auto!important}`,
      `a,button,[role="button"],[onclick],[tabindex="0"]{cursor:pointer!important}`
    );
    if (S.scroll) r.push(
      `html,body{overflow:auto!important;height:auto!important;touch-action:auto!important;max-height:none!important}`,
      `[class*="modal-open"],[class*="no-scroll"],[class*="noscroll"],[class*="scroll-lock"]{overflow:auto!important}`
    );
    if (S.dragdrop) r.push(
      `*{-webkit-user-drag:auto!important}`,
      `img,a{-webkit-user-drag:auto!important}`,
      `[draggable="false"]{cursor:grab!important}`
    );
    if (S.print) r.push(
      `@media print{html,body,*{display:revert!important;visibility:visible!important;overflow:visible!important;height:auto!important}}`
    );
    if (S.pointerEvents) r.push(
      `[class*="overlay"]:not(video):not(iframe):not(canvas),[class*="paywall"],[id*="overlay"],[id*="paywall"],` +
      `[class*="cookie-"],[id*="cookie-"],[class*="gdpr"],[id*="gdpr"]{pointer-events:none!important;opacity:0!important}`
    );
    return r.join('\n');
  }

  function applyCSS() {
    if (!_css) {
      _css = N.create('style');
      // Attribut discret — ne pas utiliser 'id' lisible par la page
      _css.setAttribute('data-x', '1');
    }
    _css.textContent = buildCSS();
    const root = document.head || document.documentElement;
    if (root && !_css.isConnected) root.appendChild(_css);
  }

  // ════════════════════════════════════════════════════════════════
  // L6 — DOM walker + MutationObserver DEBOUNCED
  //
  //  Optimisation CPU (SPA / scroll infini) :
  //  • Les mutations sont bufferisées pendant 120 ms
  //  • Seuls les nœuds ajoutés sont traités individuellement
  //  • querySelectorAll global uniquement si attribut on* modifié
  //    sur un nœud existant (cas rare)
  // ════════════════════════════════════════════════════════════════
  let _debTimer   = null;
  let _dirtyNodes = new Set();
  let _globalDirt = false;
  let _needOvl    = false;

  function _flush() {
    if (_globalDirt)  clearInlineHandlers();
    if (S.dragdrop && _globalDirt) fixDraggable();
    _dirtyNodes.forEach(n => {
      if (n.isConnected) {
        clearInlineHandlers(n);
        if (S.dragdrop) fixDraggable(n);
      }
    });
    if (_needOvl && S.overlays) autoRemoveOverlays();
    _dirtyNodes.clear(); _globalDirt = false; _needOvl = false;
  }

  function scheduleFlush() {
    clearTimeout(_debTimer);
    _debTimer = N.sT(_flush, 120);
  }

  function fixDraggable(root) {
    if (!S.dragdrop) return;
    try {
      const walk = el => {
        if (!el || el.nodeType !== 1) return;
        const tag = el.tagName;
        if (tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') {
          if (el.getAttribute('draggable') === 'false') el.setAttribute('draggable', 'true');
          if (el.getAttribute('ondragstart')) {
            el.removeAttribute('ondragstart');
            try { el.ondragstart = null; } catch (_) {}
          }
        }
        for (const c of el.children) walk(c);
      };
      walk(root || document.documentElement);
    } catch (_) {}
  }

  function clearInlineHandlers(root) {
    const nodes = root
      ? [root]
      : [document, document.documentElement, document.body, window];
    nodes.filter(Boolean).forEach(node => {
      Object.entries(ON).forEach(([prop, key]) => {
        if (!S[key]) return;
        try {
          if (node[prop] != null) node[prop] = null;
          if (node.removeAttribute) node.removeAttribute(prop);
        } catch (_) {}
      });
    });
    const scope = root || document;
    if (scope?.querySelectorAll) {
      try {
        const sel = Object.keys(ON).map(p => `[${p}]`).join(',');
        scope.querySelectorAll(sel).forEach(el => {
          Object.entries(ON).forEach(([prop, key]) => {
            if (S[key] && el.hasAttribute(prop)) {
              el.removeAttribute(prop);
              try { el[prop] = null; } catch (_) {}
            }
          });
        });
      } catch (_) {}
    }
  }

  let _obs = null;
  function startObserver() {
    if (_obs) return;
    _obs = new MutationObserver(muts => {
      for (const m of muts) {
        if (m.type === 'attributes') {
          const a = m.attributeName || '';
          if (a.startsWith('on') || a === 'draggable') _globalDirt = true;
        }
        if (m.type === 'childList') {
          m.addedNodes.forEach(n => {
            if (n.nodeType !== 1) return;
            _dirtyNodes.add(n);
            _needOvl = true;
            if (n.tagName === 'SCRIPT') _trackScriptElement(n);
          });
        }
      }
      scheduleFlush();
    });
    const root = document.documentElement || document.body;
    if (root) _obs.observe(root, { childList: true, subtree: true, attributes: true });
  }

  // ════════════════════════════════════════════════════════════════
  // L7 — Visibility spoofing
  // ════════════════════════════════════════════════════════════════
  function patchVisibility() {
    if (!S.visibility) return;
    ['hidden','webkitHidden'].forEach(p => {
      try { N.DP(document, p, { get: () => false, configurable: true, enumerable: true }); } catch (_) {}
    });
    ['visibilityState','webkitVisibilityState'].forEach(p => {
      try { N.DP(document, p, { get: () => 'visible', configurable: true, enumerable: true }); } catch (_) {}
    });
  }

  // ════════════════════════════════════════════════════════════════
  // L8 — DevTools / debugger bypass
  // ════════════════════════════════════════════════════════════════
  let _devDone = false;
  function patchDevtools() {
    if (!S.devtools || _devDone) return;
    _devDone = true;

    // V1 — Neutralise debugger dans Function() et eval()
    try {
      const _Fn = window.Function;
      const sanitize = s => typeof s === 'string' ? s.replace(/\bdebugger\b/g, '(void 0)') : s;
      const FakeFn = nativeToString(function Function(...args) {
        return _Fn.apply(this, args.map(sanitize));
      }, 'Function');
      FakeFn.prototype = _Fn.prototype;
      window.Function = FakeFn;

      const _ev = window.eval;
      window.eval = nativeToString(function eval(code) {
        return _ev.call(this, sanitize(code));
      }, 'eval');
    } catch (_) {}

    // V2 — outerWidth/Height (taille panneau DevTools)
    try {
      N.DP(window, 'outerWidth',  { get: () => window.innerWidth,      configurable: true });
      N.DP(window, 'outerHeight', { get: () => window.innerHeight + 1,  configurable: true });
    } catch (_) {}

    // V3 — Bloquer les alertes de détection
    try {
      const _al = window.alert;
      window.alert = nativeToString(function alert(msg) {
        if (typeof msg === 'string' && /devtools|inspect|console/i.test(msg)) return;
        return _al.call(this, msg);
      }, 'alert');
    } catch (_) {}

    // V4 — performance.now jitter (anti-timing)
    try {
      const _pn = N.perfNow;
      performance.now = nativeToString(function now() {
        return _pn() - ((_pn() * 0.001) % 0.05);
      }, 'now');
    } catch (_) {}

    // V5 — setInterval / setTimeout : throttle sub-50ms + bloquer debugger string
    try {
      window.setInterval = nativeToString(function setInterval(fn, ms, ...a) {
        if (typeof fn === 'string' && /debugger|devtools/i.test(fn)) return 0;
        return N.sI(fn, Math.max(Number(ms) || 0, 50), ...a);
      }, 'setInterval');
      window.setTimeout = nativeToString(function setTimeout(fn, ms, ...a) {
        if (typeof fn === 'string' && /debugger|devtools/i.test(fn)) return 0;
        return N.sT(fn, ms, ...a);
      }, 'setTimeout');
    } catch (_) {}

    // V6 — Error.stack : masquer les chemins d'extension
    try {
      const _ES = Error.prepareStackTrace;
      Error.prepareStackTrace = function (err, stack) {
        if (_ES) {
          const frames = stack.filter(f => {
            const src = f.getFileName?.() || '';
            return !src.includes('chrome-extension://');
          });
          return _ES(err, frames);
        }
        return stack
          .filter(f => !(f.getFileName?.() || '').includes('chrome-extension://'))
          .map(f => `    at ${f.toString()}`)
          .join('\n');
      };
    } catch (_) {}

    // V7 — Proxy trap : neutralise la détection via console.id getter
    try {
      const _P = window.Proxy;
      window.Proxy = new _P(_P, {
        construct(target, args) {
          const [obj, handler] = args;
          if (handler && typeof handler.get === 'function') {
            const orig = handler.get.bind(handler);
            handler.get = function (o, prop, recv) {
              if (prop === 'id' && o === console) return 1;
              return orig(o, prop, recv);
            };
          }
          return new target(obj, handler);
        },
      });
    } catch (_) {}
  }

  // ════════════════════════════════════════════════════════════════
  // Console protection (renforcée)
  // ════════════════════════════════════════════════════════════════
  function patchConsole() {
    if (S.consoleProtect) {
      console.clear = nativeToString(function clear() {}, 'clear');
      try {
        const _log = console.log.bind(console);
        console.log = nativeToString(function log(...args) {
          return _log(...args.map(a => {
            if (a && typeof a === 'object') {
              try { if (/devtools/i.test(String(a))) return '[object Object]'; } catch (_) {}
            }
            return a;
          }));
        }, 'log');
      } catch (_) {}
    } else {
      console.clear = N.CC;
    }
  }

  // ════════════════════════════════════════════════════════════════
  // OVERLAY MANAGER
  // ════════════════════════════════════════════════════════════════
  const _overlays = new Map();
  let _ovCnt = 0;

  function _elDesc(el) {
    const id  = el.id ? `#${el.id}` : '';
    const cls = el.className && typeof el.className === 'string'
      ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '';
    const txt = (el.innerText || '').trim().slice(0, 24).replace(/\s+/g, ' ');
    return `<${el.tagName.toLowerCase()}${id || cls}>${txt ? ` "${txt}"` : ''}`;
  }

  function hideOverlay(el, auto = false) {
    if (!el || el.dataset?.uaOvId) return;
    const id = `ov_${++_ovCnt}`;
    _overlays.set(id, {
      el, origDisplay: el.style.display, origVis: el.style.visibility,
      origOp: el.style.opacity, desc: _elDesc(el), auto, ts: Date.now(),
    });
    try { el.dataset.uaOvId = id; } catch (_) {}
    el.style.setProperty('display', 'none', 'important');
    _sendOverlayList();
  }

  function restoreOverlay(id) {
    const e = _overlays.get(id);
    if (!e) return;
    e.el.style.display     = e.origDisplay;
    e.el.style.visibility  = e.origVis;
    e.el.style.opacity     = e.origOp;
    try { delete e.el.dataset.uaOvId; } catch (_) {}
    _overlays.delete(id);
    _sendOverlayList();
  }

  function _sendOverlayList() {
    const list = [..._overlays.entries()].map(([id, { desc, auto, ts }]) => ({ id, desc, auto, ts }));
    N.PM({ __ch: BUS_OUT, action: 'overlayList', payload: list }, '*');
  }

  function autoRemoveOverlays() {
    if (!S.overlays) return;
    try {
      document.querySelectorAll('div,section,aside,article,header').forEach(el => {
        if (el.dataset?.uaOvId) return;
        const cs = N.GCS(el);
        const zi = parseInt(cs.zIndex) || 0;
        if ((cs.position === 'fixed' || cs.position === 'absolute') && zi > 100) {
          const r = el.getBoundingClientRect();
          if (r.width  > window.innerWidth  * 0.75 &&
              r.height > window.innerHeight * 0.45 &&
              !el.querySelector('nav,video,iframe,canvas')) {
            hideOverlay(el, true);
          }
        }
      });
      ['overflow','overflow-y','height','max-height'].forEach(p => {
        document.body?.style.setProperty(p, 'auto', 'important');
        document.documentElement?.style.setProperty(p, 'auto', 'important');
      });
      ['modal-open','overflow-hidden','no-scroll','noscroll','scroll-lock','locked']
        .forEach(c => document.body?.classList.remove(c));
    } catch (_) {}
  }

  // ════════════════════════════════════════════════════════════════
  // PICKER (sélection manuelle d'overlay)
  // ════════════════════════════════════════════════════════════════
  let _picker = false, _pickerTarget = null, _pickerHL = null, _pickerHint = null;

  function activatePicker() {
    if (_picker) return;
    _picker = true;

    _pickerHL = N.create('div');
    Object.assign(_pickerHL.style, {
      position:'fixed', pointerEvents:'none', zIndex:'2147483646',
      border:'2px solid #22c55e', background:'rgba(34,197,94,.09)',
      borderRadius:'4px', display:'none', boxShadow:'0 0 0 3px rgba(34,197,94,.12)',
    });

    _pickerHint = N.create('div');
    Object.assign(_pickerHint.style, {
      position:'fixed', bottom:'16px', left:'50%', transform:'translateX(-50%)',
      zIndex:'2147483647', background:'#0d0d14', color:'#f1f5f9',
      fontFamily:'system-ui,sans-serif', fontSize:'13px', fontWeight:'500',
      padding:'8px 18px', borderRadius:'20px', border:'1px solid #22c55e88',
      pointerEvents:'none', whiteSpace:'nowrap', boxShadow:'0 4px 24px rgba(0,0,0,.6)',
    });
    _pickerHint.textContent = '🎯 Cliquez sur un élément pour le masquer — Échap pour annuler';

    document.body?.appendChild(_pickerHL);
    document.body?.appendChild(_pickerHint);
    document.body.style.cursor = 'crosshair';

    N.AEL.call(document, 'mousemove', _mvPicker, { capture: true, passive: true });
    N.AEL.call(document, 'click',     _clPicker, { capture: true });
    N.AEL.call(document, 'keydown',   _kyPicker, { capture: true });
  }

  function deactivatePicker(done = false) {
    _picker = false; _pickerTarget = null;
    if (document.body) document.body.style.cursor = '';
    _pickerHL?.remove();   _pickerHL   = null;
    _pickerHint?.remove(); _pickerHint = null;
    N.REL.call(document, 'mousemove', _mvPicker, true);
    N.REL.call(document, 'click',     _clPicker, true);
    N.REL.call(document, 'keydown',   _kyPicker, true);
    N.PM({ __ch: BUS_OUT, action: done ? 'pickerDone' : 'pickerCancelled' }, '*');
  }

  function _mvPicker(e) {
    if (!_picker || !_pickerHL) return;
    _pickerHL.style.display = 'none';
    const el = document.elementFromPoint(e.clientX, e.clientY);
    _pickerHL.style.display = 'block';
    if (!el || el === _pickerHL || el === _pickerHint) return;
    _pickerTarget = el;
    const r = el.getBoundingClientRect();
    Object.assign(_pickerHL.style, {
      left: r.left + 'px', top: r.top + 'px',
      width: r.width + 'px', height: r.height + 'px',
    });
  }
  function _clPicker(e) {
    N.PD.call(e); N.SP.call(e); N.SIP.call(e);
    if (_pickerTarget) hideOverlay(_pickerTarget, false);
    deactivatePicker(true);
  }
  function _kyPicker(e) { if (e.key === 'Escape') deactivatePicker(false); }

  // ════════════════════════════════════════════════════════════════
  // RESOURCE TRACKER — XHR / Fetch / Script / CSS / Image
  // ════════════════════════════════════════════════════════════════
  const _resources = new Map();
  const _blocked   = new Set();
  let _resCnt = 0;

  function _addResource(type, url, extra = {}) {
    if (!url) return null;
    const key = `${type}:${url}`;
    if (_resources.has(key)) {
      const r = _resources.get(key);
      r.count = (r.count || 1) + 1;
      r.lastSeen = Date.now();
      _sendResourceList();
      return r;
    }
    const entry = {
      id: `r_${++_resCnt}`, type, url, status: 'loaded',
      ts: Date.now(), count: 1, blocked: _blocked.has(url), content: null, ...extra,
    };
    _resources.set(key, entry);
    _sendResourceList();
    return entry;
  }

  function _sendResourceList() {
    const list = [..._resources.values()].map(r => ({
      id: r.id, type: r.type, url: r.url, status: r.status,
      ts: r.ts, count: r.count, blocked: r.blocked,
      size: r.content ? r.content.length : null,
      method: r.method || null,
    }));
    N.PM({ __ch: BUS_OUT, action: 'resourceList', payload: list }, '*');
  }

  // XHR
  XMLHttpRequest.prototype.open = nativeToString(function open(method, url, ...rest) {
    this.__ua_url    = String(url);
    this.__ua_method = method;
    this.__ua_blk    = _blocked.has(this.__ua_url);
    return N.XHRopen.call(this, method, this.__ua_blk ? 'about:blank' : url, ...rest);
  }, 'open');

  XMLHttpRequest.prototype.send = nativeToString(function send(body) {
    if (this.__ua_blk) { this.abort(); return; }
    const url = this.__ua_url;
    if (url) {
      const entry = _addResource('xhr', url, { method: this.__ua_method, status: 'pending' });
      N.AEL.call(this, 'loadend', () => {
        if (!entry) return;
        entry.status     = this.status >= 200 && this.status < 400 ? 'loaded' : 'error';
        entry.httpStatus = this.status;
        if (this.responseText && this.responseText.length < 2_000_000) entry.content = this.responseText;
        _sendResourceList();
      }, { once: true });
    }
    return N.XHRsend.call(this, body);
  }, 'send');

  // Fetch
  if (N.fetch) {
    window.fetch = nativeToString(function fetch(input, init) {
      const url = typeof input === 'string' ? input : (input?.url || String(input));
      if (_blocked.has(url)) return Promise.resolve(new Response('', { status: 204 }));
      const entry = _addResource('fetch', url, { method: init?.method || 'GET', status: 'pending' });
      return N.fetch(input, init)
        .then(resp => {
          if (entry) { entry.status = resp.ok ? 'loaded' : 'error'; entry.httpStatus = resp.status; }
          resp.clone().text()
            .then(txt => { if (entry && txt.length < 2_000_000) { entry.content = txt; _sendResourceList(); } })
            .catch(() => {});
          return resp;
        })
        .catch(err => { if (entry) { entry.status = 'error'; _sendResourceList(); } throw err; });
    }, 'fetch');
  }

  function _trackScriptElement(el) {
    if (!el || el.tagName !== 'SCRIPT') return;
    if (el.src) {
      const entry = _addResource('script', el.src, { status: 'loading' });
      N.AEL.call(el, 'load',  () => { if (entry) { entry.status = 'loaded'; _sendResourceList(); } }, { once: true });
      N.AEL.call(el, 'error', () => { if (entry) { entry.status = 'error';  _sendResourceList(); } }, { once: true });
    } else if (el.textContent?.trim()) {
      _addResource('script-inline', `inline_${_resCnt + 1}`, {
        content: el.textContent.slice(0, 500_000), status: 'loaded',
      });
    }
  }

  function _scanExistingResources() {
    document.querySelectorAll('script').forEach(_trackScriptElement);
    document.querySelectorAll('link[rel="stylesheet"]').forEach(el => {
      if (el.href) _addResource('style', el.href, { status: 'loaded' });
    });
    document.querySelectorAll('img').forEach(el => {
      if (el.src && !el.src.startsWith('data:')) _addResource('image', el.src, { status: 'loaded' });
    });
  }

  function blockResource(url)   { _blocked.add(url);    const k = [..._resources.keys()].find(k => k.endsWith(':' + url)); if (k) { const r = _resources.get(k); if (r) r.blocked = true; } _sendResourceList(); }
  function unblockResource(url) { _blocked.delete(url); const k = [..._resources.keys()].find(k => k.endsWith(':' + url)); if (k) { const r = _resources.get(k); if (r) r.blocked = false; } _sendResourceList(); }

  // ════════════════════════════════════════════════════════════════
  // PANNEAUX FLOTTANTS (Shadow DOM closed)
  // Shadow DOM en mode "closed" : document.querySelector ne peut pas
  // atteindre l'intérieur → invisible aux scripts de détection.
  // ════════════════════════════════════════════════════════════════
  const _panels = {};

  function _panelCSS() {
    return `
      :host{all:initial}
      *{box-sizing:border-box;font-family:system-ui,-apple-system,sans-serif}
      .panel{width:100%;height:100%;background:#0f1117;border:1px solid #2e2e48;border-radius:10px;
        display:flex;flex-direction:column;box-shadow:0 8px 40px rgba(0,0,0,.7);
        overflow:hidden;resize:both;min-width:320px;min-height:180px;max-width:96vw;max-height:92vh}
      .titlebar{display:flex;align-items:center;gap:8px;padding:9px 12px;background:#161622;
        border-bottom:1px solid #252538;cursor:move;user-select:none;flex-shrink:0}
      .title{flex:1;font-size:13px;font-weight:600;color:#f1f5f9;letter-spacing:-.2px}
      .close-btn{width:22px;height:22px;border-radius:5px;border:1px solid #2e2e48;
        background:#1d1d2e;color:#64748b;cursor:pointer;display:flex;align-items:center;
        justify-content:center;transition:all .13s;flex-shrink:0}
      .close-btn:hover{background:rgba(239,68,68,.15);border-color:#ef4444;color:#f87171}
      .body{flex:1;overflow:hidden;display:flex;flex-direction:column;min-height:0}
      ::-webkit-scrollbar{width:4px;height:4px}
      ::-webkit-scrollbar-thumb{background:#2e2e48;border-radius:2px}
      .mono{font-family:'JetBrains Mono','Fira Code',monospace}
      .btn{display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:20px;
        font-size:11px;font-weight:500;cursor:pointer;border:1px solid transparent;transition:all .13s;white-space:nowrap}
      .btn-g{background:rgba(34,197,94,.12);border-color:rgba(34,197,94,.3);color:#22c55e}
      .btn-g:hover{background:rgba(34,197,94,.2)}
      .btn-ghost{background:#1d1d2e;border-color:#2e2e48;color:#94a3b8}
      .btn-ghost:hover{color:#f1f5f9;border-color:#3e3e58}
      .btn-red{background:rgba(239,68,68,.08);border-color:rgba(239,68,68,.22);color:#f87171}
      .btn-red:hover{background:rgba(239,68,68,.16)}
      .btn-am{background:rgba(245,158,11,.1);border-color:rgba(245,158,11,.28);color:#f59e0b}
      .input{background:#0d0d14;border:1px solid #2e2e48;border-radius:5px;color:#f1f5f9;
        font-size:12px;padding:5px 8px;outline:none;transition:border-color .13s;width:100%}
      .input:focus{border-color:#22c55e}
      .empty{flex:1;display:flex;align-items:center;justify-content:center;color:#64748b;font-size:12px;padding:20px}
    `;
  }

  function createPanel(id, iconText, titleText, w, h, buildFn) {
    if (_panels[id]) {
      const host = _panels[id].host;
      host.style.display = host.style.display === 'none' ? '' : host.style.display;
      return _panels[id];
    }

    const host = N.create('div');
    // Identifiant discret (non lisible par la page — on utilise un attribut data-)
    Object.assign(host.style, {
      position:'fixed', top:'60px', right:'20px',
      width: w + 'px', height: h + 'px',
      zIndex:'2147483640',
    });

    // Shadow DOM CLOSED → invisible pour document.querySelector
    const shadow = host.attachShadow({ mode: 'closed' });

    const styleEl = N.create('style');
    styleEl.textContent = _panelCSS();

    const panel = N.create('div');
    panel.className = 'panel';

    const bar = N.create('div');
    bar.className = 'titlebar';
    bar.innerHTML = `
      <span style="font-size:16px">${iconText}</span>
      <span class="title">${titleText}</span>
      <button class="close-btn" id="__cb">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
          <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
          <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
      </button>`;

    const body = N.create('div');
    body.className = 'body';

    panel.appendChild(bar); panel.appendChild(body);
    shadow.appendChild(styleEl); shadow.appendChild(panel);
    document.documentElement.appendChild(host);

    // Drag
    let _dx = 0, _dy = 0, _drag = false;
    N.AEL.call(bar, 'mousedown', e => {
      if (e.target.id === '__cb') return;
      _drag = true;
      const rect = host.getBoundingClientRect();
      _dx = e.clientX - rect.left; _dy = e.clientY - rect.top;
      e.preventDefault();
    });
    N.AEL.call(document, 'mousemove', e => {
      if (!_drag) return;
      host.style.left  = (e.clientX - _dx) + 'px';
      host.style.top   = (e.clientY - _dy) + 'px';
      host.style.right = 'auto';
    });
    N.AEL.call(document, 'mouseup', () => { _drag = false; });
    bar.querySelector('#__cb').addEventListener('click', () => { host.style.display = 'none'; });

    const entry = { host, shadow, body, style: styleEl };
    _panels[id] = entry;
    buildFn(body, shadow, styleEl, entry);
    return entry;
  }

  // ════════════════════════════════════════════════════════════════
  // COOKIE PANEL (Shadow DOM)
  // ════════════════════════════════════════════════════════════════
  function openCookiePanel() {
    createPanel('cookies', '🍪', 'Gestionnaire de cookies', 520, 480, (body, shadow, styleEl) => {
      styleEl.textContent += `
        .toolbar{display:flex;gap:5px;padding:8px 10px;background:#161622;border-bottom:1px solid #252538;flex-shrink:0;flex-wrap:wrap}
        .search{flex:1;min-width:100px;background:#0d0d14;border:1px solid #2e2e48;border-radius:6px;color:#f1f5f9;font-size:12px;padding:4px 8px;outline:none}
        .search:focus{border-color:#22c55e}
        .list{flex:1;overflow-y:auto;padding:5px 8px;display:flex;flex-direction:column;gap:3px;min-height:0}
        .crow{display:flex;align-items:center;gap:7px;padding:6px 9px;background:#161622;border:1px solid #252538;border-radius:6px;cursor:pointer;transition:background .1s}
        .crow:hover{background:#1d1d2e}
        .cname{font-size:11px;font-weight:500;color:#f1f5f9;font-family:monospace;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .cval{font-size:9.5px;color:#64748b;margin-top:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:160px}
        .flags{display:flex;gap:2px;flex-shrink:0}
        .flag{font-size:8px;font-weight:700;border-radius:3px;padding:1px 4px}
        .fs{background:rgba(34,197,94,.1);border:1px solid rgba(34,197,94,.25);color:#22c55e}
        .fh{background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.22);color:#f59e0b}
        .fss{background:rgba(167,139,250,.1);border:1px solid rgba(167,139,250,.22);color:#a78bfa}
        .del{width:22px;height:22px;border-radius:4px;border:1px solid #2e2e48;background:#1d1d2e;color:#64748b;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .12s}
        .del:hover{background:rgba(239,68,68,.1);border-color:#ef4444;color:#f87171}
        .editor{padding:9px;background:#161622;border-top:1px solid #252538;flex-shrink:0;display:flex;flex-direction:column;gap:5px}
        .editor.hidden{display:none}
        .etitle{font-size:12px;font-weight:600;color:#f1f5f9}
        .fg2{display:grid;grid-template-columns:1fr 1fr;gap:5px}
        .fr{display:flex;flex-direction:column;gap:2px}
        .fl{font-size:9px;color:#64748b;font-weight:500;text-transform:uppercase;letter-spacing:.5px}
        .ta{resize:vertical;min-height:44px;font-family:monospace;font-size:11px}
        .fcbs{display:flex;gap:8px;flex-wrap:wrap}
        .fcb{display:flex;align-items:center;gap:4px;font-size:11px;color:#94a3b8;cursor:pointer}
        .ea{display:flex;justify-content:flex-end;gap:5px}
        .foot{display:flex;align-items:center;justify-content:space-between;padding:5px 9px;background:#161622;border-top:1px solid #252538;flex-shrink:0}
        .finfo{font-size:10px;color:#64748b}
      `;

      let cookies = [], editingName = null, filter = '';

      body.innerHTML = `
        <div class="toolbar">
          <input class="search" id="cs" placeholder="Filtrer…"/>
          <button class="btn btn-g" id="ca">＋ Ajouter</button>
          <button class="btn btn-ghost" id="cr">↺</button>
          <button class="btn btn-ghost" id="cexp">⬇ Exporter</button>
          <button class="btn btn-am" id="cimp">⬆ Importer</button>
        </div>
        <div class="list" id="cl"></div>
        <div class="editor hidden" id="ce">
          <div style="display:flex;align-items:center;justify-content:space-between">
            <div class="etitle" id="cetitle">Nouveau cookie</div>
            <button class="btn btn-ghost" id="ceclose" style="padding:2px 7px;font-size:11px">✕</button>
          </div>
          <div class="fr"><div class="fl">Nom *</div><input class="input mono" id="cn" placeholder="nom"/></div>
          <div class="fr"><div class="fl">Valeur</div><textarea class="input ta mono" id="cv" placeholder="valeur…"></textarea></div>
          <div class="fg2">
            <div class="fr"><div class="fl">Domaine</div><input class="input mono" id="cd" placeholder=".example.com"/></div>
            <div class="fr"><div class="fl">Chemin</div><input class="input mono" id="cp" placeholder="/"/></div>
          </div>
          <div class="fr"><div class="fl">Expiration</div><input class="input" id="cex" type="datetime-local"/></div>
          <div class="fcbs">
            <label class="fcb"><input type="checkbox" id="csec"/> Secure</label>
            <label class="fcb"><input type="checkbox" id="cho" disabled/> HttpOnly (ro)</label>
            <label class="fcb"><input type="checkbox" id="cses"/> Session</label>
          </div>
          <div class="ea">
            <button class="btn btn-red" id="cdel" style="display:none">Supprimer</button>
            <button class="btn btn-g" id="csave">Enregistrer</button>
          </div>
        </div>
        <div class="foot"><span class="finfo" id="cinfo">0 cookie</span></div>`;

      const list   = body.querySelector('#cl');
      const editor = body.querySelector('#ce');

      const render = () => {
        const f = filter;
        const vis = f ? cookies.filter(c => c.name.toLowerCase().includes(f) || c.value.toLowerCase().includes(f)) : cookies;
        body.querySelector('#cinfo').textContent = `${vis.length} / ${cookies.length} cookie${cookies.length > 1 ? 's' : ''}`;
        if (!vis.length) { list.innerHTML = `<div class="empty">Aucun cookie${f ? ' correspondant' : ''}</div>`; return; }
        list.innerHTML = '';
        vis.forEach(c => {
          const row = N.create('div'); row.className = 'crow';
          const vp  = (c.value || '').slice(0, 38) + (c.value.length > 38 ? '…' : '');
          row.innerHTML = `
            <div style="flex:1;min-width:0">
              <div class="cname">${c.name}</div>
              <div class="cval">${vp || '<em style="opacity:.4">vide</em>'}</div>
            </div>
            <div class="flags">
              ${c.secure   ? '<span class="flag fs">S</span>' : ''}
              ${c.httpOnly ? '<span class="flag fh">H</span>' : ''}
              ${c.session  ? '<span class="flag fss">⏱</span>' : ''}
            </div>
            <button class="del" title="Supprimer">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                <polyline points="3 6 5 6 21 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <path d="M19 6l-1 14H6L5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>`;
          row.addEventListener('click', e => { if (e.target.closest('.del')) return; openEd(c); });
          row.querySelector('.del').addEventListener('click', e => { e.stopPropagation(); delCookie(c); });
          list.appendChild(row);
        });
      };

      const openEd = (c = null) => {
        editingName = c?.name || null;
        body.querySelector('#cetitle').textContent = c ? 'Modifier' : 'Nouveau cookie';
        body.querySelector('#cn').value  = c?.name  || '';
        body.querySelector('#cv').value  = c?.value || '';
        body.querySelector('#cd').value  = c?.domain || '';
        body.querySelector('#cp').value  = c?.path  || '/';
        body.querySelector('#csec').checked = c?.secure   || false;
        body.querySelector('#cho').checked  = c?.httpOnly || false;
        body.querySelector('#cses').checked = c?.session  || false;
        body.querySelector('#cdel').style.display = c ? '' : 'none';
        if (c && !c.session && c.expirationDate) {
          const d = new Date(c.expirationDate * 1000);
          body.querySelector('#cex').value = new Date(d - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        } else body.querySelector('#cex').value = '';
        editor.classList.remove('hidden');
        body.querySelector('#cn').focus();
      };

      const closeEd = () => { editor.classList.add('hidden'); editingName = null; };

      const loadCookies = () => {
        N.PM({ __ch: BUS_OUT, action: 'cookiesRequest', payload: { op: 'getAll', url: location.href } }, '*');
      };

      const delCookie = c => {
        N.PM({ __ch: BUS_OUT, action: 'cookiesRequest', payload: { op: 'remove', url: location.href, name: c.name, domain: c.domain } }, '*');
        N.sT(loadCookies, 280); closeEd();
      };

      const saveCookie = () => {
        const name = body.querySelector('#cn').value.trim(); if (!name) return;
        const det = {
          url: location.href, name, value: body.querySelector('#cv').value,
          path: body.querySelector('#cp').value.trim() || '/',
          secure: body.querySelector('#csec').checked,
        };
        const dom = body.querySelector('#cd').value.trim();
        if (dom) det.domain = dom;
        const ses = body.querySelector('#cses').checked;
        const exp = body.querySelector('#cex').value;
        if (!ses && exp) det.expirationDate = Math.floor(new Date(exp).getTime() / 1000);
        if (editingName && editingName !== name)
          N.PM({ __ch: BUS_OUT, action: 'cookiesRequest', payload: { op: 'remove', url: location.href, name: editingName } }, '*');
        N.PM({ __ch: BUS_OUT, action: 'cookiesRequest', payload: { op: 'set', details: det } }, '*');
        N.sT(loadCookies, 280); closeEd();
      };

      const exportCookies = () => {
        const blob = new Blob([JSON.stringify(cookies, null, 2)], { type: 'application/json' });
        const a = N.create('a'); a.href = URL.createObjectURL(blob);
        a.download = `cookies_${location.hostname}_${Date.now()}.json`; a.click();
        URL.revokeObjectURL(a.href);
      };

      const importCookies = () => {
        const inp = N.create('input'); inp.type = 'file'; inp.accept = '.json';
        inp.onchange = e => {
          const fr = new FileReader();
          fr.onload = ev => {
            try {
              const arr = JSON.parse(ev.target.result);
              if (Array.isArray(arr)) arr.forEach(c => N.PM({ __ch: BUS_OUT, action: 'cookiesRequest', payload: { op: 'set', details: { ...c, url: location.href } } }, '*'));
              N.sT(loadCookies, 500);
            } catch (_) {}
          };
          fr.readAsText(e.target.files[0]);
        };
        inp.click();
      };

      body.querySelector('#cs').addEventListener('input', e => { filter = e.target.value.toLowerCase(); render(); });
      body.querySelector('#ca').addEventListener('click', () => openEd(null));
      body.querySelector('#cr').addEventListener('click', loadCookies);
      body.querySelector('#cexp').addEventListener('click', exportCookies);
      body.querySelector('#cimp').addEventListener('click', importCookies);
      body.querySelector('#ceclose').addEventListener('click', closeEd);
      body.querySelector('#csave').addEventListener('click', saveCookie);
      body.querySelector('#cdel').addEventListener('click', () => { const c = cookies.find(x => x.name === editingName); if (c) delCookie(c); });
      body.querySelector('#cses').addEventListener('change', e => { body.querySelector('#cex').disabled = e.target.checked; if (e.target.checked) body.querySelector('#cex').value = ''; });

      N.AEL.call(window, 'message', e => {
        if (e.data?.__ch === BUS_OUT && e.data.action === 'cookiesResponse') {
          cookies = e.data.payload || []; render();
        }
      });

      loadCookies();
    });
  }

  // ════════════════════════════════════════════════════════════════
  // RESOURCE PANEL (Shadow DOM)
  // ════════════════════════════════════════════════════════════════
  function openResourcePanel() {
    createPanel('resources', '📡', 'Ressources & Scripts', 640, 520, (body, shadow, styleEl) => {
      styleEl.textContent += `
        .rtb{display:flex;gap:4px;padding:7px 9px;background:#161622;border-bottom:1px solid #252538;flex-shrink:0;flex-wrap:wrap;align-items:center}
        .rtab{padding:3px 9px;border-radius:20px;font-size:10.5px;font-weight:500;cursor:pointer;border:1px solid #2e2e48;background:#1d1d2e;color:#64748b;transition:all .12s}
        .rtab.a{border-color:rgba(34,197,94,.35);background:rgba(34,197,94,.1);color:#22c55e}
        .rs{flex:1;min-width:100px;background:#0d0d14;border:1px solid #2e2e48;border-radius:5px;color:#f1f5f9;font-size:11.5px;padding:3px 8px;outline:none}
        .rs:focus{border-color:#22c55e}
        .rlist{flex:1;overflow-y:auto;min-height:0;display:flex;flex-direction:column}
        .rrow{display:flex;align-items:center;gap:7px;padding:5px 9px;border-bottom:1px solid #1d1d2e;transition:background .1s;cursor:default}
        .rrow:hover{background:#161622}
        .rrow.blk{opacity:.45;background:rgba(239,68,68,.03)}
        .rtype{font-size:8.5px;font-weight:700;border-radius:3px;padding:1px 5px;width:58px;text-align:center;flex-shrink:0;border:1px solid transparent}
        .ts{background:rgba(34,197,94,.1);border-color:rgba(34,197,94,.22);color:#22c55e}
        .ti{background:rgba(100,116,139,.1);border-color:rgba(100,116,139,.22);color:#94a3b8}
        .tx{background:rgba(245,158,11,.1);border-color:rgba(245,158,11,.22);color:#f59e0b}
        .tf{background:rgba(167,139,250,.1);border-color:rgba(167,139,250,.22);color:#a78bfa}
        .tst{background:rgba(59,130,246,.1);border-color:rgba(59,130,246,.22);color:#60a5fa}
        .tim{background:rgba(236,72,153,.1);border-color:rgba(236,72,153,.22);color:#f472b6}
        .rurl{flex:1;font-size:10.5px;font-family:monospace;color:#94a3b8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
        .rhost{color:#f1f5f9}
        .rcnt{font-size:9.5px;color:#64748b;flex-shrink:0;min-width:18px;text-align:right}
        .rdot{width:6px;height:6px;border-radius:50%;flex-shrink:0}
        .dl{background:#22c55e}.dp{background:#f59e0b;animation:blink .8s infinite}.de{background:#ef4444}.db{background:#64748b}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
        .ract{display:flex;gap:3px;flex-shrink:0}
        .ra{width:20px;height:20px;border-radius:4px;border:1px solid #2e2e48;background:#1d1d2e;color:#64748b;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .12s}
        .ra:hover{color:#f1f5f9;border-color:#3e3e58}
        .ra.rb:hover{background:rgba(239,68,68,.1);border-color:#ef4444;color:#f87171}
        .ra.rub{color:#ef4444;border-color:#ef4444;background:rgba(239,68,68,.07)}
        .viewer{position:absolute;inset:0;background:#0f1117;z-index:10;display:flex;flex-direction:column}
        .viewer.h{display:none}
        .vbar{display:flex;align-items:center;gap:7px;padding:7px 9px;background:#161622;border-bottom:1px solid #252538;flex-shrink:0}
        .vtitle{flex:1;font-size:10.5px;color:#f1f5f9;font-family:monospace;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .vcode{flex:1;overflow:auto;padding:10px;font-size:11px;font-family:monospace;color:#86efac;line-height:1.6;white-space:pre;tab-size:2;min-height:0}
        .vfoot{display:flex;gap:5px;padding:6px 9px;background:#161622;border-top:1px solid #252538;flex-shrink:0}
        .rfoot{display:flex;align-items:center;justify-content:space-between;padding:4px 9px;background:#161622;border-top:1px solid #252538;flex-shrink:0}
        .rfinfo{font-size:9.5px;color:#64748b}
      `;

      let filter = 'all', search = '', res = [];
      body.style.position = 'relative';

      body.innerHTML = `
        <div class="rtb">
          <button class="rtab a" data-t="all">Tout</button>
          <button class="rtab" data-t="script">Scripts</button>
          <button class="rtab" data-t="xhr">XHR</button>
          <button class="rtab" data-t="fetch">Fetch</button>
          <button class="rtab" data-t="style">CSS</button>
          <button class="rtab" data-t="image">Images</button>
          <input class="rs" id="rsrch" placeholder="Filtrer…"/>
          <button class="btn btn-ghost" id="rclr" style="font-size:10.5px">🗑</button>
        </div>
        <div class="rlist" id="rl"></div>
        <div class="rfoot"><span class="rfinfo" id="rfi">0 ressource</span></div>
        <div class="viewer h" id="rv">
          <div class="vbar">
            <span class="vtitle" id="rvt"></span>
            <button class="btn btn-ghost" id="rvclose" style="padding:2px 7px;font-size:10.5px">✕</button>
          </div>
          <div class="vcode" id="rvc">Chargement…</div>
          <div class="vfoot">
            <button class="btn btn-g" id="rvcopy">⎘ Copier</button>
            <button class="btn btn-ghost" id="rvdl">⬇ Télécharger</button>
            <button class="btn btn-am" id="rvpatch">✏ Patcher</button>
          </div>
        </div>`;

      const rl = body.querySelector('#rl');

      const fmtUrl = url => {
        try { const u = new URL(url); return `<span class="rhost">${u.hostname}</span>${u.pathname.slice(0, 48)}${u.pathname.length > 48 ? '…' : ''}`; }
        catch (_) { return url.slice(0, 58); }
      };

      const typeClass = { script:'ts', 'script-inline':'ti', xhr:'tx', fetch:'tf', style:'tst', image:'tim' };
      const typeLabel = { script:'SCRIPT', 'script-inline':'INLINE', xhr:'XHR', fetch:'FETCH', style:'CSS', image:'IMG' };

      const renderRes = () => {
        let vis = res;
        if (filter !== 'all') vis = vis.filter(r => r.type === filter || r.type.startsWith(filter));
        if (search) vis = vis.filter(r => r.url.toLowerCase().includes(search));
        body.querySelector('#rfi').textContent = `${vis.length} / ${res.length} ressource${res.length > 1 ? 's' : ''}`;
        if (!vis.length) { rl.innerHTML = `<div class="empty">Aucune ressource${filter !== 'all' ? ' de ce type' : ''}</div>`; return; }
        rl.innerHTML = '';
        vis.forEach(r => {
          const row = N.create('div'); row.className = `rrow${r.blocked ? ' blk' : ''}`;
          const tc = typeClass[r.type] || 'ts';
          const tl = typeLabel[r.type] || r.type.toUpperCase().slice(0, 7);
          const sc = r.blocked ? 'db' : r.status === 'loaded' ? 'dl' : r.status === 'error' ? 'de' : 'dp';
          row.innerHTML = `
            <div class="rdot ${sc}"></div>
            <div class="rtype ${tc}">${tl}</div>
            <div class="rurl" title="${r.url}">${fmtUrl(r.url)}</div>
            ${r.size ? `<div class="rcnt" style="font-size:9px">${(r.size/1024).toFixed(1)}K</div>` : ''}
            ${r.count > 1 ? `<div class="rcnt">×${r.count}</div>` : ''}
            <div class="ract">
              <button class="ra vbtn" data-id="${r.id}" title="Voir">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/><path d="M22 12S18 5 12 5 2 12 2 12s4 7 10 7 10-7 10-7z" stroke="currentColor" stroke-width="2"/></svg>
              </button>
              <button class="ra cpbtn" data-url="${r.url}" title="Copier URL">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" stroke-width="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" stroke-width="2"/></svg>
              </button>
              <button class="ra rb ${r.blocked ? 'rub' : ''} blkbtn" data-url="${r.url}" data-blk="${r.blocked}" title="${r.blocked ? 'Débloquer' : 'Bloquer'}">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none">${r.blocked
                  ? '<path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>'
                  : '<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
                }</svg>
              </button>
            </div>`;

          const entry = r;
          row.querySelector('.vbtn').addEventListener('click', e => { e.stopPropagation(); openViewer(entry); });
          row.querySelector('.cpbtn').addEventListener('click', e => { e.stopPropagation(); navigator.clipboard?.writeText(r.url); });
          row.querySelector('.blkbtn').addEventListener('click', e => {
            e.stopPropagation();
            const isBlk = e.currentTarget.dataset.blk === 'true';
            if (isBlk) unblockResource(r.url); else blockResource(r.url);
          });
          rl.appendChild(row);
        });
      };

      const openViewer = r => {
        const vw = body.querySelector('#rv');
        body.querySelector('#rvt').textContent = r.url;
        const vc = body.querySelector('#rvc');
        if (r.content) {
          vc.textContent = r.content;
        } else if (r.url && !r.url.startsWith('inline_')) {
          vc.textContent = 'Chargement…';
          fetch(r.url).then(x => x.text()).then(t => { vc.textContent = t; }).catch(() => { vc.textContent = '(Non disponible — CORS ou cross-origin)'; });
        } else { vc.textContent = '(Contenu non disponible)'; }
        vw.classList.remove('h');
        body.querySelector('#rvcopy').onclick  = () => navigator.clipboard?.writeText(vc.textContent);
        body.querySelector('#rvdl').onclick    = () => { const b = new Blob([vc.textContent],{type:'text/plain'}); const a=N.create('a'); a.href=URL.createObjectURL(b); a.download=(r.url.split('/').pop().split('?')[0]||'resource.txt'); a.click(); URL.revokeObjectURL(a.href); };
        body.querySelector('#rvpatch').onclick = () => { const m = prompt('Modifier (remplace) :', vc.textContent.slice(0,200)); if(m!==null){vc.textContent=m; try{(new Function(m))();}catch(e){alert('Erreur: '+e.message);}} };
        body.querySelector('#rvclose').onclick = () => vw.classList.add('h');
      };

      body.querySelectorAll('.rtab').forEach(t => {
        t.addEventListener('click', () => { body.querySelectorAll('.rtab').forEach(x => x.classList.remove('a')); t.classList.add('a'); filter = t.dataset.t; renderRes(); });
      });
      body.querySelector('#rsrch').addEventListener('input', e => { search = e.target.value.toLowerCase(); renderRes(); });
      body.querySelector('#rclr').addEventListener('click', () => { _resources.clear(); _sendResourceList(); });

      N.AEL.call(window, 'message', e => {
        if (e.data?.__ch === BUS_OUT && e.data.action === 'resourceList') { res = e.data.payload || []; renderRes(); }
      });

      _sendResourceList();
    });
  }

  // ════════════════════════════════════════════════════════════════
  // Focus protection
  // ════════════════════════════════════════════════════════════════
  function patchFocus() {
    if (S.focus) {
      HTMLElement.prototype.focus = nativeToString(function focus(o) { if (window.event?.isTrusted) return N.focus.call(this, o); }, 'focus');
      HTMLElement.prototype.blur  = nativeToString(function blur()  { if (window.event?.isTrusted) return N.blur.call(this); },  'blur');
    } else {
      HTMLElement.prototype.focus = N.focus;
      HTMLElement.prototype.blur  = N.blur;
    }
  }

  // ════════════════════════════════════════════════════════════════
  // Custom scripts (L9)
  // ════════════════════════════════════════════════════════════════
  const _ran = new Set();
  function runScripts(phase) {
    if (!Array.isArray(S.customScripts)) return;
    S.customScripts.forEach(sc => {
      if (!sc.enabled || sc.runAt !== phase) return;
      const uid = `${sc.id}_${phase}`;
      if (_ran.has(uid)) return;
      _ran.add(uid);
      try { (new Function(sc.code))(); } catch (e) { console.warn(`[UA] "${sc.name}":`, e.message); }
    });
  }

  // ════════════════════════════════════════════════════════════════
  // Apply all
  // ════════════════════════════════════════════════════════════════
  function applyAll(phase) {
    applyCSS();
    clearInlineHandlers();
    if (S.dragdrop)  fixDraggable();
    patchVisibility();
    patchFocus();
    patchConsole();
    if (S.devtools)  patchDevtools();
    if (S.overlays)  autoRemoveOverlays();
    if (phase)       runScripts(phase);
  }

  // ════════════════════════════════════════════════════════════════
  // SECURE MESSAGE BUS
  // ════════════════════════════════════════════════════════════════
  const BUS_IN  = '__ua_c2p__';
  const BUS_OUT = '__ua_p2c__';

  N.AEL.call(window, 'message', function (e) {
    if (!e.data || e.data.__ch !== BUS_IN) return;
    const { __t: tok, action, payload } = e.data;

    // ── Auth token ────────────────────────────────────────────────
    if (!_tokenSet) {
      // Premier message : on accepte uniquement 'init' avec un token long
      if (action === 'init' && typeof tok === 'string' && tok.length >= 32) {
        _authToken = tok; _tokenSet = true;
      } else return;
    } else {
      if (tok !== _authToken) return; // Token invalide → ignoré silencieusement
    }

    // ── Dispatch ─────────────────────────────────────────────────
    switch (action) {
      case 'init':
      case 'update': {
        // Validation whitelist stricte
        if (action === 'update' && !validatePayload(payload)) return;
        const safe = {};
        Object.keys(payload || {}).forEach(k => { if (ALLOWED_STATE_KEYS.has(k)) safe[k] = payload[k]; });
        Object.assign(S, safe);
        if (safe.customScripts) _ran.clear();
        applyAll('document_idle');
        break;
      }
      case 'removeOverlays':      autoRemoveOverlays(); break;
      case 'restoreOverlay':      restoreOverlay(payload?.id); break;
      case 'restoreAllOverlays':  [..._overlays.keys()].forEach(id => restoreOverlay(id)); break;
      case 'activatePicker':      activatePicker(); break;
      case 'cancelPicker':        deactivatePicker(false); break;
      case 'openCookiePanel':     openCookiePanel(); break;
      case 'openResourcePanel':   openResourcePanel(); break;
      case 'blockResource':       blockResource(payload?.url); break;
      case 'unblockResource':     unblockResource(payload?.url); break;
      case 'clearResources':      _resources.clear(); _sendResourceList(); break;
      case 'getState':
        N.PM({ __ch: BUS_OUT, action: 'state', payload: { ...S } }, '*');
        _sendOverlayList();
        _sendResourceList();
        break;
    }
  }, false);

  // ════════════════════════════════════════════════════════════════
  // Bootstrap
  // ════════════════════════════════════════════════════════════════
  applyCSS();
  patchVisibility();
  patchConsole();
  runScripts('document_start');

  if (document.readyState === 'loading') {
    N.AEL.call(document, 'DOMContentLoaded', () => {
      applyAll('document_end');
      startObserver();
      _scanExistingResources();
    }, { once: true });
  } else {
    applyAll('document_end');
    startObserver();
    _scanExistingResources();
  }

  N.AEL.call(window, 'load', () => {
    applyAll('document_idle');
    _scanExistingResources();
    N.sT(() => { clearInlineHandlers(); if (S.dragdrop) fixDraggable(); }, 300);
    N.sT(() => { clearInlineHandlers(); if (S.overlays) autoRemoveOverlays(); runScripts('document_idle'); }, 900);
  }, { once: true });

  N.PM({ __ch: BUS_OUT, action: 'ready' }, '*');
})();
