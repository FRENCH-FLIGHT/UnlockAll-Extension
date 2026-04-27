/**
 * UnlockAll v2.0 – popup.js
 */

// ════════════════════════════════════════════════════════════════
// i18n — Inline translations (FR / EN / ES / DE)
// ════════════════════════════════════════════════════════════════
const I18N = {
  fr: {
    active: 'Actif', inactive: 'Inactif',
    enableAll: 'Tout activer', disableAll: 'Tout désactiver', picker: 'Cibler',
    tabProtections: 'Protections', tabOverlays: 'Overlays', tabScripts: 'Scripts', tabSettings: 'Paramètres',
    groupMouse: 'Souris & Sélection', groupClipboard: 'Presse-papiers & Clavier',
    groupBehavior: 'Comportement de page', groupAdvanced: 'Avancé', groupTools: 'Outils rapides',
    fContextmenu: 'Clic droit', dContextmenu: 'Réactive le menu contextuel natif (oncontextmenu, CSS pointer-events)',
    fSelectstart: 'Sélection de texte', dSelectstart: 'Supprime user-select:none et le blocage selectstart',
    fCursor: 'Curseur de souris', dCursor: 'Force l\'affichage du curseur (cursor:none supprimé)',
    fPointerEvents: 'Pointer events', dPointerEvents: 'Neutralise les overlays CSS bloquant les clics',
    fClipboard: 'Copier / Couper / Coller', dClipboard: 'Ctrl+C, Ctrl+X, Ctrl+V toujours disponibles',
    fKeyboard: 'Raccourcis clavier', dKeyboard: 'Empêche la page de capturer vos raccourcis',
    fFocus: 'Anti-vol de focus', dFocus: 'Bloque focus()/blur() non déclenchés par l\'utilisateur',
    fDragdrop: 'Glisser-déposer', dDragdrop: 'Réactive drag&drop + supprime ondragstart inline',
    fScroll: 'Défilement', dScroll: 'Supprime overflow:hidden et touch-action:none',
    fPrint: 'Impression', dPrint: 'Bypass le blocage de Ctrl+P et beforeprint',
    fVisibility: 'Visibilité d\'onglet', dVisibility: 'Spoofe document.hidden=false en permanence',
    fOverlays: 'Suppression auto overlays', dOverlays: 'Détecte et masque les modales / paywalls auto',
    fDevtools: 'Bypass détection DevTools', dDevtools: 'Anti-debugger, timing, resize, Proxy, Worker',
    fConsole: 'Protection console', dConsole: 'Empêche console.clear() et les getter toString tricks',
    experimental: 'Expérimental',
    toolSource: 'Source', toolCopyUrl: 'Copier URL', toolIncognito: 'Incognito',
    overlayNone: 'Aucun overlay masqué', restoreAll: 'Tout restaurer',
    overlayEmptyMsg: 'Aucun overlay supprimé sur cette page.',
    overlayEmptyHint: 'Activez la suppression auto ou utilisez le bouton Cibler.',
    overlayAuto: 'Auto', overlayManual: 'Manuel',
    newScript: 'Nouveau script',
    scriptEmptyMsg: 'Aucun script personnalisé.',
    scriptEmptyHint: 'Créez des scripts qui s\'exécutent sur chaque page.',
    runStart: 'Au démarrage (document_start)',
    runEnd: 'DOM prêt (document_end)',
    runIdle: 'Chargement complet (document_idle)',
    deleteScript: 'Supprimer', saveScript: 'Enregistrer',
    settingLanguage: 'Langue / Language',
    settingDefaults: 'Paramètres par défaut',
    settingDefaultsDesc: 'Sauvegardez votre configuration actuelle comme point de départ.',
    saveDefaults: 'Sauvegarder comme défaut', loadDefaults: 'Charger mes défauts',
    settingFactory: 'Réinitialisation',
    settingFactoryDesc: 'Restaure tous les paramètres et supprime les scripts personnalisés.',
    factoryReset: 'Restaurer les paramètres usine',
    settingAbout: 'À propos', aboutEngine: 'Moteur', aboutLayers: 'Couches bypass', aboutCompat: 'Compatibilité',
    footerSync: 'Synchronisé entre onglets',
    toastEnabled: '✓ Tout activé !', toastDisabled: 'Tout désactivé', toastSaved: '✓ Sauvegardé',
    toastDefaultsSaved: '✓ Défauts sauvegardés', toastDefaultsLoaded: '✓ Défauts chargés',
    toastFactoryDone: '✓ Paramètres usine restaurés', toastUrlCopied: '✓ URL copiée',
    toastOverlayRestored: '✓ Overlay restauré', toastAllRestored: '✓ Tous restaurés',
    toastScriptSaved: '✓ Script enregistré', toastScriptDeleted: 'Script supprimé',
    toastPicker: '🎯 Cliquez sur un élément…', toastPickerDone: '✓ Élément masqué',
    toastNoDefaults: 'Aucun défaut sauvegardé', toastIncognito: 'Activez le mode incognito dans les paramètres',
    confirmFactoryTitle: 'Réinitialisation', confirmFactoryMsg: 'Supprimer tous les scripts personnalisés et restaurer la configuration usine ?',
    confirmDeleteTitle: 'Supprimer le script', confirmDeleteMsg: 'Cette action est irréversible.',
    confirmYes: 'Confirmer', confirmCancel: 'Annuler',
    overlayX: (n) => `${n} overlay${n>1?'s':''} masqué${n>1?'s':''}`,
    ago: (s) => s < 60 ? `il y a ${s}s` : `il y a ${Math.floor(s/60)}min`,
  },
  en: {
    active: 'Active', inactive: 'Inactive',
    enableAll: 'Enable all', disableAll: 'Disable all', picker: 'Pick',
    tabProtections: 'Protections', tabOverlays: 'Overlays', tabScripts: 'Scripts', tabSettings: 'Settings',
    groupMouse: 'Mouse & Selection', groupClipboard: 'Clipboard & Keyboard',
    groupBehavior: 'Page Behavior', groupAdvanced: 'Advanced', groupTools: 'Quick Tools',
    fContextmenu: 'Right-click', dContextmenu: 'Re-enables native context menu (oncontextmenu, CSS)',
    fSelectstart: 'Text selection', dSelectstart: 'Removes user-select:none and selectstart blocks',
    fCursor: 'Mouse cursor', dCursor: 'Forces cursor display when cursor:none is used',
    fPointerEvents: 'Pointer events', dPointerEvents: 'Neutralizes CSS overlays blocking clicks',
    fClipboard: 'Copy / Cut / Paste', dClipboard: 'Ctrl+C, Ctrl+X, Ctrl+V always available',
    fKeyboard: 'Keyboard shortcuts', dKeyboard: 'Prevents pages from hijacking shortcuts',
    fFocus: 'Anti-focus steal', dFocus: 'Blocks automatic focus()/blur() calls',
    fDragdrop: 'Drag & Drop', dDragdrop: 'Re-enables drag&drop + removes ondragstart inline',
    fScroll: 'Scroll', dScroll: 'Removes overflow:hidden and touch-action:none',
    fPrint: 'Print', dPrint: 'Bypasses Ctrl+P blocking and beforeprint events',
    fVisibility: 'Tab visibility', dVisibility: 'Spoofs document.hidden=false permanently',
    fOverlays: 'Auto overlay removal', dOverlays: 'Detects and hides modals/paywalls automatically',
    fDevtools: 'DevTools detection bypass', dDevtools: 'Anti-debugger, timing, resize, Proxy, Worker',
    fConsole: 'Console protection', dConsole: 'Prevents console.clear() and toString getter tricks',
    experimental: 'Experimental',
    toolSource: 'Source', toolCopyUrl: 'Copy URL', toolIncognito: 'Incognito',
    overlayNone: 'No overlays hidden', restoreAll: 'Restore all',
    overlayEmptyMsg: 'No overlays removed on this page.',
    overlayEmptyHint: 'Enable auto removal or use the Pick button.',
    overlayAuto: 'Auto', overlayManual: 'Manual',
    newScript: 'New script',
    scriptEmptyMsg: 'No custom scripts yet.',
    scriptEmptyHint: 'Create scripts that run on every page.',
    runStart: 'On start (document_start)',
    runEnd: 'DOM ready (document_end)',
    runIdle: 'Fully loaded (document_idle)',
    deleteScript: 'Delete', saveScript: 'Save',
    settingLanguage: 'Language / Langue',
    settingDefaults: 'Default settings',
    settingDefaultsDesc: 'Save your current configuration as the starting point.',
    saveDefaults: 'Save as default', loadDefaults: 'Load my defaults',
    settingFactory: 'Reset',
    settingFactoryDesc: 'Restore all settings and remove custom scripts.',
    factoryReset: 'Restore factory settings',
    settingAbout: 'About', aboutEngine: 'Engine', aboutLayers: 'Bypass layers', aboutCompat: 'Compatibility',
    footerSync: 'Synced across tabs',
    toastEnabled: '✓ All enabled!', toastDisabled: 'All disabled', toastSaved: '✓ Saved',
    toastDefaultsSaved: '✓ Defaults saved', toastDefaultsLoaded: '✓ Defaults loaded',
    toastFactoryDone: '✓ Factory reset done', toastUrlCopied: '✓ URL copied',
    toastOverlayRestored: '✓ Overlay restored', toastAllRestored: '✓ All restored',
    toastScriptSaved: '✓ Script saved', toastScriptDeleted: 'Script deleted',
    toastPicker: '🎯 Click an element…', toastPickerDone: '✓ Element hidden',
    toastNoDefaults: 'No defaults saved yet', toastIncognito: 'Allow incognito in extension settings',
    confirmFactoryTitle: 'Factory Reset', confirmFactoryMsg: 'Delete all custom scripts and restore factory config?',
    confirmDeleteTitle: 'Delete script', confirmDeleteMsg: 'This action is irreversible.',
    confirmYes: 'Confirm', confirmCancel: 'Cancel',
    overlayX: (n) => `${n} overlay${n>1?'s':''} hidden`,
    ago: (s) => s < 60 ? `${s}s ago` : `${Math.floor(s/60)}min ago`,
  },
  es: {
    active: 'Activo', inactive: 'Inactivo',
    enableAll: 'Activar todo', disableAll: 'Desactivar todo', picker: 'Selec.',
    tabProtections: 'Protecciones', tabOverlays: 'Overlays', tabScripts: 'Scripts', tabSettings: 'Ajustes',
    groupMouse: 'Ratón y Selección', groupClipboard: 'Portapapeles y Teclado',
    groupBehavior: 'Comportamiento', groupAdvanced: 'Avanzado', groupTools: 'Herramientas',
    fContextmenu: 'Clic derecho', dContextmenu: 'Reactiva el menú contextual nativo',
    fSelectstart: 'Selección de texto', dSelectstart: 'Elimina user-select:none y bloqueo selectstart',
    fCursor: 'Cursor del ratón', dCursor: 'Fuerza la visibilidad del cursor',
    fPointerEvents: 'Pointer events', dPointerEvents: 'Neutraliza overlays CSS que bloquean clics',
    fClipboard: 'Copiar / Cortar / Pegar', dClipboard: 'Ctrl+C, Ctrl+X, Ctrl+V siempre disponibles',
    fKeyboard: 'Atajos de teclado', dKeyboard: 'Impide que la página capture atajos',
    fFocus: 'Anti-robo de foco', dFocus: 'Bloquea llamadas automáticas a focus()/blur()',
    fDragdrop: 'Arrastrar y soltar', dDragdrop: 'Reactiva drag&drop + elimina ondragstart inline',
    fScroll: 'Desplazamiento', dScroll: 'Elimina overflow:hidden y touch-action:none',
    fPrint: 'Impresión', dPrint: 'Bypass del bloqueo Ctrl+P y beforeprint',
    fVisibility: 'Visibilidad de pestaña', dVisibility: 'document.hidden=false permanentemente',
    fOverlays: 'Eliminar overlays auto', dOverlays: 'Detecta y oculta modales/paywalls automáticamente',
    fDevtools: 'Bypass detección DevTools', dDevtools: 'Anti-debugger, timing, resize, Proxy, Worker',
    fConsole: 'Protección consola', dConsole: 'Evita console.clear() y trucos toString',
    experimental: 'Experimental',
    toolSource: 'Fuente', toolCopyUrl: 'Copiar URL', toolIncognito: 'Incógnito',
    overlayNone: 'Sin overlays ocultos', restoreAll: 'Restaurar todo',
    overlayEmptyMsg: 'No hay overlays eliminados en esta página.',
    overlayEmptyHint: 'Activa la eliminación automática o usa Selec.',
    overlayAuto: 'Auto', overlayManual: 'Manual',
    newScript: 'Nuevo script',
    scriptEmptyMsg: 'Sin scripts personalizados.',
    scriptEmptyHint: 'Crea scripts que se ejecuten en cada página.',
    runStart: 'Al inicio (document_start)',
    runEnd: 'DOM listo (document_end)',
    runIdle: 'Carga completa (document_idle)',
    deleteScript: 'Eliminar', saveScript: 'Guardar',
    settingLanguage: 'Idioma / Language',
    settingDefaults: 'Ajustes por defecto',
    settingDefaultsDesc: 'Guarda la configuración actual como punto de partida.',
    saveDefaults: 'Guardar como defecto', loadDefaults: 'Cargar mis defectos',
    settingFactory: 'Restablecimiento',
    settingFactoryDesc: 'Restaura todos los ajustes y elimina los scripts personalizados.',
    factoryReset: 'Restaurar ajustes de fábrica',
    settingAbout: 'Acerca de', aboutEngine: 'Motor', aboutLayers: 'Capas bypass', aboutCompat: 'Compatibilidad',
    footerSync: 'Sincronizado entre pestañas',
    toastEnabled: '✓ ¡Todo activado!', toastDisabled: 'Todo desactivado', toastSaved: '✓ Guardado',
    toastDefaultsSaved: '✓ Valores por defecto guardados', toastDefaultsLoaded: '✓ Valores cargados',
    toastFactoryDone: '✓ Restablecimiento completado', toastUrlCopied: '✓ URL copiada',
    toastOverlayRestored: '✓ Overlay restaurado', toastAllRestored: '✓ Todo restaurado',
    toastScriptSaved: '✓ Script guardado', toastScriptDeleted: 'Script eliminado',
    toastPicker: '🎯 Haz clic en un elemento…', toastPickerDone: '✓ Elemento oculto',
    toastNoDefaults: 'Sin valores por defecto', toastIncognito: 'Permite incógnito en ajustes',
    confirmFactoryTitle: 'Restablecimiento', confirmFactoryMsg: '¿Eliminar scripts y restaurar fábrica?',
    confirmDeleteTitle: 'Eliminar script', confirmDeleteMsg: 'Esta acción es irreversible.',
    confirmYes: 'Confirmar', confirmCancel: 'Cancelar',
    overlayX: (n) => `${n} overlay${n>1?'s':''} oculto${n>1?'s':''}`,
    ago: (s) => s < 60 ? `hace ${s}s` : `hace ${Math.floor(s/60)}min`,
  },
  de: {
    active: 'Aktiv', inactive: 'Inaktiv',
    enableAll: 'Alle aktivieren', disableAll: 'Alle deaktivieren', picker: 'Auswahl',
    tabProtections: 'Schutz', tabOverlays: 'Overlays', tabScripts: 'Skripte', tabSettings: 'Einstellungen',
    groupMouse: 'Maus & Auswahl', groupClipboard: 'Zwischenablage & Tastatur',
    groupBehavior: 'Seitenverhalten', groupAdvanced: 'Erweitert', groupTools: 'Schnelltools',
    fContextmenu: 'Rechtsklick', dContextmenu: 'Reaktiviert das native Kontextmenü',
    fSelectstart: 'Textauswahl', dSelectstart: 'Entfernt user-select:none und selectstart-Sperren',
    fCursor: 'Mauszeiger', dCursor: 'Erzwingt Anzeige wenn cursor:none gesetzt ist',
    fPointerEvents: 'Zeigerereignisse', dPointerEvents: 'Neutralisiert CSS-Overlays die Klicks blockieren',
    fClipboard: 'Kopieren / Ausschneiden / Einfügen', dClipboard: 'Strg+C, Strg+X, Strg+V immer verfügbar',
    fKeyboard: 'Tastaturkürzel', dKeyboard: 'Verhindert das Abfangen von Kürzeln durch Seiten',
    fFocus: 'Anti-Fokusraub', dFocus: 'Blockiert automatische focus()/blur()-Aufrufe',
    fDragdrop: 'Drag & Drop', dDragdrop: 'Reaktiviert Drag&Drop + entfernt ondragstart inline',
    fScroll: 'Scrollen', dScroll: 'Entfernt overflow:hidden und touch-action:none',
    fPrint: 'Drucken', dPrint: 'Umgeht Strg+P-Sperre und beforeprint-Events',
    fVisibility: 'Tab-Sichtbarkeit', dVisibility: 'document.hidden=false dauerhaft',
    fOverlays: 'Auto-Overlay-Entfernung', dOverlays: 'Erkennt und versteckt Modals/Paywalls automatisch',
    fDevtools: 'DevTools-Erkennung umgehen', dDevtools: 'Anti-Debugger, Timing, Resize, Proxy, Worker',
    fConsole: 'Konsolenschutz', dConsole: 'Verhindert console.clear() und toString-Tricks',
    experimental: 'Experimentell',
    toolSource: 'Quellcode', toolCopyUrl: 'URL kopieren', toolIncognito: 'Privat',
    overlayNone: 'Keine Overlays ausgeblendet', restoreAll: 'Alle wiederherstellen',
    overlayEmptyMsg: 'Keine Overlays auf dieser Seite ausgeblendet.',
    overlayEmptyHint: 'Auto-Entfernung aktivieren oder Auswahl-Button nutzen.',
    overlayAuto: 'Auto', overlayManual: 'Manuell',
    newScript: 'Neues Skript',
    scriptEmptyMsg: 'Keine benutzerdefinierten Skripte.',
    scriptEmptyHint: 'Erstelle Skripte, die auf jeder Seite ausgeführt werden.',
    runStart: 'Beim Start (document_start)',
    runEnd: 'DOM bereit (document_end)',
    runIdle: 'Vollständig geladen (document_idle)',
    deleteScript: 'Löschen', saveScript: 'Speichern',
    settingLanguage: 'Sprache / Language',
    settingDefaults: 'Standardeinstellungen',
    settingDefaultsDesc: 'Aktuelle Konfiguration als Ausgangspunkt speichern.',
    saveDefaults: 'Als Standard speichern', loadDefaults: 'Meine Standards laden',
    settingFactory: 'Zurücksetzen',
    settingFactoryDesc: 'Alle Einstellungen zurücksetzen und benutzerdefinierte Skripte löschen.',
    factoryReset: 'Werkseinstellungen wiederherstellen',
    settingAbout: 'Über', aboutEngine: 'Engine', aboutLayers: 'Bypass-Schichten', aboutCompat: 'Kompatibilität',
    footerSync: 'Tabs synchronisiert',
    toastEnabled: '✓ Alles aktiviert!', toastDisabled: 'Alles deaktiviert', toastSaved: '✓ Gespeichert',
    toastDefaultsSaved: '✓ Standards gespeichert', toastDefaultsLoaded: '✓ Standards geladen',
    toastFactoryDone: '✓ Zurückgesetzt', toastUrlCopied: '✓ URL kopiert',
    toastOverlayRestored: '✓ Overlay wiederhergestellt', toastAllRestored: '✓ Alle wiederhergestellt',
    toastScriptSaved: '✓ Skript gespeichert', toastScriptDeleted: 'Skript gelöscht',
    toastPicker: '🎯 Element anklicken…', toastPickerDone: '✓ Element ausgeblendet',
    toastNoDefaults: 'Noch keine Standards gespeichert', toastIncognito: 'Inkognito in Einstellungen erlauben',
    confirmFactoryTitle: 'Zurücksetzen', confirmFactoryMsg: 'Alle Skripte löschen und Werkseinstellungen wiederherstellen?',
    confirmDeleteTitle: 'Skript löschen', confirmDeleteMsg: 'Diese Aktion ist nicht rückgängig zu machen.',
    confirmYes: 'Bestätigen', confirmCancel: 'Abbrechen',
    overlayX: (n) => `${n} Overlay${n>1?'s':''} ausgeblendet`,
    ago: (s) => s < 60 ? `vor ${s}s` : `vor ${Math.floor(s/60)}min`,
  },
};

