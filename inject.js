/**
 * UnlockAll – inject.js v2.0  (world: "MAIN", run_at: "document_start")
 *
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  ARCHITECTURE — 9 couches de bypass superposées                 │
 * │                                                                 │
 * │  L1. Event.prototype override  ← plus puissant, touche tout    │
 * │  L2. addEventListener wrapping (filet de sécurité par listener) │
 * │  L3. on* property defineProperty traps sur tous les prototypes  │
 * │  L4. Capture-phase sentinel (avant n'importe quel listener)     │
 * │  L5. CSS !important injection                                   │
 * │  L6. DOM walker + MutationObserver (handlers dynamiques)        │
 * │  L7. Spoofing visibility/hidden API                             │
 * │  L8. DevTools / debugger detection bypass                       │
 * │  L9. Scripts utilisateur personnalisés                          │
 * └─────────────────────────────────────────────────────────────────┘
 */
(function () {
  'use strict';

  // ── Guard ─────────────────────────────────────────────────────────
  if (window['__ua2__']) return;
  Object.defineProperty(window, '__ua2__', { value: true, writable: false, enumerable: false, configurable: false });

  // ════════════════════════════════════════════════════════════════
  // NATIVE REFS — capturées avant tout script de la page
  // ════════════════════════════════════════════════════════════════
  const N = {
    AEL   : EventTarget.prototype.addEventListener,
    REL   : EventTarget.prototype.removeEventListener,
    PD    : Event.prototype.preventDefault,
    SP    : Event.prototype.stopPropagation,
    SIP   : Event.prototype.stopImmediatePropagation,
    CC    : console.clear.bind(console),
    focus : HTMLElement.prototype.focus,
    blur  : HTMLElement.prototype.blur,
    PM    : window.postMessage.bind(window),
    GCD   : Object.getOwnPropertyDescriptor.bind(Object),
    DP    : Object.defineProperty.bind(Object),
    keys  : Object.keys.bind(Object),
    qsa   : Document.prototype.querySelectorAll.bind(document),
    setTimeout  : window.setTimeout.bind(window),
    setInterval : window.setInterval.bind(window),
    GCS   : window.getComputedStyle.bind(window),
  };

  // ════════════════════════════════════════════════════════════════
  // STATE
  // ════════════════════════════════════════════════════════════════
  const S = {
    contextmenu    : true,
    selectstart    : true,
    clipboard      : true,
    keyboard       : true,
    dragdrop       : true,
    scroll         : false,
    cursor         : true,
    pointerEvents  : false,
    print          : true,
    overlays       : false,
    devtools       : false,
    consoleProtect : false,
    focus          : false,
    visibility     : true,
    customScripts  : [],
  };

  // ── event type → state key ────────────────────────────────────────
  const EV = {
    contextmenu      : 'contextmenu',
    selectstart      : 'selectstart',
    mousedown        : 'selectstart',
    copy             : 'clipboard',
    cut              : 'clipboard',
    paste            : 'clipboard',
    keydown          : 'keyboard',
    keyup            : 'keyboard',
    keypress         : 'keyboard',
    dragstart        : 'dragdrop',
    drag             : 'dragdrop',
    dragend          : 'dragdrop',
    dragover         : 'dragdrop',
    drop             : 'dragdrop',
    wheel            : 'scroll',
    touchmove        : 'scroll',
    beforeprint      : 'print',
    visibilitychange : 'visibility',
  };

  // ── on* prop → state key ─────────────────────────────────────────
  const ON = {
    oncontextmenu : 'contextmenu',
    onselectstart : 'selectstart',
    oncopy        : 'clipboard',
    oncut         : 'clipboard',
    onpaste       : 'clipboard',
    onkeydown     : 'keyboard',
    onkeyup       : 'keyboard',
    onkeypress    : 'keyboard',
    ondragstart   : 'dragdrop',
    ondrag        : 'dragdrop',
    ondragover    : 'dragdrop',
    ondrop        : 'dragdrop',
    onbeforeprint : 'print',
    onblur        : 'focus',
  };

  // helper
  function blocked(ev) { const k = EV[ev.type]; return k && S[k]; }

  // ════════════════════════════════════════════════════════════════
  // L1 — Event.prototype OVERRIDE
  //
  // C'est la couche la plus profonde du bypass. En remplaçant les
  // méthodes sur le prototype d'Event lui-même, TOUT appel à
  // preventDefault(), stopPropagation() ou stopImmediatePropagation()
  // par n'importe quel listener (inline, addEventListener, framework…)
  // est intercepté et annulé pour les types d'événements bloqués.
  // ════════════════════════════════════════════════════════════════
  Event.prototype.preventDefault = function () {
    if (blocked(this)) return;
    return N.PD.call(this);
  };
  Event.prototype.stopPropagation = function () {
    if (blocked(this)) return;
    return N.SP.call(this);
  };
  Event.prototype.stopImmediatePropagation = function () {
    if (blocked(this)) return;
    return N.SIP.call(this);
  };

  // returnValue = false  (chemin legacy "return false")
  try {
    const rvd = N.GCD(Event.prototype, 'returnValue');
    if (rvd && rvd.set) {
      N.DP(Event.prototype, 'returnValue', {
        get: rvd.get,
        set(v) { if (v === false && blocked(this)) return; rvd.set.call(this, v); },
        configurable: true,
      });
    }
  } catch (_) {}

  // ════════════════════════════════════════════════════════════════
  // L2 — addEventListener WRAPPING
  //
  // Deuxième filet : wrapping individuel de chaque listener ajouté
  // par la page. Si L1 est détecté et restauré par la page, L2
  // reste actif car chaque listener est personnellement neutralisé.
  // ════════════════════════════════════════════════════════════════
  const _wmap = new WeakMap();

  EventTarget.prototype.addEventListener = function (type, fn, opts) {
    const handler = typeof fn === 'function' ? fn
      : (fn && typeof fn.handleEvent === 'function') ? fn.handleEvent.bind(fn) : null;

    if (handler && EV[type]) {
      let w = _wmap.get(fn);
      if (!w) {
        w = function (e) {
          const k = EV[e.type];
          if (k && S[k]) {
            const p = e.preventDefault, s = e.stopPropagation, si = e.stopImmediatePropagation;
            e.preventDefault = e.stopPropagation = e.stopImmediatePropagation = function () {};
            try { handler.call(this, e); } catch (_) {}
            e.preventDefault = p; e.stopPropagation = s; e.stopImmediatePropagation = si;
          } else {
            handler.call(this, e);
          }
        };
        _wmap.set(fn, w);
      }
      return N.AEL.call(this, type, w, opts);
    }
    return N.AEL.call(this, type, fn, opts);
  };

  EventTarget.prototype.removeEventListener = function (type, fn, opts) {
    return N.REL.call(this, type, _wmap.get(fn) ?? fn, opts);
  };

  // ════════════════════════════════════════════════════════════════
  // L3 — on* PROPERTY TRAPS via defineProperty
  //
  // Intercepte les assignations directes : document.oncontextmenu = fn
  // Les valeurs sont stockées dans une WeakMap mais le handler natif
  // n'est câblé que lorsque la fonctionnalité est désactivée.
  // ════════════════════════════════════════════════════════════════
  const PROTOS = [Document.prototype, HTMLElement.prototype, SVGElement.prototype, Window.prototype];

  function patchOnProp(proto, prop, key) {
    const d = N.GCD(proto, prop);
    if (!d || !d.configurable) return;
    const store = new WeakMap();
    N.DP(proto, prop, {
      enumerable  : d.enumerable ?? true,
      configurable: true,
      get() { return S[key] ? null : (store.get(this) ?? null); },
      set(fn) {
        store.set(this, fn);
        if (d.set) d.set.call(this, S[key] ? null : fn);
      },
    });
  }

  Object.entries(ON).forEach(([p, k]) => PROTOS.forEach(pr => { try { patchOnProp(pr, p, k); } catch (_) {} }));

  // ════════════════════════════════════════════════════════════════
  // L4 — CAPTURE-PHASE SENTINEL LISTENERS
  //
  // Un listener en phase de capture sur document s'exécute avant
  // tout listener de la page. On force defaultPrevented = false
  // pour annuler tout preventDefault qui aurait "filtré".
  // ════════════════════════════════════════════════════════════════
  Object.keys(EV).forEach(type => {
    N.AEL.call(document, type, function (e) {
      if (!blocked(e)) return;
      try { N.DP(e, 'defaultPrevented', { get: () => false, configurable: true }); } catch (_) {}
    }, { capture: true, passive: false });
  });

  // ════════════════════════════════════════════════════════════════
  // L5 — CSS INJECTION
  // ════════════════════════════════════════════════════════════════
  let _css = null;

  function buildCSS() {
    const r = [];
    if (S.selectstart) {
      r.push(
        `*,*::before,*::after{user-select:text!important;-webkit-user-select:text!important;-moz-user-select:text!important}`,
        `[class*="no-select"],[class*="noselect"],[class*="disable-select"],[unselectable="on"]{user-select:text!important;-webkit-user-select:text!important}`,
        `::selection{background:rgba(59,130,246,.3)!important;color:inherit!important}`
      );
    }
    if (S.cursor) {
      r.push(
        `*{cursor:auto!important}`,
        `a,button,[role="button"],[onclick],[tabindex]{cursor:pointer!important}`
      );
    }
    if (S.scroll) {
      r.push(
        `html,body{overflow:auto!important;height:auto!important;touch-action:auto!important;max-height:none!important}`,
        `[class*="modal-open"],[class*="no-scroll"],[class*="noscroll"],[class*="scroll-lock"]{overflow:auto!important}`
      );
    }
    if (S.dragdrop) {
      // CSS seul ne suffit pas : on active aussi draggable via DOM walker (L6)
      r.push(
        `*{-webkit-user-drag:auto!important;user-drag:auto!important}`,
        `img,a{-webkit-user-drag:auto!important}`,
        `[draggable="false"]{cursor:grab!important}`
      );
    }
    if (S.print) {
      r.push(
        `@media print{html,body,*{display:revert!important;visibility:visible!important;overflow:visible!important;height:auto!important}}`
      );
    }
    if (S.pointerEvents) {
      r.push(
        `[class*="overlay"]:not(video):not(iframe):not(canvas),` +
        `[class*="paywall"],[id*="overlay"],[id*="paywall"],` +
        `[class*="cookie-"],[id*="cookie-"],[class*="gdpr"],[id*="gdpr"]` +
        `{pointer-events:none!important;opacity:0!important;transition:none!important}`
      );
    }
    return r.join('\n');
  }

  function applyCSS() {
    if (!_css) {
      _css = document.createElement('style');
      _css.setAttribute('data-ua-v', '2');
    }
    _css.textContent = buildCSS();
    const root = document.head || document.documentElement;
    if (root && !_css.isConnected) root.appendChild(_css);
  }

  // ════════════════════════════════════════════════════════════════
  // L6 — DOM WALKER + MutationObserver
  //
  // Parcourt tous les éléments pour :
  //   • Supprimer les attributs on* inline (ex: <body oncopy="return false">)
  //   • Forcer draggable="true" sur tous les éléments (fix drag & drop)
  //   • S'auto-relancer sur chaque mutation du DOM
  // ════════════════════════════════════════════════════════════════

  // — Drag & Drop : force draggable sur tout le DOM ─────────────────
  function fixDraggable(root) {
    if (!S.dragdrop) return;
    try {
      (root ? [root] : [document.documentElement])
        .concat(root ? [] : [])
        .forEach(function walk(el) {
          if (!el || el.nodeType !== 1) return;
          // Force draggable sauf sur les inputs et les éléments interactifs sensibles
          const tag = el.tagName;
          if (tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') {
            if (el.getAttribute('draggable') === 'false') {
              el.setAttribute('draggable', 'true');
            }
            // Supprimer ondragstart inline
            if (el.getAttribute('ondragstart')) {
              el.removeAttribute('ondragstart');
              el.ondragstart = null;
            }
          }
          for (const child of el.children) walk(child);
        });
    } catch (_) {}
  }

  // — Nettoyage des handlers on* inline ────────────────────────────
  function clearInlineHandlers(root) {
    const scope = root || document;
    const nodes = root ? [root] : [document, document.documentElement, document.body, window];

    nodes.filter(Boolean).forEach(node => {
      Object.entries(ON).forEach(([prop, key]) => {
        if (!S[key]) return;
        try {
          if (node[prop] != null) node[prop] = null;
          if (node.removeAttribute) node.removeAttribute(prop);
        } catch (_) {}
      });
    });

    // Scrub éléments DOM avec attributs on* inline
    if (scope.querySelectorAll) {
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

  // — MutationObserver ──────────────────────────────────────────────
  let _obs = null;
  function startObserver() {
    if (_obs) return;
    _obs = new MutationObserver(muts => {
      let needClear = false, needOverlay = false, needDrag = false;
      for (const m of muts) {
        if (m.type === 'attributes') {
          const a = m.attributeName || '';
          if (a.startsWith('on') || a === 'draggable') { needClear = true; needDrag = true; }
        }
        if (m.type === 'childList' && m.addedNodes.length) {
          needClear = true; needOverlay = true; needDrag = true;
          // Process newly added nodes only
          m.addedNodes.forEach(n => {
            if (n.nodeType === 1) {
              clearInlineHandlers(n);
              fixDraggable(n);
            }
          });
        }
        if (needClear && needOverlay) break;
      }
      if (needClear) clearInlineHandlers();
      if (needDrag && S.dragdrop) fixDraggable();
      if (needOverlay && S.overlays) autoRemoveOverlays();
    });

    const root = document.documentElement || document.body;
    if (root) _obs.observe(root, { childList: true, subtree: true, attributes: true });
  }

  // ════════════════════════════════════════════════════════════════
  // L7 — VISIBILITY / HIDDEN SPOOFING
  //
  // Certains sites désactivent copier/coller ou les menus contextuels
  // quand l'onglet est "hidden". On spoofe les APIs de visibilité
  // pour que la page croie toujours être au premier plan.
  // ════════════════════════════════════════════════════════════════
  function patchVisibility() {
    if (!S.visibility) return;
    const fakeProps = {
      hidden: false, visibilityState: 'visible',
      webkitHidden: false, webkitVisibilityState: 'visible',
    };
    Object.entries(fakeProps).forEach(([p, v]) => {
      try { N.DP(document, p, { get: () => v, configurable: true, enumerable: true }); } catch (_) {}
    });
  }

  // ════════════════════════════════════════════════════════════════
  // L8 — DEVTOOLS / DEBUGGER BYPASS
  //
  // Les sites utilisent plusieurs méthodes pour détecter DevTools :
  //  • outerWidth vs innerWidth (différence = panneau DevTools ouvert)
  //  • setInterval rapide pour mesurer le temps d'exécution
  //  • Instruction "debugger" via Function() pour figer la page
  //  • console.log avec getter toString() qui déclenche une alerte
  //  • Performance.now() high-resolution timing attacks
  // ════════════════════════════════════════════════════════════════
  function patchDevtools() {
    if (!S.devtools) return;

    // 1. Block debugger via Function constructor
    try {
      const _Fn = window.Function;
      const _FnToStr = Function.prototype.toString;
      window.Function = function (...args) {
        const body = args[args.length - 1] ?? '';
        if (typeof body === 'string' && body.includes('debugger'))
          args[args.length - 1] = body.replace(/debugger/g, '/**/');
        return _Fn.apply(this, args);
      };
      window.Function.prototype = _Fn.prototype;
      // Fake toString pour masquer notre wrapper
      Function.prototype.toString = function () {
        const s = _FnToStr.call(this);
        return s.includes('/**/') ? 'function anonymous() {\n\n}' : s;
      };
    } catch (_) {}

    // 2. outerWidth/Height spoofing
    try {
      N.DP(window, 'outerWidth',  { get: () => window.innerWidth,     configurable: true });
      N.DP(window, 'outerHeight', { get: () => window.innerHeight + 1, configurable: true });
    } catch (_) {}

    // 3. setInterval / setTimeout throttle (détection par timing)
    try {
      const _sI = N.setInterval;
      window.setInterval = function (fn, ms, ...args) {
        return _sI(fn, Math.max(ms || 0, 50), ...args);
      };
    } catch (_) {}

    // 4. Bloquer les boucles infinies de détection (pattern courant : while(true){debugger})
    try {
      const _sT = N.setTimeout;
      window.setTimeout = function (fn, ms, ...args) {
        if (typeof fn === 'string' && fn.includes('debugger')) return 0;
        return _sT(fn, ms, ...args);
      };
    } catch (_) {}
  }

  // ════════════════════════════════════════════════════════════════
  // OVERLAY MANAGER
  //
  // Gère une liste des overlays supprimés avec possibilité de restore.
  // Chaque overlay reçoit un ID unique et ses métadonnées sont gardées
  // pour affichage dans le popup.
  // ════════════════════════════════════════════════════════════════
  const _overlays = new Map(); // id → { el, origDisplay, origVisibility, desc, auto, ts }
  let _ovCnt = 0;

  function elDescription(el) {
    const id   = el.id ? `#${el.id}` : '';
    const cls  = el.className && typeof el.className === 'string'
                 ? `.${el.className.trim().split(/\s+/).slice(0, 3).join('.')}` : '';
    const text = (el.innerText || '').trim().slice(0, 30).replace(/\s+/g, ' ');
    return `${el.tagName.toLowerCase()}${id || cls}${text ? ` "${text}"` : ''}`;
  }

  function hideOverlay(el, auto = false) {
    if (!el || el.dataset.uaOvId) return; // already tracked
    const id = `ov_${++_ovCnt}`;
    _overlays.set(id, {
      el,
      origDisplay    : el.style.display,
      origVisibility : el.style.visibility,
      origOpacity    : el.style.opacity,
      desc           : elDescription(el),
      auto,
      ts             : Date.now(),
    });
    el.dataset.uaOvId = id;
    el.style.setProperty('display', 'none', 'important');
    sendOverlayList();
  }

  function restoreOverlay(id) {
    const entry = _overlays.get(id);
    if (!entry) return;
    entry.el.style.display    = entry.origDisplay;
    entry.el.style.visibility = entry.origVisibility;
    entry.el.style.opacity    = entry.origOpacity;
    delete entry.el.dataset.uaOvId;
    _overlays.delete(id);
    sendOverlayList();
  }

  function sendOverlayList() {
    const list = [..._overlays.entries()].map(([id, { desc, auto, ts }]) => ({ id, desc, auto, ts }));
    N.PM({ __ch: BUS_OUT, action: 'overlayList', payload: list }, '*');
  }

  function autoRemoveOverlays() {
    if (!S.overlays) return;
    try {
      document.querySelectorAll('div,section,aside,article,header').forEach(el => {
        if (el.dataset.uaOvId) return; // already handled
        const cs = N.GCS(el);
        const zi = parseInt(cs.zIndex) || 0;
        if ((cs.position === 'fixed' || cs.position === 'absolute') && zi > 100) {
          const r = el.getBoundingClientRect();
          const isBig = r.width > window.innerWidth * 0.75 && r.height > window.innerHeight * 0.45;
          const noVideo = !el.querySelector('nav,video,iframe,canvas');
          if (isBig && noVideo) hideOverlay(el, true);
        }
      });
      ['overflow', 'overflow-y', 'height', 'max-height'].forEach(p => {
        document.body?.style.setProperty(p, 'auto', 'important');
        document.documentElement?.style.setProperty(p, 'auto', 'important');
      });
      ['modal-open', 'overflow-hidden', 'no-scroll', 'noscroll', 'scroll-lock', 'locked']
        .forEach(c => document.body?.classList.remove(c));
    } catch (_) {}
  }

  // ════════════════════════════════════════════════════════════════
  // OVERLAY PICKER (mode clic manuel)
  //
  // Active un mode où le curseur change et un clic masque l'élément
  // pointé. Un panneau flottant guide l'utilisateur.
  // ════════════════════════════════════════════════════════════════
  let _picker = false;
  let _pickerTarget = null;
  let _pickerHighlight = null;
  let _pickerHint = null;

  function activatePicker() {
    if (_picker) return;
    _picker = true;

    // Highlight box
    _pickerHighlight = document.createElement('div');
    Object.assign(_pickerHighlight.style, {
      position: 'fixed', pointerEvents: 'none', zIndex: '2147483646',
      border: '2px solid #22c55e', background: 'rgba(34,197,94,0.08)',
      borderRadius: '4px', display: 'none', transition: 'all 80ms ease',
      boxShadow: '0 0 0 4px rgba(34,197,94,0.15)',
    });

    // Hint panel
    _pickerHint = document.createElement('div');
    Object.assign(_pickerHint.style, {
      position: 'fixed', bottom: '16px', left: '50%', transform: 'translateX(-50%)',
      zIndex: '2147483647', background: '#0d0d14', color: '#f1f5f9',
      fontFamily: 'system-ui, sans-serif', fontSize: '13px', fontWeight: '500',
      padding: '8px 18px', borderRadius: '20px', border: '1px solid #22c55e66',
      pointerEvents: 'none', whiteSpace: 'nowrap',
      boxShadow: '0 4px 24px rgba(0,0,0,0.6)',
    });
    _pickerHint.textContent = '🎯 Cliquez sur l\'élément à masquer — Échap pour annuler';
    document.body.appendChild(_pickerHighlight);
    document.body.appendChild(_pickerHint);

    document.body.style.cursor = 'crosshair';
    N.AEL.call(document, 'mousemove', _onPickerMove, { capture: true, passive: true });
    N.AEL.call(document, 'click',     _onPickerClick, { capture: true });
    N.AEL.call(document, 'keydown',   _onPickerKey,   { capture: true });
  }

  function deactivatePicker() {
    _picker = false;
    _pickerTarget = null;
    document.body.style.cursor = '';
    if (_pickerHighlight) { _pickerHighlight.remove(); _pickerHighlight = null; }
    if (_pickerHint)      { _pickerHint.remove(); _pickerHint = null; }
    N.REL.call(document, 'mousemove', _onPickerMove, true);
    N.REL.call(document, 'click',     _onPickerClick, true);
    N.REL.call(document, 'keydown',   _onPickerKey,   true);
  }

  function _onPickerMove(e) {
    if (!_picker || !_pickerHighlight) return;
    // Hide highlight to get element below
    _pickerHighlight.style.display = 'none';
    const el = document.elementFromPoint(e.clientX, e.clientY);
    _pickerHighlight.style.display = 'block';
    if (!el || el === _pickerHighlight || el === _pickerHint) return;
    _pickerTarget = el;
    const r = el.getBoundingClientRect();
    Object.assign(_pickerHighlight.style, {
      left: r.left + 'px', top: r.top + 'px',
      width: r.width + 'px', height: r.height + 'px',
    });
  }

  function _onPickerClick(e) {
    e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
    if (_pickerTarget) hideOverlay(_pickerTarget, false);
    deactivatePicker();
    N.PM({ __ch: BUS_OUT, action: 'pickerDone' }, '*');
  }

  function _onPickerKey(e) {
    if (e.key === 'Escape') { deactivatePicker(); N.PM({ __ch: BUS_OUT, action: 'pickerDone' }, '*'); }
  }

  // ════════════════════════════════════════════════════════════════
  // FOCUS PROTECTION
  // ════════════════════════════════════════════════════════════════
  function patchFocus() {
    if (S.focus) {
      HTMLElement.prototype.focus = function (opts) {
        if (window.event?.isTrusted) return N.focus.call(this, opts);
      };
      HTMLElement.prototype.blur = function () {
        if (window.event?.isTrusted) return N.blur.call(this);
      };
    } else {
      HTMLElement.prototype.focus = N.focus;
      HTMLElement.prototype.blur  = N.blur;
    }
  }

  // ════════════════════════════════════════════════════════════════
  // L9 — CUSTOM SCRIPTS
  // ════════════════════════════════════════════════════════════════
  const _ran = new Set();

  function runScripts(phase) {
    if (!Array.isArray(S.customScripts)) return;
    S.customScripts.forEach(sc => {
      if (!sc.enabled || sc.runAt !== phase) return;
      const uid = `${sc.id}_${phase}`;
      if (_ran.has(uid)) return;
      _ran.add(uid);
      try {
        // eslint-disable-next-line no-new-func
        (new Function(sc.code))();
      } catch (err) {
        console.warn(`[UnlockAll] Script "${sc.name}":`, err.message);
      }
    });
  }

  // ════════════════════════════════════════════════════════════════
  // CONSOLE PROTECTION
  // ════════════════════════════════════════════════════════════════
  function patchConsole() {
    console.clear = S.consoleProtect ? function () {} : N.CC;
  }

  // ════════════════════════════════════════════════════════════════
  // APPLY ALL
  // ════════════════════════════════════════════════════════════════
  function applyAll(phase) {
    applyCSS();
    clearInlineHandlers();
    if (S.dragdrop) fixDraggable();
    patchVisibility();
    patchFocus();
    patchConsole();
    if (S.devtools) patchDevtools();
    if (S.overlays) autoRemoveOverlays();
    if (phase) runScripts(phase);
  }

  // ════════════════════════════════════════════════════════════════
  // MESSAGE BUS
  // ════════════════════════════════════════════════════════════════
  const BUS_IN  = '__ua_c2p__';
  const BUS_OUT = '__ua_p2c__';

  N.AEL.call(window, 'message', function (e) {
    if (!e.data || e.data.__ch !== BUS_IN) return;
    const { action, payload } = e.data;
    switch (action) {
      case 'init':
      case 'update':
        Object.assign(S, payload);
        if (payload?.customScripts) _ran.clear();
        applyAll('document_idle');
        break;
      case 'removeOverlays':
        autoRemoveOverlays();
        break;
      case 'restoreOverlay':
        restoreOverlay(payload.id);
        break;
      case 'restoreAllOverlays':
        [..._overlays.keys()].forEach(restoreOverlay);
        break;
      case 'activatePicker':
        activatePicker();
        break;
      case 'getState':
        N.PM({ __ch: BUS_OUT, action: 'state', payload: { ...S } }, '*');
        sendOverlayList();
        break;
    }
  }, false);

  // ════════════════════════════════════════════════════════════════
  // BOOTSTRAP
  // ════════════════════════════════════════════════════════════════

  // Phase 1 — document_start (avant tout)
  applyCSS();
  patchVisibility();
  patchConsole();
  runScripts('document_start');

  if (document.readyState === 'loading') {
    N.AEL.call(document, 'DOMContentLoaded', () => {
      applyAll('document_end');
      startObserver();
    }, { once: true });
  } else {
    applyAll('document_end');
    startObserver();
  }

  N.AEL.call(window, 'load', () => {
    applyAll('document_idle');
    // Certains sites réactivent leurs protections 200-800ms après le load
    N.setTimeout(() => { clearInlineHandlers(); if (S.dragdrop) fixDraggable(); }, 300);
    N.setTimeout(() => { clearInlineHandlers(); if (S.overlays) autoRemoveOverlays(); runScripts('document_idle'); }, 800);
  }, { once: true });

  N.PM({ __ch: BUS_OUT, action: 'ready' }, '*');

})();
