/**
 * UnlockAll – inject.js
 * Runs in MAIN world (page context) via Manifest V3.
 * All overrides happen here at the earliest possible moment.
 */
(function () {
  'use strict';

  if (window.__UNLOCKALL_INJECTED__) return;
  window.__UNLOCKALL_INJECTED__ = true;

  // ─────────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────────
  const state = {
    contextmenu:    true,   // Clic droit
    selectstart:    true,   // Sélection de texte
    clipboard:      true,   // Copy / Cut / Paste
    keyboard:       true,   // Raccourcis clavier
    dragdrop:       true,   // Drag & Drop
    scroll:         true,   // Défilement
    cursor:         true,   // Curseur de souris
    pointerEvents:  true,   // Pointer-events CSS
    print:          true,   // Impression
    overlays:       false,  // Retirer overlays / paywalls
    devtools:       false,  // Bypass détection DevTools
    consoleProtect: false,  // Protéger la console
    focus:          true,   // Empêcher vol de focus
  };

  // ─────────────────────────────────────────────
  // SAVE ORIGINALS before any page script runs
  // ─────────────────────────────────────────────
  const _origAEL   = EventTarget.prototype.addEventListener;
  const _origREL   = EventTarget.prototype.removeEventListener;
  const _origFocus = HTMLElement.prototype.focus;
  const _origBlur  = HTMLElement.prototype.blur;
  const _origConsoleClear = console.clear.bind(console);
  const _origOpen  = window.open.bind(window);

  // ─────────────────────────────────────────────
  // EVENT → GROUP MAPPING
  // ─────────────────────────────────────────────
  const EVENT_MAP = {
    contextmenu:  'contextmenu',
    selectstart:  'selectstart',
    mousedown:    'selectstart',
    copy:         'clipboard',
    cut:          'clipboard',
    paste:        'clipboard',
    keydown:      'keyboard',
    keyup:        'keyboard',
    keypress:     'keyboard',
    dragstart:    'dragdrop',
    drag:         'dragdrop',
    wheel:        'scroll',
    touchmove:    'scroll',
    touchstart:   'scroll',
    beforeprint:  'print',
  };

  // on* property → group
  const ON_PROP_MAP = {
    oncontextmenu: 'contextmenu',
    onselectstart: 'selectstart',
    oncopy:        'clipboard',
    oncut:         'clipboard',
    onpaste:       'clipboard',
    onkeydown:     'keyboard',
    onkeyup:       'keyboard',
    onkeypress:    'keyboard',
    ondragstart:   'dragdrop',
    onbeforeprint: 'print',
  };

  // ─────────────────────────────────────────────
  // LISTENER WRAPPING
  // Intercepts addEventListener calls and wraps
  // blocking listeners so they can't call
  // preventDefault / stopPropagation.
  // ─────────────────────────────────────────────
  const wrappedListeners = new WeakMap();

  EventTarget.prototype.addEventListener = function (type, listener, options) {
    if (typeof listener !== 'function') {
      return _origAEL.call(this, type, listener, options);
    }

    const group = EVENT_MAP[type];
    if (group) {
      let wrapped = wrappedListeners.get(listener);
      if (!wrapped) {
        wrapped = function (event) {
          if (!state[group]) {
            return listener.call(this, event);
          }
          // Neutralise prevention calls for the duration of the listener
          const origPD  = event.preventDefault;
          const origSP  = event.stopPropagation;
          const origSIP = event.stopImmediatePropagation;

          event.preventDefault          = function () {};
          event.stopPropagation         = function () {};
          event.stopImmediatePropagation = function () {};

          try { listener.call(this, event); } catch (_) {}

          event.preventDefault          = origPD;
          event.stopPropagation         = origSP;
          event.stopImmediatePropagation = origSIP;
        };
        wrappedListeners.set(listener, wrapped);
      }
      return _origAEL.call(this, type, wrapped, options);
    }

    return _origAEL.call(this, type, listener, options);
  };

  // Keep removeEventListener working with wrapped fns
  EventTarget.prototype.removeEventListener = function (type, listener, options) {
    const wrapped = wrappedListeners.get(listener);
    if (wrapped) return _origREL.call(this, type, wrapped, options);
    return _origREL.call(this, type, listener, options);
  };

  // ─────────────────────────────────────────────
  // INTERCEPT on* PROPERTY SETTERS on prototypes
  // so that pages can't set oncontextmenu = fn
  // ─────────────────────────────────────────────
  function interceptOnProp(proto, prop, group) {
    const original = Object.getOwnPropertyDescriptor(proto, prop);
    const _set = original ? original.set : null;
    const _get = original ? original.get : null;

    const storedHandlers = new WeakMap();

    Object.defineProperty(proto, prop, {
      get: function () {
        if (!state[group]) {
          return _get ? _get.call(this) : storedHandlers.get(this) || null;
        }
        return null;
      },
      set: function (fn) {
        storedHandlers.set(this, fn);
        if (!state[group] && _set) {
          _set.call(this, fn);
        }
        // If feature is enabled, silently drop the assignment
      },
      configurable: true,
    });
  }

  // Patch Document, HTMLElement, Window prototypes
  const TARGETS_PROTOS = [Document.prototype, HTMLElement.prototype, Window.prototype, SVGElement.prototype];

  Object.entries(ON_PROP_MAP).forEach(([prop, group]) => {
    TARGETS_PROTOS.forEach(proto => {
      try { interceptOnProp(proto, prop, group); } catch (_) {}
    });
  });

  // ─────────────────────────────────────────────
  // CSS INJECTION
  // ─────────────────────────────────────────────
  let styleEl = null;

  function buildCSS() {
    const rules = [];

    if (state.selectstart) {
      rules.push(`
        html, body, * {
          user-select: text !important;
          -webkit-user-select: text !important;
          -moz-user-select: text !important;
          -ms-user-select: text !important;
        }
        ::selection {
          background-color: rgba(0, 120, 215, 0.5) !important;
          color: white !important;
        }
      `);
    }

    if (state.cursor) {
      rules.push(`
        html, body, *, ::before, ::after {
          cursor: auto !important;
        }
      `);
    }

    if (state.pointerEvents) {
      rules.push(`
        [class*="overlay"], [id*="overlay"], [class*="modal"], [id*="wall"] {
          pointer-events: none !important;
        }
        /* On restaure les clics sur les boutons qui seraient dans ces overlays */
        [class*="overlay"] button, [class*="modal"] button {
          pointer-events: auto !important;
        }
      `);
    }

    if (state.scroll) {
      rules.push(`
        html[style*="overflow: hidden"],
        body[style*="overflow: hidden"],
        .modal-open, .no-scroll {
		  overflow: auto !important;
		  height: auto !important;
        }
      `);
    }

	if (state.dragdrop) {
      rules.push(`
        [draggable="false"], img, a {
          -webkit-user-drag: auto !important;
          draggable: true !important;
        }
        [draggable]:active {
          cursor: move !important;
        }
      `);
    }
	
	if (state.print) {
      rules.push(`
        @media print {
          html, body, div, section, article, main, header, footer {
            display: block !important;
            visibility: visible !important;
            position: static !important;
            overflow: visible !important;
            height: auto !important;
          }
        }
      `);
    }	

    return rules.join('\n');
  }

  function applyStyles() {
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = '__unlockall_css__';
    }
    styleEl.textContent = buildCSS();

    const root = document.head || document.documentElement;
    if (root && !styleEl.parentNode) {
      root.appendChild(styleEl);
    }
  }

  // ─────────────────────────────────────────────
  // OVERLAY / PAYWALL REMOVAL
  // ─────────────────────────────────────────────
  function removeOverlays() {
  if (!state.overlays) return;

  try {
    const allEls = document.querySelectorAll('div, section, aside');
    allEls.forEach(el => {
      const cs = window.getComputedStyle(el);
      const zi = parseInt(cs.zIndex) || 0;
      
      if ((cs.position === 'fixed' || cs.position === 'absolute') && zi > 1000) {
        const rect = el.getBoundingClientRect();

        if (rect.width > window.innerWidth * 0.9 && rect.height > window.innerHeight * 0.8) {

          if (!el.innerText.includes('Gemini') && !el.querySelector('video')) {
             el.style.setProperty('display', 'none', 'important');
          }
        }
      }
    });
  } catch (_) {}
}

  // ─────────────────────────────────────────────
  // DEVTOOLS BYPASS
  // ─────────────────────────────────────────────
  function setupDevtoolsBypass() {
    if (!state.devtools) return;

    // Blocage du mot-clé debugger via le constructeur de fonction
    try {
      const _Function = window.Function;
      window.Function = function() {
        if (arguments[0] && arguments[0].includes('debugger')) {
          return _Function('');
        }
        return _Function.apply(this, arguments);
      };
    } catch (_) {}

    // Neutralise la détection par redimensionnement (Outer vs Inner)
    try {
      Object.defineProperty(window, 'outerWidth', { get: () => window.innerWidth, configurable: true });
      Object.defineProperty(window, 'outerHeight', { get: () => window.innerHeight, configurable: true });
    } catch (_) {}

    // Empêche le site de mesurer le temps d'exécution (utilisé pour détecter la console)
    try {
      const _now = Date.now;
      Date.now = function() {
        return _now.apply(this, arguments); // On pourrait ajouter un léger décalage si besoin
      };
    } catch (_) {}
  }

  // ─────────────────────────────────────────────
  // CONSOLE PROTECTION
  // ─────────────────────────────────────────────
  function applyConsoleProtection() {
  if (state.consoleProtect) {
    console.clear = function () {
      console.log("UnlockAll: Tentative de nettoyage de la console bloquée.");
    };
  } else {
    console.clear = _origConsoleClear;
  }
}

  // ─────────────────────────────────────────────
  // FOCUS STEAL PREVENTION
  // ─────────────────────────────────────────────
  function applyFocusProtection() {
    if (state.focus) {
      HTMLElement.prototype.focus = function(options) {
        // On ne laisse passer le focus que s'il vient d'un vrai clic utilisateur (isTrusted)
        if (window.event && window.event.isTrusted) {
          return _origFocus.apply(this, arguments);
        }
        // Sinon, on bloque l'appel automatique du script
      };
    } else {
      HTMLElement.prototype.focus = _origFocus;
    }
  }

  // ─────────────────────────────────────────────
  // MUTATION OBSERVER – react to dynamic changes
  // ─────────────────────────────────────────────
  let observer = null;

  function startObserver() {
    if (observer) return;

    observer = new MutationObserver((mutations) => {
      let needsCleaning = false;

      for (const m of mutations) {
        // Si un attribut "on..." est ajouté ou modifié
        if (m.type === 'attributes' && m.attributeName?.startsWith('on')) {
          needsCleaning = true;
          break;
        }
        // Si de nouveaux éléments arrivent dans la page
        if (m.type === 'childList' && m.addedNodes.length > 0) {
          needsCleaning = true;
          if (state.overlays) removeOverlays();
          break;
        }
      }

      if (needsCleaning) {
        // On relance le nettoyage global renforcé
        killCopyBlocking(); 
      }
    });

    const target = document.documentElement || document.body;
    if (target) {
      observer.observe(target, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeOldValue: false,
        characterData: false
      });
    }
  }

  // ─────────────────────────────────────────────
  // ANTI-COPY & HANDLER CLEANER
  // ─────────────────────────────────────────────
  function killCopyBlocking() {
    // On définit les groupes d'options pour savoir quoi débloquer
    const gate = {
      clipboard:   ['copy', 'cut', 'paste'],
      selectstart: ['selectstart', 'mousedown'],
      contextmenu: ['contextmenu']
	  dragdrop:    ['dragstart', 'drag']
    };

    const allEvents = [...gate.clipboard, ...gate.selectstart, ...gate.contextmenu];
    const targets = [document, window, document.body, document.documentElement];

    // 1. Nettoyage des attributs "on..." (ex: <body oncopy="return false">)
    targets.forEach(t => {
      if (!t) return;
      allEvents.forEach(evName => {
        const prop = 'on' + evName;
        try {
          // On vérifie si l'option est activée dans le state avant de supprimer
          const group = Object.keys(gate).find(key => gate[key].includes(evName));
          if (state[group] && t[prop] !== null) {
            t[prop] = null;
            if (t.removeAttribute) t.removeAttribute(prop);
          }
        } catch (_) {}
      });
    });

    // 2. Interception en phase de CAPTURE (true)
    // C'est ici qu'on empêche le site de voir l'événement et d'afficher son alerte
    allEvents.forEach(evName => {
      document.addEventListener(evName, (e) => {
        const group = Object.keys(gate).find(key => gate[key].includes(evName));
        if (state[group]) {
          e.stopPropagation(); 
        }
      }, true); // Le "true" est vital : on attrape l'événement AVANT le site
    });
  }

  // ─────────────────────────────────────────────
  // MAIN APPLY
  // ─────────────────────────────────────────────
  function applyAll() {
    applyStyles();
    killCopyBlocking();
    applyConsoleProtection();
    applyFocusProtection();
    if (state.devtools)  setupDevtoolsBypass();
    if (state.overlays)  removeOverlays();
  }

  // ─────────────────────────────────────────────
  // MESSAGE BUS (from content.js via postMessage)
  // ─────────────────────────────────────────────
  window.addEventListener('message', function (e) {
    if (!e.data || e.data.__unlockall !== 'from_content') return;

    const { action, payload } = e.data;

    switch (action) {
      case 'init':
      case 'update':
        Object.assign(state, payload);
        applyAll();
        break;

      case 'removeOverlays':
        removeOverlays();
        break;

      case 'getState':
        window.postMessage({ __unlockall: 'from_inject', action: 'state', payload: { ...state } }, '*');
        break;
    }
  });

  // ─────────────────────────────────────────────
  // BOOTSTRAP
  // ─────────────────────────────────────────────
  
  // 1. Action immédiate (le plus tôt possible)
  applyStyles();
  applyConsoleProtection();

  // 2. Initialisation quand le DOM commence à être prêt
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      applyAll();
      startObserver();
    }, { once: true });
  } else {
    applyAll();
    startObserver();
  }

  // 3. Sécurité supplémentaire au chargement complet (window.load)
  window.addEventListener('load', () => {
    // Certains sites réactivent les protections ici, on ré-écrase tout
    applyAll();
    
    // Petit délai de grâce de 500ms pour les scripts asynchrones tardifs
    setTimeout(() => {
      killCopyBlocking();
      if (state.overlays) removeOverlays();
    }, 500);
  }, { once: true });

  // 4. Signal prêt pour content.js
  window.postMessage({ __unlockall: 'from_inject', action: 'ready' }, '*');

})();