// ════════════════════════════════════════════════════════════════
// CONSTANTS
// ════════════════════════════════════════════════════════════════
const VERSION = '2.0.0';

const FEATURE_GROUPS = {
  mouse    : ['contextmenu', 'selectstart', 'cursor', 'pointerEvents'],
  keyboard : ['clipboard', 'keyboard', 'focus'],
  behavior : ['dragdrop', 'scroll', 'print', 'visibility', 'overlays'],
  advanced : ['devtools', 'consoleProtect'],
};

const FACTORY_DEFAULTS = {
  contextmenu: true, selectstart: true, clipboard: true, keyboard: true,
  dragdrop: true, scroll: false, cursor: true, pointerEvents: false,
  print: true, overlays: false, devtools: false, consoleProtect: false,
  focus: false, visibility: true,
};

// ════════════════════════════════════════════════════════════════
// STATE
// ════════════════════════════════════════════════════════════════
let cfg       = { ...FACTORY_DEFAULTS, customScripts: [] };
let lang      = 'fr';
let tabId     = null;
let pickerOn  = false;
let overlayData = [];
let editingScriptId = null;
let toastTimer = null;

// ════════════════════════════════════════════════════════════════
// i18n
// ════════════════════════════════════════════════════════════════
function t(key, ...args) {
  const tr = I18N[lang] || I18N.fr;
  const v  = tr[key] ?? I18N.fr[key] ?? key;
  return typeof v === 'function' ? v(...args) : v;
}

function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    el.textContent = t(key);
  });
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
  // Status text
  const anyOn = Object.keys(FACTORY_DEFAULTS).some(k => cfg[k]);
  const badge = document.getElementById('statusBadge');
  const txt   = badge.querySelector('.status-text');
  const allOn = Object.keys(FACTORY_DEFAULTS).every(k => cfg[k]);
  txt.textContent = anyOn ? (allOn ? t('active') : t('active')) : t('inactive');
  badge.classList.toggle('inactive', !anyOn);
}

// ════════════════════════════════════════════════════════════════
// TOAST
// ════════════════════════════════════════════════════════════════
function toast(msg, type = 'ok', ms = 1800) {
  const el = document.getElementById('toast');
  el.textContent = msg; el.className = `toast ${type} show`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), ms);
}

// ════════════════════════════════════════════════════════════════
// CONFIRM DIALOG
// ════════════════════════════════════════════════════════════════
function confirm(titleKey, msgKey) {
  return new Promise(resolve => {
    const d = document.createElement('div');
    d.className = 'overlay-confirm';
    d.innerHTML = `<div class="confirm-box">
      <div class="confirm-title">${t(titleKey)}</div>
      <div class="confirm-msg">${t(msgKey)}</div>
      <div class="confirm-actions">
        <button class="pill-btn btn-ghost" id="cNo">${t('confirmCancel')}</button>
        <button class="pill-btn btn-red-ghost" id="cYes">${t('confirmYes')}</button>
      </div></div>`;
    document.body.appendChild(d);
    d.querySelector('#cYes').onclick = () => { d.remove(); resolve(true); };
    d.querySelector('#cNo').onclick  = () => { d.remove(); resolve(false); };
  });
}

// ════════════════════════════════════════════════════════════════
// SYNC DOT
// ════════════════════════════════════════════════════════════════
function syncing(on) { document.getElementById('syncDot').classList.toggle('syncing', on); }

// ════════════════════════════════════════════════════════════════
// SEND TO CONTENT SCRIPT
// ════════════════════════════════════════════════════════════════
async function sendToContent(action, extra = {}) {
  if (!tabId) return;
  try { await chrome.tabs.sendMessage(tabId, { action, ...extra }); } catch (_) {}
}

// ════════════════════════════════════════════════════════════════
// APPLY SETTINGS
// ════════════════════════════════════════════════════════════════
async function applySettings(patch) {
  cfg = { ...cfg, ...patch };
  syncing(true);
  await chrome.storage.sync.set({ ...cfg, customScripts: JSON.stringify(cfg.customScripts) });
  await sendToContent('updateSettings', { settings: cfg });
  updateUI();
  setTimeout(() => syncing(false), 500);
}

// ════════════════════════════════════════════════════════════════
// UI UPDATE
// ════════════════════════════════════════════════════════════════
function updateUI() {
  // Toggles
  document.querySelectorAll('input[data-key]').forEach(inp => {
    const k = inp.dataset.key;
    if (k in cfg) inp.checked = cfg[k];
  });

  // Group counters
  const countIds = { mouse: 'cnt-mouse', keyboard: 'cnt-keyboard', behavior: 'cnt-behavior', advanced: 'cnt-advanced' };
  Object.entries(FEATURE_GROUPS).forEach(([g, keys]) => {
    const el = document.getElementById(countIds[g]);
    if (!el) return;
    const active = keys.filter(k => cfg[k]).length;
    el.textContent = `${active}/${keys.length}`;
    el.classList.toggle('all-on', active === keys.length);
  });

  // Status badge
  const anyOn = Object.keys(FACTORY_DEFAULTS).some(k => cfg[k]);
  const badge = document.getElementById('statusBadge');
  badge.classList.toggle('inactive', !anyOn);
  badge.querySelector('.status-text').textContent = anyOn ? t('active') : t('inactive');

  // Script badge
  const sc = cfg.customScripts?.length || 0;
  const sb = document.getElementById('scriptsBadge');
  sb.style.display = sc > 0 ? '' : 'none';
  sb.textContent = sc;

  renderScriptList();
}

// ════════════════════════════════════════════════════════════════
// TABS
// ════════════════════════════════════════════════════════════════
function initTabs() {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab, .panel').forEach(el => el.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(`panel-${tab.dataset.tab}`)?.classList.add('active');
    });
  });
}

// ════════════════════════════════════════════════════════════════
// TOGGLES
// ════════════════════════════════════════════════════════════════
function initToggles() {
  document.querySelectorAll('input[data-key]').forEach(inp => {
    inp.addEventListener('change', () => applySettings({ [inp.dataset.key]: inp.checked }));
  });
}

// ════════════════════════════════════════════════════════════════
// TOOLTIP
// ════════════════════════════════════════════════════════════════
function initTooltips() {
  const tip = document.getElementById('tooltip');
  let hideTimer;

  document.querySelectorAll('.feature-row[data-tooltip]').forEach(row => {
    const key = row.dataset.tooltip;
    const desc = row.querySelector('.feature-desc');

    row.addEventListener('mouseenter', () => {
      clearTimeout(hideTimer);
      const detailed = t('d' + key.charAt(0).toUpperCase() + key.slice(1));
      const basic = desc?.textContent || '';
      if (detailed && detailed !== key && detailed !== basic) {
        tip.textContent = detailed;
        tip.classList.add('show');
      }
    });
    row.addEventListener('mouseleave', () => {
      hideTimer = setTimeout(() => tip.classList.remove('show'), 200);
    });
  });
}

// ════════════════════════════════════════════════════════════════
// QUICK ACTIONS
// ════════════════════════════════════════════════════════════════
function initQuickActions() {
  document.getElementById('btnUnlockAll').addEventListener('click', () => {
    const all = {};
    Object.keys(FACTORY_DEFAULTS).forEach(k => all[k] = true);
    applySettings(all);
    toast(t('toastEnabled'), 'ok');
  });

  document.getElementById('btnLockAll').addEventListener('click', () => {
    const none = {};
    Object.keys(FACTORY_DEFAULTS).forEach(k => none[k] = false);
    applySettings(none);
    toast(t('toastDisabled'), 'info');
  });

  document.getElementById('btnPickOverlay').addEventListener('click', async () => {
    if (pickerOn) return;
    pickerOn = true;
    document.getElementById('btnPickOverlay').classList.add('active-picker');
    toast(t('toastPicker'), 'info', 8000);
    await sendToContent('activatePicker');
  });
}

// ════════════════════════════════════════════════════════════════
// QUICK TOOLS
// ════════════════════════════════════════════════════════════════
function initTools() {
  document.getElementById('btnViewSource').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.url && !tab.url.startsWith('chrome')) chrome.tabs.create({ url: 'view-source:' + tab.url });
    else toast('Non disponible', 'err');
  });

  document.getElementById('btnCopyUrl').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.url) { try { await navigator.clipboard.writeText(tab.url); toast(t('toastUrlCopied')); } catch (_) {} }
  });

  document.getElementById('btnIncognito').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.url) return;
    chrome.windows.create({ url: tab.url, incognito: true }, w => {
      if (chrome.runtime.lastError) toast(t('toastIncognito'), 'err', 3000);
    });
  });
}

// ════════════════════════════════════════════════════════════════
// OVERLAY MANAGER
// ════════════════════════════════════════════════════════════════
function initOverlayPanel() {
  document.getElementById('btnRestoreAll').addEventListener('click', async () => {
    await sendToContent('restoreAllOverlays');
    toast(t('toastAllRestored'));
  });
}

function renderOverlayList(list) {
  overlayData = list;
  const cnt = list.length;
  const badge = document.getElementById('overlayBadge');
  badge.style.display = cnt > 0 ? '' : 'none';
  badge.textContent = cnt;

  const countEl = document.getElementById('overlayCount');
  countEl.textContent = cnt > 0 ? t('overlayX', cnt) : t('overlayNone');

  const restoreBtn = document.getElementById('btnRestoreAll');
  restoreBtn.style.display = cnt > 0 ? '' : 'none';

  const container = document.getElementById('overlayList');
  const empty = document.getElementById('overlayEmpty');

  if (cnt === 0) { empty.style.display = ''; container.innerHTML = ''; container.appendChild(empty); return; }
  empty.style.display = 'none';

  container.innerHTML = '';
  list.forEach(ov => {
    const ago = Math.floor((Date.now() - ov.ts) / 1000);
    const div = document.createElement('div');
    div.className = `overlay-item ${ov.auto ? 'auto-item' : 'manual-item'}`;
    div.innerHTML = `
      <div class="overlay-icon">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" stroke-width="1.5"/>
          <path d="M8 21h8M12 17v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </div>
      <div class="overlay-info">
        <div class="overlay-desc" title="${ov.desc}">${ov.desc}</div>
        <div class="overlay-meta">${ov.auto ? t('overlayAuto') : t('overlayManual')} · ${t('ago', ago)}</div>
      </div>
      <button class="restore-btn" data-id="${ov.id}" title="Restaurer">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
          <path d="M1 4v6h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M3.51 15a9 9 0 1 0 .49-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>`;
    div.querySelector('.restore-btn').addEventListener('click', async (e) => {
      const id = e.currentTarget.dataset.id;
      await sendToContent('restoreOverlay', { id });
      toast(t('toastOverlayRestored'));
    });
    container.appendChild(div);
  });
}

// ════════════════════════════════════════════════════════════════
// SCRIPT EDITOR
// ════════════════════════════════════════════════════════════════
function renderScriptList() {
  const scripts = cfg.customScripts || [];
  const container = document.getElementById('scriptList');
  const empty = document.getElementById('scriptEmpty');

  if (scripts.length === 0) {
    empty.style.display = ''; container.innerHTML = ''; container.appendChild(empty); return;
  }
  empty.style.display = 'none';
  container.innerHTML = '';

  scripts.forEach(sc => {
    const div = document.createElement('div');
    div.className = 'script-item';
    div.innerHTML = `
      <div class="script-icon">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <polyline points="16 18 22 12 16 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <polyline points="8 6 2 12 8 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>
      <div class="script-info">
        <div class="script-name">${escHtml(sc.name || 'Sans nom')}</div>
        <div class="script-meta">${sc.runAt} · ${sc.code.split('\n').length} ligne${sc.code.split('\n').length>1?'s':''}</div>
      </div>
      <label class="toggle script-toggle">
        <input type="checkbox" ${sc.enabled ? 'checked' : ''} data-script-id="${sc.id}"/>
        <span class="slider"></span>
      </label>`;

    // Edit on row click (not on toggle)
    div.addEventListener('click', e => {
      if (e.target.closest('.script-toggle')) return;
      openEditor(sc.id);
    });

    div.querySelector('input[data-script-id]').addEventListener('change', e => {
      const id = e.target.dataset.scriptId;
      const scripts2 = cfg.customScripts.map(s => s.id === id ? { ...s, enabled: e.target.checked } : s);
      applySettings({ customScripts: scripts2 });
    });

    container.appendChild(div);
  });
}

function openEditor(id = null) {
  editingScriptId = id;
  const sc = id ? cfg.customScripts.find(s => s.id === id) : null;

  document.getElementById('editorName').value    = sc?.name    || '';
  document.getElementById('editorCode').value    = sc?.code    || '';
  document.getElementById('editorRunAt').value   = sc?.runAt   || 'document_idle';
  document.getElementById('btnDeleteScript').style.display = id ? '' : 'none';
  document.getElementById('scriptEditor').style.display = '';
  document.getElementById('editorName').focus();
}

function closeEditor() {
  editingScriptId = null;
  document.getElementById('scriptEditor').style.display = 'none';
}

function initScriptEditor() {
  document.getElementById('btnNewScript').addEventListener('click', () => openEditor(null));
  document.getElementById('btnCloseEditor').addEventListener('click', closeEditor);

  document.getElementById('btnSaveScript').addEventListener('click', () => {
    const name  = document.getElementById('editorName').value.trim() || 'Script';
    const code  = document.getElementById('editorCode').value;
    const runAt = document.getElementById('editorRunAt').value;
    if (!code.trim()) { toast('Code vide', 'err'); return; }

    let scripts = [...(cfg.customScripts || [])];
    if (editingScriptId) {
      scripts = scripts.map(s => s.id === editingScriptId ? { ...s, name, code, runAt } : s);
    } else {
      scripts.push({ id: `sc_${Date.now()}`, name, code, runAt, enabled: true });
    }
    applySettings({ customScripts: scripts });
    toast(t('toastScriptSaved'));
    closeEditor();
  });

  document.getElementById('btnDeleteScript').addEventListener('click', async () => {
    const ok = await confirm('confirmDeleteTitle', 'confirmDeleteMsg');
    if (!ok) return;
    const scripts = cfg.customScripts.filter(s => s.id !== editingScriptId);
    applySettings({ customScripts: scripts });
    toast(t('toastScriptDeleted'), 'info');
    closeEditor();
  });

  // Snippet buttons
  document.querySelectorAll('.tip-btn[data-snippet]').forEach(btn => {
    btn.addEventListener('click', () => {
      const ta = document.getElementById('editorCode');
      ta.value = btn.dataset.snippet;
      ta.focus();
    });
  });
}

// ════════════════════════════════════════════════════════════════
// SETTINGS PANEL
// ════════════════════════════════════════════════════════════════
function initSettings() {
  // Language
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      lang = btn.dataset.lang;
      chrome.storage.sync.set({ language: lang });
      applyI18n();
      toast(t('toastSaved'));
    });
  });

  // Save as defaults
  document.getElementById('btnSaveDefaults').addEventListener('click', async () => {
    const snap = {};
    Object.keys(FACTORY_DEFAULTS).forEach(k => snap[k] = cfg[k]);
    await chrome.storage.sync.set({ userDefaults: JSON.stringify(snap) });
    toast(t('toastDefaultsSaved'));
  });

  // Load defaults
  document.getElementById('btnLoadDefaults').addEventListener('click', async () => {
    const stored = await chrome.storage.sync.get({ userDefaults: null });
    if (!stored.userDefaults) { toast(t('toastNoDefaults'), 'info'); return; }
    try {
      const snap = JSON.parse(stored.userDefaults);
      applySettings(snap);
      toast(t('toastDefaultsLoaded'));
    } catch (_) { toast('Erreur', 'err'); }
  });

  // Factory reset
  document.getElementById('btnFactoryReset').addEventListener('click', async () => {
    const ok = await confirm('confirmFactoryTitle', 'confirmFactoryMsg');
    if (!ok) return;
    await chrome.storage.sync.clear();
    await chrome.storage.sync.set({ ...FACTORY_DEFAULTS, customScripts: '[]', language: lang });
    cfg = { ...FACTORY_DEFAULTS, customScripts: [] };
    updateUI();
    await sendToContent('updateSettings', { settings: cfg });
    toast(t('toastFactoryDone'));
  });

  // Version label
  document.getElementById('versionLabel').textContent = `v${VERSION}`;
  document.getElementById('aboutVersion').textContent = VERSION;
}

// ════════════════════════════════════════════════════════════════
// RUNTIME MESSAGES (from content.js / inject.js via background)
// ════════════════════════════════════════════════════════════════
function initRuntimeMessages() {
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === 'overlayList') renderOverlayList(msg.payload || []);
    if (msg.action === 'pickerDone') {
      pickerOn = false;
      document.getElementById('btnPickOverlay').classList.remove('active-picker');
      toast(t('toastPickerDone'));
      // Refresh overlay list
      sendToContent('getState');
    }
  });
}

// ════════════════════════════════════════════════════════════════
// LOAD SETTINGS FROM STORAGE
// ════════════════════════════════════════════════════════════════
async function loadSettings() {
  const stored = await chrome.storage.sync.get({ ...FACTORY_DEFAULTS, customScripts: '[]', language: 'fr' });
  lang = stored.language || 'fr';
  let scripts = [];
  try { scripts = JSON.parse(stored.customScripts || '[]'); } catch (_) {}
  cfg = { ...FACTORY_DEFAULTS, ...stored, customScripts: scripts };
  applyI18n();
  updateUI();
  // Ask inject.js for current overlay list
  await sendToContent('getState');
}

// ════════════════════════════════════════════════════════════════
// UTILS
// ════════════════════════════════════════════════════════════════
function escHtml(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

// ════════════════════════════════════════════════════════════════
// INIT
// ════════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  tabId = tab?.id;

  initTabs();
  initToggles();
  initQuickActions();
  initTools();
  initOverlayPanel();
  initScriptEditor();
  initSettings();
  initTooltips();
  initRuntimeMessages();
  await loadSettings();

  // Storage changes from other windows
  chrome.storage.onChanged.addListener(changes => {
    let updated = false;
    Object.entries(changes).forEach(([k, { newValue }]) => {
      if (k === 'customScripts') { try { cfg.customScripts = JSON.parse(newValue || '[]'); updated = true; } catch (_) {} }
      else if (k === 'language') { lang = newValue; applyI18n(); }
      else if (k in FACTORY_DEFAULTS) { cfg[k] = newValue; updated = true; }
    });
    if (updated) updateUI();
  });
});
