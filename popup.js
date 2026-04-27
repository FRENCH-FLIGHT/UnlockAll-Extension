/**
 * UnlockAll v2.1 – popup.js
 * Cookie manager · Cancel picker · Live script list · Light/dark mode · i18n
 */

// ════════════════════════════════════════════════════════════════
// i18n
// ════════════════════════════════════════════════════════════════
const I18N = {
  fr:{
    active:'Actif',inactive:'Inactif',
    enableAll:'Tout activer',disableAll:'Tout désactiver',picker:'Cibler',cancelPicker:'Annuler ciblage',
    tabProtections:'Protections',tabOverlays:'Overlays',tabCookies:'Cookies',tabScripts:'Scripts',tabSettings:'Paramètres',
    groupMouse:'Souris & Sélection',groupClipboard:'Copier-coller & Clavier',groupBehavior:'Comportement de page',groupAdvanced:'Avancé',groupTools:'Outils rapides',
    fContextmenu:'Clic droit',dContextmenu:'Réactive le menu qui apparaît avec un clic droit sur la page',
    fSelectstart:'Sélection de texte',dSelectstart:'Permet de surligner et copier du texte sur les sites qui le bloquent',
    fCursor:'Curseur de souris',dCursor:"Force l'affichage du curseur quand un site le cache intentionnellement",
    fPointerEvents:'Clics sur les overlays',dPointerEvents:'Rend cliquable le contenu caché sous les fenêtres popup bloquantes',
    fClipboard:'Copier / Couper / Coller',dClipboard:'Autorise Ctrl+C, Ctrl+X, Ctrl+V sur les sites qui les désactivent',
    fKeyboard:'Raccourcis clavier',dKeyboard:'Empêche le site de bloquer vos raccourcis habituels (Ctrl+A, F5…)',
    fFocus:'Anti-vol de focus',dFocus:'Empêche le site de déplacer automatiquement votre curseur ou changer d\'onglet',
    fDragdrop:'Glisser-déposer',dDragdrop:'Rétablit le glisser-déposer d\'images, fichiers et liens sur toute la page',
    fScroll:'Défilement de page',dScroll:'Débloque le scroll quand un site fixe la page pour forcer la lecture d\'une pub',
    fPrint:'Impression',dPrint:'Permet d\'imprimer ou sauvegarder en PDF les pages qui l\'interdisent',
    fVisibility:'Toujours visible',dVisibility:'Fait croire au site que vous êtes toujours sur cet onglet, même si vous en changez',
    fOverlays:'Masquage auto des popups',dOverlays:'Détecte et masque automatiquement les grandes fenêtres bloquantes (paywall, abonnement…)',
    fDevtools:'Masquer les outils développeur',dDevtools:'Empêche le site de détecter que vous avez ouvert les outils développeur (F12)',
    fConsole:'Protéger la console',dConsole:'Empêche le site d\'effacer les messages dans la console développeur',
    experimental:'Expérimental',
    toolSource:'Code source',toolCopyUrl:'Copier URL',toolIncognito:'Incognito',
    overlayNone:'Aucun overlay masqué',restoreAll:'Tout restaurer',
    overlayEmptyMsg:'Aucun overlay supprimé sur cette page.',overlayEmptyHint:'Activez la suppression auto ou utilisez le bouton Cibler.',
    overlayAuto:'Auto',overlayManual:'Manuel',
    addCookie:'Ajouter',refresh:'Actualiser',cookieSearchPlaceholder:'Filtrer les cookies…',
    cookieEmptyMsg:'Aucun cookie trouvé pour ce site.',
    cookieName:'Nom',cookieValue:'Valeur',cookieDomain:'Domaine',cookiePath:'Chemin',cookieExpiry:'Expiration (vide = session)',
    cookieSecure:'Secure',cookieHttpOnly:'HttpOnly (lecture seule)',cookieSession:'Session uniquement',
    deleteCookie:'Supprimer le cookie',saveCookie:'Enregistrer',
    newCookieTitle:'Nouveau cookie',editCookieTitle:'Modifier le cookie',
    newScript:'Nouveau script',
    scriptEmptyMsg:'Aucun script personnalisé.',scriptEmptyHint:'Créez des scripts JavaScript qui s\'exécutent automatiquement sur chaque page.',
    runAtLabel:'Moment d\'exécution :',
    runStart:'Au démarrage — avant le contenu de la page',runEnd:'Quand la page est structurée (DOM prêt)',runIdle:'Quand tout est chargé (images, scripts…)',
    deleteScript:'Supprimer',saveScript:'Enregistrer',
    settingLanguage:'Langue / Language',settingTheme:'Apparence',themeDark:'Sombre',themeLight:'Clair',
    settingDefaults:'Paramètres par défaut',settingDefaultsDesc:'Sauvegardez votre configuration actuelle pour la réappliquer facilement sur n\'importe quel onglet.',
    saveDefaults:'Sauvegarder comme défaut',loadDefaults:'Charger mes défauts',
    settingFactory:'Réinitialisation',settingFactoryDesc:'Remet tout à zéro : supprime vos scripts personnalisés et remet les réglages d\'origine.',
    factoryReset:'Restaurer les paramètres usine',settingAbout:'À propos',aboutEngine:'Moteur',aboutCompat:'Compatibilité',
    footerSync:'Synchronisé entre les onglets',
    toastEnabled:'✓ Tout activé !',toastDisabled:'Tout désactivé',toastSaved:'✓ Sauvegardé',
    toastDefaultsSaved:'✓ Défauts sauvegardés',toastDefaultsLoaded:'✓ Défauts chargés',
    toastFactoryDone:'✓ Paramètres usine restaurés',toastUrlCopied:'✓ URL copiée',
    toastOverlayRestored:'✓ Overlay restauré',toastAllRestored:'✓ Tous restaurés',
    toastScriptSaved:'✓ Script enregistré',toastScriptDeleted:'Script supprimé',
    toastPicker:'🎯 Cliquez sur l\'élément à masquer…',toastPickerDone:'✓ Élément masqué',toastPickerCancelled:'Ciblage annulé',
    toastNoDefaults:'Aucun défaut sauvegardé',toastIncognito:'Activez le mode incognito dans les paramètres de l\'extension',
    toastCookieSaved:'✓ Cookie enregistré',toastCookieDeleted:'Cookie supprimé',toastCookieError:'Erreur lors de l\'enregistrement',
    confirmFactoryTitle:'Réinitialisation',confirmFactoryMsg:'Supprimer tous les scripts et restaurer la configuration usine ?',
    confirmDeleteTitle:'Supprimer le script',confirmDeleteMsg:'Cette action est irréversible.',
    confirmDeleteCookieTitle:'Supprimer le cookie',confirmDeleteCookieMsg:'Supprimer définitivement ce cookie ?',
    confirmYes:'Confirmer',confirmCancel:'Annuler',
    overlayX:(n)=>`${n} overlay${n>1?'s':''} masqué${n>1?'s':''}`,
    cookieCount:(n)=>`${n} cookie${n>1?'s':''}`,
    ago:(s)=>s<60?`il y a ${s}s`:`il y a ${Math.floor(s/60)}min`,
  },
  en:{
    active:'Active',inactive:'Inactive',
    enableAll:'Enable all',disableAll:'Disable all',picker:'Pick',cancelPicker:'Cancel pick',
    tabProtections:'Protections',tabOverlays:'Overlays',tabCookies:'Cookies',tabScripts:'Scripts',tabSettings:'Settings',
    groupMouse:'Mouse & Selection',groupClipboard:'Clipboard & Keyboard',groupBehavior:'Page Behavior',groupAdvanced:'Advanced',groupTools:'Quick Tools',
    fContextmenu:'Right-click',dContextmenu:'Re-enables the native context menu on pages that block it',
    fSelectstart:'Text selection',dSelectstart:'Allows highlighting and copying text on sites that block it',
    fCursor:'Mouse cursor',dCursor:'Forces cursor display when a site intentionally hides it',
    fPointerEvents:'Click-through overlays',dPointerEvents:'Makes content clickable under blocking popup windows',
    fClipboard:'Copy / Cut / Paste',dClipboard:'Enables Ctrl+C, Ctrl+X, Ctrl+V on sites that disable them',
    fKeyboard:'Keyboard shortcuts',dKeyboard:'Prevents sites from blocking your usual shortcuts (Ctrl+A, F5…)',
    fFocus:'Anti-focus steal',dFocus:'Prevents sites from automatically moving your cursor or switching tabs',
    fDragdrop:'Drag & Drop',dDragdrop:'Restores drag and drop of images, files and links on all pages',
    fScroll:'Page scrolling',dScroll:'Unblocks scroll when a site freezes the page to force reading an ad',
    fPrint:'Print',dPrint:'Allows printing or saving as PDF on pages that forbid it',
    fVisibility:'Always visible',dVisibility:'Makes the site think you\'re always on this tab, even when you switch',
    fOverlays:'Auto popup removal',dOverlays:'Automatically detects and hides large blocking windows (paywall, subscription…)',
    fDevtools:'Hide developer tools',dDevtools:'Prevents the site from detecting you\'ve opened developer tools (F12)',
    fConsole:'Protect console',dConsole:'Prevents the site from clearing developer console messages',
    experimental:'Experimental',
    toolSource:'Source code',toolCopyUrl:'Copy URL',toolIncognito:'Incognito',
    overlayNone:'No overlays hidden',restoreAll:'Restore all',
    overlayEmptyMsg:'No overlays removed on this page.',overlayEmptyHint:'Enable auto removal or use the Pick button.',
    overlayAuto:'Auto',overlayManual:'Manual',
    addCookie:'Add',refresh:'Refresh',cookieSearchPlaceholder:'Filter cookies…',
    cookieEmptyMsg:'No cookies found for this site.',
    cookieName:'Name',cookieValue:'Value',cookieDomain:'Domain',cookiePath:'Path',cookieExpiry:'Expiry (empty = session)',
    cookieSecure:'Secure',cookieHttpOnly:'HttpOnly (read-only)',cookieSession:'Session only',
    deleteCookie:'Delete cookie',saveCookie:'Save',
    newCookieTitle:'New cookie',editCookieTitle:'Edit cookie',
    newScript:'New script',
    scriptEmptyMsg:'No custom scripts yet.',scriptEmptyHint:'Create JavaScript scripts that run automatically on every page.',
    runAtLabel:'Execution timing:',
    runStart:'On start — before page content loads',runEnd:'When page is structured (DOM ready)',runIdle:'When everything is loaded (images, scripts…)',
    deleteScript:'Delete',saveScript:'Save',
    settingLanguage:'Language / Langue',settingTheme:'Appearance',themeDark:'Dark',themeLight:'Light',
    settingDefaults:'Default settings',settingDefaultsDesc:'Save your current configuration to easily re-apply it on any tab.',
    saveDefaults:'Save as default',loadDefaults:'Load my defaults',
    settingFactory:'Reset',settingFactoryDesc:'Reset everything: removes custom scripts and restores original settings.',
    factoryReset:'Restore factory settings',settingAbout:'About',aboutEngine:'Engine',aboutCompat:'Compatibility',
    footerSync:'Synced across tabs',
    toastEnabled:'✓ All enabled!',toastDisabled:'All disabled',toastSaved:'✓ Saved',
    toastDefaultsSaved:'✓ Defaults saved',toastDefaultsLoaded:'✓ Defaults loaded',
    toastFactoryDone:'✓ Factory reset done',toastUrlCopied:'✓ URL copied',
    toastOverlayRestored:'✓ Overlay restored',toastAllRestored:'✓ All restored',
    toastScriptSaved:'✓ Script saved',toastScriptDeleted:'Script deleted',
    toastPicker:'🎯 Click an element to hide…',toastPickerDone:'✓ Element hidden',toastPickerCancelled:'Pick cancelled',
    toastNoDefaults:'No defaults saved yet',toastIncognito:'Allow incognito in extension settings',
    toastCookieSaved:'✓ Cookie saved',toastCookieDeleted:'Cookie deleted',toastCookieError:'Save error',
    confirmFactoryTitle:'Factory Reset',confirmFactoryMsg:'Delete all scripts and restore factory config?',
    confirmDeleteTitle:'Delete script',confirmDeleteMsg:'This action is irreversible.',
    confirmDeleteCookieTitle:'Delete cookie',confirmDeleteCookieMsg:'Permanently delete this cookie?',
    confirmYes:'Confirm',confirmCancel:'Cancel',
    overlayX:(n)=>`${n} overlay${n>1?'s':''} hidden`,
    cookieCount:(n)=>`${n} cookie${n>1?'s':''}`,
    ago:(s)=>s<60?`${s}s ago`:`${Math.floor(s/60)}min ago`,
  },
  es:{
    active:'Activo',inactive:'Inactivo',
    enableAll:'Activar todo',disableAll:'Desactivar todo',picker:'Selec.',cancelPicker:'Cancelar selec.',
    tabProtections:'Protecciones',tabOverlays:'Overlays',tabCookies:'Cookies',tabScripts:'Scripts',tabSettings:'Ajustes',
    groupMouse:'Ratón y Selección',groupClipboard:'Portapapeles y Teclado',groupBehavior:'Comportamiento',groupAdvanced:'Avanzado',groupTools:'Herramientas',
    fContextmenu:'Clic derecho',dContextmenu:'Reactiva el menú contextual nativo en páginas que lo bloquean',
    fSelectstart:'Selección de texto',dSelectstart:'Permite resaltar y copiar texto en sitios que lo bloquean',
    fCursor:'Cursor del ratón',dCursor:'Fuerza la visibilidad del cursor cuando el sitio lo oculta',
    fPointerEvents:'Clics en overlays',dPointerEvents:'Hace clicable el contenido bajo ventanas popup bloqueantes',
    fClipboard:'Copiar / Cortar / Pegar',dClipboard:'Activa Ctrl+C, Ctrl+X, Ctrl+V en sitios que los deshabilitan',
    fKeyboard:'Atajos de teclado',dKeyboard:'Evita que el sitio bloquee tus atajos habituales',
    fFocus:'Anti-robo de foco',dFocus:'Evita que el sitio mueva automáticamente tu cursor o cambie de pestaña',
    fDragdrop:'Arrastrar y soltar',dDragdrop:'Restaura el drag&drop de imágenes, archivos y enlaces',
    fScroll:'Desplazamiento',dScroll:'Desbloquea el scroll cuando un sitio congela la página para mostrar anuncios',
    fPrint:'Impresión',dPrint:'Permite imprimir o guardar como PDF páginas que lo prohíben',
    fVisibility:'Siempre visible',dVisibility:'Hace creer al sitio que siempre estás en esta pestaña',
    fOverlays:'Eliminar popups auto',dOverlays:'Detecta y oculta automáticamente ventanas bloqueantes (paywall, suscripción…)',
    fDevtools:'Ocultar herramientas dev',dDevtools:'Evita que el sitio detecte que tienes las herramientas de desarrollo abiertas',
    fConsole:'Proteger consola',dConsole:'Evita que el sitio borre los mensajes de la consola',
    experimental:'Experimental',
    toolSource:'Código fuente',toolCopyUrl:'Copiar URL',toolIncognito:'Incógnito',
    overlayNone:'Sin overlays ocultos',restoreAll:'Restaurar todo',
    overlayEmptyMsg:'No hay overlays eliminados en esta página.',overlayEmptyHint:'Activa la eliminación automática o usa Selec.',
    overlayAuto:'Auto',overlayManual:'Manual',
    addCookie:'Añadir',refresh:'Actualizar',cookieSearchPlaceholder:'Filtrar cookies…',
    cookieEmptyMsg:'No se encontraron cookies para este sitio.',
    cookieName:'Nombre',cookieValue:'Valor',cookieDomain:'Dominio',cookiePath:'Ruta',cookieExpiry:'Vencimiento (vacío = sesión)',
    cookieSecure:'Secure',cookieHttpOnly:'HttpOnly (solo lectura)',cookieSession:'Solo sesión',
    deleteCookie:'Eliminar cookie',saveCookie:'Guardar',newCookieTitle:'Nueva cookie',editCookieTitle:'Editar cookie',
    newScript:'Nuevo script',scriptEmptyMsg:'Sin scripts personalizados.',scriptEmptyHint:'Crea scripts JavaScript que se ejecuten automáticamente en cada página.',
    runAtLabel:'Momento de ejecución:',runStart:'Al inicio — antes del contenido',runEnd:'DOM listo',runIdle:'Carga completa',
    deleteScript:'Eliminar',saveScript:'Guardar',
    settingLanguage:'Idioma / Language',settingTheme:'Apariencia',themeDark:'Oscuro',themeLight:'Claro',
    settingDefaults:'Ajustes por defecto',settingDefaultsDesc:'Guarda la configuración actual para reaplicarla fácilmente.',
    saveDefaults:'Guardar como defecto',loadDefaults:'Cargar mis valores',
    settingFactory:'Restablecimiento',settingFactoryDesc:'Reinicia todo: elimina scripts y restaura ajustes originales.',
    factoryReset:'Restaurar ajustes de fábrica',settingAbout:'Acerca de',aboutEngine:'Motor',aboutCompat:'Compatibilidad',
    footerSync:'Sincronizado entre pestañas',
    toastEnabled:'✓ ¡Todo activado!',toastDisabled:'Todo desactivado',toastSaved:'✓ Guardado',
    toastDefaultsSaved:'✓ Valores guardados',toastDefaultsLoaded:'✓ Valores cargados',
    toastFactoryDone:'✓ Restablecido',toastUrlCopied:'✓ URL copiada',
    toastOverlayRestored:'✓ Overlay restaurado',toastAllRestored:'✓ Todo restaurado',
    toastScriptSaved:'✓ Script guardado',toastScriptDeleted:'Script eliminado',
    toastPicker:'🎯 Haz clic en un elemento…',toastPickerDone:'✓ Elemento oculto',toastPickerCancelled:'Selección cancelada',
    toastNoDefaults:'Sin valores por defecto',toastIncognito:'Permite incógnito en ajustes de extensión',
    toastCookieSaved:'✓ Cookie guardada',toastCookieDeleted:'Cookie eliminada',toastCookieError:'Error al guardar',
    confirmFactoryTitle:'Restablecimiento',confirmFactoryMsg:'¿Eliminar scripts y restaurar ajustes de fábrica?',
    confirmDeleteTitle:'Eliminar script',confirmDeleteMsg:'Esta acción es irreversible.',
    confirmDeleteCookieTitle:'Eliminar cookie',confirmDeleteCookieMsg:'¿Eliminar definitivamente esta cookie?',
    confirmYes:'Confirmar',confirmCancel:'Cancelar',
    overlayX:(n)=>`${n} overlay${n>1?'s':''} oculto${n>1?'s':''}`,
    cookieCount:(n)=>`${n} cookie${n>1?'s':''}`,
    ago:(s)=>s<60?`hace ${s}s`:`hace ${Math.floor(s/60)}min`,
  },
  de:{
    active:'Aktiv',inactive:'Inaktiv',
    enableAll:'Alle aktivieren',disableAll:'Alle deaktivieren',picker:'Auswahl',cancelPicker:'Abbrechen',
    tabProtections:'Schutz',tabOverlays:'Overlays',tabCookies:'Cookies',tabScripts:'Skripte',tabSettings:'Einstellungen',
    groupMouse:'Maus & Auswahl',groupClipboard:'Zwischenablage & Tastatur',groupBehavior:'Seitenverhalten',groupAdvanced:'Erweitert',groupTools:'Schnelltools',
    fContextmenu:'Rechtsklick',dContextmenu:'Reaktiviert das native Kontextmenü auf blockierenden Seiten',
    fSelectstart:'Textauswahl',dSelectstart:'Ermöglicht das Markieren und Kopieren von Text auf blockierenden Seiten',
    fCursor:'Mauszeiger',dCursor:'Erzwingt die Anzeige des Mauszeigers wenn er ausgeblendet ist',
    fPointerEvents:'Klicks auf Overlays',dPointerEvents:'Macht Inhalte unter blockierenden Popup-Fenstern anklickbar',
    fClipboard:'Kopieren / Ausschneiden / Einfügen',dClipboard:'Aktiviert Strg+C, Strg+X, Strg+V auf blockierenden Seiten',
    fKeyboard:'Tastaturkürzel',dKeyboard:'Verhindert das Abfangen von Kürzeln durch Seiten',
    fFocus:'Anti-Fokusraub',dFocus:'Verhindert automatische Fokusumlenkungen durch die Seite',
    fDragdrop:'Drag & Drop',dDragdrop:'Stellt Drag&Drop für Bilder, Dateien und Links wieder her',
    fScroll:'Scrollen',dScroll:'Entsperrt Scrollen wenn eine Seite es blockiert',
    fPrint:'Drucken',dPrint:'Ermöglicht Drucken oder PDF-Speicherung auf blockierenden Seiten',
    fVisibility:'Immer sichtbar',dVisibility:'Lässt die Seite glauben, Sie seien immer auf diesem Tab',
    fOverlays:'Auto-Overlay-Entfernung',dOverlays:'Erkennt und versteckt automatisch große blockierende Fenster',
    fDevtools:'DevTools-Erkennung umgehen',dDevtools:'Verhindert, dass die Seite erkennt, dass DevTools geöffnet sind',
    fConsole:'Konsolenschutz',dConsole:'Verhindert, dass die Seite Konsolenmeldungen löscht',
    experimental:'Experimentell',
    toolSource:'Quellcode',toolCopyUrl:'URL kopieren',toolIncognito:'Privat',
    overlayNone:'Keine Overlays ausgeblendet',restoreAll:'Alle wiederherstellen',
    overlayEmptyMsg:'Keine Overlays auf dieser Seite ausgeblendet.',overlayEmptyHint:'Auto-Entfernung aktivieren oder Auswahl-Button nutzen.',
    overlayAuto:'Auto',overlayManual:'Manuell',
    addCookie:'Hinzufügen',refresh:'Aktualisieren',cookieSearchPlaceholder:'Cookies filtern…',
    cookieEmptyMsg:'Keine Cookies für diese Seite gefunden.',
    cookieName:'Name',cookieValue:'Wert',cookieDomain:'Domain',cookiePath:'Pfad',cookieExpiry:'Ablauf (leer = Sitzung)',
    cookieSecure:'Secure',cookieHttpOnly:'HttpOnly (nur lesen)',cookieSession:'Nur Sitzung',
    deleteCookie:'Cookie löschen',saveCookie:'Speichern',newCookieTitle:'Neuer Cookie',editCookieTitle:'Cookie bearbeiten',
    newScript:'Neues Skript',scriptEmptyMsg:'Keine benutzerdefinierten Skripte.',scriptEmptyHint:'Erstelle Skripte, die automatisch auf jeder Seite ausgeführt werden.',
    runAtLabel:'Ausführungszeitpunkt:',runStart:'Beim Start — vor dem Seiteninhalt',runEnd:'DOM bereit',runIdle:'Vollständig geladen',
    deleteScript:'Löschen',saveScript:'Speichern',
    settingLanguage:'Sprache / Language',settingTheme:'Erscheinungsbild',themeDark:'Dunkel',themeLight:'Hell',
    settingDefaults:'Standardeinstellungen',settingDefaultsDesc:'Aktuelle Konfiguration speichern um sie einfach wiederherzustellen.',
    saveDefaults:'Als Standard speichern',loadDefaults:'Meine Standards laden',
    settingFactory:'Zurücksetzen',settingFactoryDesc:'Alles zurücksetzen: löscht Skripte und stellt Originaleinstellungen wieder her.',
    factoryReset:'Werkseinstellungen',settingAbout:'Über',aboutEngine:'Engine',aboutCompat:'Kompatibilität',
    footerSync:'Tabs synchronisiert',
    toastEnabled:'✓ Alles aktiviert!',toastDisabled:'Alles deaktiviert',toastSaved:'✓ Gespeichert',
    toastDefaultsSaved:'✓ Standards gespeichert',toastDefaultsLoaded:'✓ Standards geladen',
    toastFactoryDone:'✓ Zurückgesetzt',toastUrlCopied:'✓ URL kopiert',
    toastOverlayRestored:'✓ Overlay wiederhergestellt',toastAllRestored:'✓ Alle wiederhergestellt',
    toastScriptSaved:'✓ Skript gespeichert',toastScriptDeleted:'Skript gelöscht',
    toastPicker:'🎯 Element anklicken…',toastPickerDone:'✓ Element ausgeblendet',toastPickerCancelled:'Auswahl abgebrochen',
    toastNoDefaults:'Noch keine Standards gespeichert',toastIncognito:'Inkognito in Erweiterungseinstellungen erlauben',
    toastCookieSaved:'✓ Cookie gespeichert',toastCookieDeleted:'Cookie gelöscht',toastCookieError:'Speicherfehler',
    confirmFactoryTitle:'Zurücksetzen',confirmFactoryMsg:'Alle Skripte löschen und Werkseinstellungen wiederherstellen?',
    confirmDeleteTitle:'Skript löschen',confirmDeleteMsg:'Diese Aktion ist nicht rückgängig zu machen.',
    confirmDeleteCookieTitle:'Cookie löschen',confirmDeleteCookieMsg:'Diesen Cookie dauerhaft löschen?',
    confirmYes:'Bestätigen',confirmCancel:'Abbrechen',
    overlayX:(n)=>`${n} Overlay${n>1?'s':''} ausgeblendet`,
    cookieCount:(n)=>`${n} Cookie${n>1?'s':''}`,
    ago:(s)=>s<60?`vor ${s}s`:`vor ${Math.floor(s/60)}min`,
  },
};

// ════════════════════════════════════════════════════════════════
// CONSTANTS
// ════════════════════════════════════════════════════════════════
const VERSION = '2.1.0';

const FEATURE_GROUPS = {
  mouse    : ['contextmenu','selectstart','cursor','pointerEvents'],
  keyboard : ['clipboard','keyboard','focus'],
  behavior : ['dragdrop','scroll','print','visibility','overlays'],
  advanced : ['devtools','consoleProtect'],
};

const FACTORY_DEFAULTS = {
  contextmenu:true, selectstart:true, clipboard:true, keyboard:true,
  dragdrop:true, scroll:false, cursor:true, pointerEvents:false,
  print:true, overlays:false, devtools:false, consoleProtect:false,
  focus:false, visibility:true,
};

// ════════════════════════════════════════════════════════════════
// STATE
// ════════════════════════════════════════════════════════════════
let cfg = { ...FACTORY_DEFAULTS, customScripts:[] };
let lang = 'fr';
let theme = 'dark';
let tabId = null;
let tabUrl = '';
let pickerOn = false;
let overlayData = [];
let allCookies = [];
let editingScriptId = null;
let editingCookieName = null;
let toastTimer = null;

// ════════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════════
function t(key,...args){ const tr=I18N[lang]||I18N.fr; const v=tr[key]??I18N.fr[key]??key; return typeof v==='function'?v(...args):v; }
function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

function applyI18n(){
  document.querySelectorAll('[data-i18n]').forEach(el=>{ el.textContent=t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{ el.placeholder=t(el.dataset.i18nPlaceholder); });
  document.querySelectorAll('.lang-btn').forEach(b=>b.classList.toggle('active',b.dataset.lang===lang));
  document.querySelectorAll('.theme-pick').forEach(b=>b.classList.toggle('active',b.dataset.theme===theme));
  document.getElementById('iconMoon').style.display = theme==='dark'?'':'none';
  document.getElementById('iconSun').style.display  = theme==='light'?'':'none';
  // Update picker button text
  updatePickerBtn();
}

function syncing(on){ document.getElementById('syncDot').classList.toggle('syncing',on); }

function toast(msg,type='ok',ms=1900){
  const el=document.getElementById('toast');
  el.textContent=msg; el.className=`toast ${type} show`;
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>el.classList.remove('show'),ms);
}

// ════════════════════════════════════════════════════════════════
// CONFIRM MODAL
// ════════════════════════════════════════════════════════════════
function showConfirm(titleKey,msgKey){
  return new Promise(resolve=>{
    document.getElementById('confirmTitle').textContent=t(titleKey);
    document.getElementById('confirmMsg').textContent=t(msgKey);
    document.getElementById('confirmYes').textContent=t('confirmYes');
    document.getElementById('confirmNo').textContent=t('confirmCancel');
    const bd=document.getElementById('modalBackdrop');
    bd.style.display='flex';
    const yes=document.getElementById('confirmYes');
    const no=document.getElementById('confirmNo');
    const cleanup=ok=>{ bd.style.display='none'; resolve(ok); };
    yes.onclick=()=>cleanup(true);
    no.onclick=()=>cleanup(false);
  });
}

// ════════════════════════════════════════════════════════════════
// SEND TO CONTENT
// ════════════════════════════════════════════════════════════════
async function send(action,extra={}){
  if(!tabId) return;
  try{ await chrome.tabs.sendMessage(tabId,{action,...extra}); }catch(_){}
}

// ════════════════════════════════════════════════════════════════
// APPLY SETTINGS
// ════════════════════════════════════════════════════════════════
async function applySettings(patch){
  cfg={...cfg,...patch};
  syncing(true);
  await chrome.storage.sync.set({...cfg,customScripts:JSON.stringify(cfg.customScripts)});
  await send('updateSettings',{settings:cfg});
  updateUI();
  setTimeout(()=>syncing(false),500);
}

// ════════════════════════════════════════════════════════════════
// UI UPDATE
// ════════════════════════════════════════════════════════════════
function updateUI(){
  // Toggles
  document.querySelectorAll('input[data-key]').forEach(inp=>{
    if(inp.dataset.key in cfg) inp.checked=cfg[inp.dataset.key];
  });
  // Group counters
  const ids={mouse:'cnt-mouse',keyboard:'cnt-keyboard',behavior:'cnt-behavior',advanced:'cnt-advanced'};
  Object.entries(FEATURE_GROUPS).forEach(([g,keys])=>{
    const el=document.getElementById(ids[g]);
    if(!el) return;
    const active=keys.filter(k=>cfg[k]).length;
    el.textContent=`${active}/${keys.length}`;
    el.classList.toggle('all-on',active===keys.length);
  });
  // Status badge
  const anyOn=Object.keys(FACTORY_DEFAULTS).some(k=>cfg[k]);
  const badge=document.getElementById('statusBadge');
  badge.classList.toggle('inactive',!anyOn);
  badge.querySelector('.status-text').textContent=anyOn?t('active'):t('inactive');
  // Script badge
  const sc=cfg.customScripts?.length||0;
  const sb=document.getElementById('scriptsBadge');
  sb.style.display=sc>0?'':'none'; sb.textContent=sc;
  renderScriptList();
}

// ════════════════════════════════════════════════════════════════
// TABS
// ════════════════════════════════════════════════════════════════
function initTabs(){
  document.querySelectorAll('.tab').forEach(tab=>{
    tab.addEventListener('click',()=>{
      document.querySelectorAll('.tab,.panel').forEach(el=>el.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(`panel-${tab.dataset.tab}`)?.classList.add('active');
      // Load cookies when switching to that tab
      if(tab.dataset.tab==='cookies') loadCookies();
    });
  });
}

// ════════════════════════════════════════════════════════════════
// TOGGLES
// ════════════════════════════════════════════════════════════════
function initToggles(){
  document.querySelectorAll('input[data-key]').forEach(inp=>{
    inp.addEventListener('change',()=>applySettings({[inp.dataset.key]:inp.checked}));
  });
}

// ════════════════════════════════════════════════════════════════
// QUICK ACTIONS
// ════════════════════════════════════════════════════════════════
function updatePickerBtn(){
  const btn=document.getElementById('btnPickOverlay');
  const lbl=document.getElementById('btnPickerLabel');
  if(pickerOn){
    btn.classList.add('picking');
    lbl.textContent=t('cancelPicker');
  } else {
    btn.classList.remove('picking');
    lbl.textContent=t('picker');
  }
}

function initQuickActions(){
  document.getElementById('btnUnlockAll').addEventListener('click',()=>{
    const all={}; Object.keys(FACTORY_DEFAULTS).forEach(k=>all[k]=true);
    applySettings(all); toast(t('toastEnabled'));
  });
  document.getElementById('btnLockAll').addEventListener('click',()=>{
    const none={}; Object.keys(FACTORY_DEFAULTS).forEach(k=>none[k]=false);
    applySettings(none); toast(t('toastDisabled'),'info');
  });
  document.getElementById('btnPickOverlay').addEventListener('click',async()=>{
    if(pickerOn){
      // Cancel picker
      pickerOn=false;
      await send('cancelPicker');
      updatePickerBtn();
      toast(t('toastPickerCancelled'),'info');
    } else {
      pickerOn=true;
      updatePickerBtn();
      toast(t('toastPicker'),'info',10000);
      await send('activatePicker');
    }
  });
}

function initTools(){
  document.getElementById('btnViewSource').addEventListener('click',async()=>{
    const[tab]=await chrome.tabs.query({active:true,currentWindow:true});
    if(tab?.url&&!tab.url.startsWith('chrome')) chrome.tabs.create({url:'view-source:'+tab.url});
    else toast('Non disponible','err');
  });
  document.getElementById('btnCopyUrl').addEventListener('click',async()=>{
    const[tab]=await chrome.tabs.query({active:true,currentWindow:true});
    if(tab?.url){ try{await navigator.clipboard.writeText(tab.url); toast(t('toastUrlCopied'));}catch(_){} }
  });
  document.getElementById('btnIncognito').addEventListener('click',async()=>{
    const[tab]=await chrome.tabs.query({active:true,currentWindow:true});
    if(!tab?.url) return;
    chrome.windows.create({url:tab.url,incognito:true},w=>{
      if(chrome.runtime.lastError) toast(t('toastIncognito'),'err',3000);
    });
  });
}

// ════════════════════════════════════════════════════════════════
// OVERLAY PANEL
// ════════════════════════════════════════════════════════════════
function initOverlayPanel(){
  document.getElementById('btnRestoreAll').addEventListener('click',async()=>{
    await send('restoreAllOverlays'); toast(t('toastAllRestored'));
  });
}

function renderOverlayList(list){
  overlayData=list;
  const cnt=list.length;
  const badge=document.getElementById('overlayBadge');
  badge.style.display=cnt>0?'':'none'; badge.textContent=cnt;
  document.getElementById('overlayCount').textContent=cnt>0?t('overlayX',cnt):t('overlayNone');
  document.getElementById('btnRestoreAll').style.display=cnt>0?'':'none';
  const container=document.getElementById('overlayList');
  const empty=document.getElementById('overlayEmpty');
  if(cnt===0){ empty.style.display=''; container.innerHTML=''; container.appendChild(empty); return; }
  empty.style.display='none'; container.innerHTML='';
  list.forEach(ov=>{
    const ago=Math.floor((Date.now()-ov.ts)/1000);
    const div=document.createElement('div');
    div.className=`overlay-item ${ov.auto?'auto-item':'manual-item'}`;
    div.innerHTML=`
      <div class="overlay-icon"><svg width="13" height="13" viewBox="0 0 24 24" fill="none"><rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M8 21h8M12 17v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></div>
      <div class="overlay-info">
        <div class="overlay-desc" title="${esc(ov.desc)}">${esc(ov.desc)}</div>
        <div class="overlay-meta">${ov.auto?t('overlayAuto'):t('overlayManual')} · ${t('ago',ago)}</div>
      </div>
      <button class="restore-btn" data-id="${ov.id}" title="Restaurer">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M1 4v6h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M3.51 15a9 9 0 1 0 .49-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>`;
    div.querySelector('.restore-btn').addEventListener('click',async e=>{
      await send('restoreOverlay',{id:e.currentTarget.dataset.id});
      toast(t('toastOverlayRestored'));
    });
    container.appendChild(div);
  });
}

// ════════════════════════════════════════════════════════════════
// COOKIE MANAGER
// ════════════════════════════════════════════════════════════════
async function loadCookies(){
  const[tab]=await chrome.tabs.query({active:true,currentWindow:true});
  if(!tab?.url||tab.url.startsWith('chrome')){ allCookies=[]; renderCookieList(); return; }
  try{
    let url=tab.url;
    // Get both .domain and domain cookies
    allCookies=await chrome.cookies.getAll({url});
    // Sort by name
    allCookies.sort((a,b)=>a.name.localeCompare(b.name));
    renderCookieList();
  }catch(e){ allCookies=[]; renderCookieList(); }
}

function renderCookieList(filter=''){
  const container=document.getElementById('cookieList');
  const empty=document.getElementById('cookieEmpty');
  const badge=document.getElementById('cookieBadge');
  const list=filter?allCookies.filter(c=>c.name.toLowerCase().includes(filter.toLowerCase())||c.value.toLowerCase().includes(filter.toLowerCase())):allCookies;
  badge.style.display=allCookies.length>0?'':'none'; badge.textContent=allCookies.length;
  if(list.length===0){ empty.style.display=''; container.innerHTML=''; container.appendChild(empty); return; }
  empty.style.display='none'; container.innerHTML='';
  list.forEach(c=>{
    const div=document.createElement('div');
    div.className='cookie-item';
    const flags=[];
    if(c.secure) flags.push(`<span class="cookie-flag secure">S</span>`);
    if(c.httpOnly) flags.push(`<span class="cookie-flag httponly">H</span>`);
    if(c.session) flags.push(`<span class="cookie-flag session">Ses</span>`);
    const valPreview=c.value.length>30?c.value.slice(0,30)+'…':c.value;
    div.innerHTML=`
      <div class="cookie-item-info">
        <div class="cookie-name">${esc(c.name)}</div>
        <div class="cookie-val">${esc(valPreview)||'<em style="opacity:.5">vide</em>'}</div>
      </div>
      <div class="cookie-flags">${flags.join('')}</div>
      <button class="del-cookie-btn" data-name="${esc(c.name)}" data-domain="${esc(c.domain)}" title="Supprimer">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><polyline points="3 6 5 6 21 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M19 6l-1 14H6L5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 11v6M14 11v6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
      </button>`;
    div.addEventListener('click',e=>{
      if(e.target.closest('.del-cookie-btn')) return;
      openCookieEditor(c);
    });
    div.querySelector('.del-cookie-btn').addEventListener('click',async e=>{
      e.stopPropagation();
      const ok=await showConfirm('confirmDeleteCookieTitle','confirmDeleteCookieMsg');
      if(!ok) return;
      await deleteCookie(c);
    });
    container.appendChild(div);
  });
}

function openCookieEditor(cookie=null){
  editingCookieName=cookie?cookie.name:null;
  document.getElementById('cookieEditorTitle').textContent=cookie?t('editCookieTitle'):t('newCookieTitle');
  document.getElementById('cName').value=cookie?.name||'';
  document.getElementById('cValue').value=cookie?.value||'';
  document.getElementById('cDomain').value=cookie?.domain||'';
  document.getElementById('cPath').value=cookie?.path||'/';
  document.getElementById('cSecure').checked=cookie?.secure||false;
  document.getElementById('cHttpOnly').checked=cookie?.httpOnly||false;
  document.getElementById('cSession').checked=cookie?.session||false;
  if(cookie&&!cookie.session&&cookie.expirationDate){
    const d=new Date(cookie.expirationDate*1000);
    const local=new Date(d.getTime()-d.getTimezoneOffset()*60000);
    document.getElementById('cExpiry').value=local.toISOString().slice(0,16);
  } else {
    document.getElementById('cExpiry').value='';
  }
  document.getElementById('btnDeleteCookie').style.display=cookie?'':'none';
  document.getElementById('cookieEditor').style.display='';
}

function closeCookieEditor(){
  document.getElementById('cookieEditor').style.display='none';
  editingCookieName=null;
}

async function saveCookieFromEditor(){
  const[tab]=await chrome.tabs.query({active:true,currentWindow:true});
  if(!tab?.url) return;
  const name=document.getElementById('cName').value.trim();
  if(!name){ toast('Nom requis','err'); return; }
  const value=document.getElementById('cValue').value;
  const domain=document.getElementById('cDomain').value.trim()||undefined;
  const path=document.getElementById('cPath').value.trim()||'/';
  const secure=document.getElementById('cSecure').checked;
  const session=document.getElementById('cSession').checked;
  const expiryStr=document.getElementById('cExpiry').value;
  const details={url:tab.url,name,value,path,secure};
  if(domain) details.domain=domain;
  if(!session&&expiryStr){
    details.expirationDate=Math.floor(new Date(expiryStr).getTime()/1000);
  }
  try{
    // If editing, remove old cookie first (name might change)
    if(editingCookieName&&editingCookieName!==name){
      await chrome.cookies.remove({url:tab.url,name:editingCookieName});
    }
    await chrome.cookies.set(details);
    toast(t('toastCookieSaved'));
    closeCookieEditor();
    await loadCookies();
  }catch(e){ toast(t('toastCookieError'),'err'); }
}

async function deleteCookie(c){
  const[tab]=await chrome.tabs.query({active:true,currentWindow:true});
  if(!tab?.url) return;
  try{
    // Try with current URL and with explicit domain
    await chrome.cookies.remove({url:tab.url,name:c.name});
    toast(t('toastCookieDeleted'),'info');
    closeCookieEditor();
    await loadCookies();
  }catch(e){ toast(t('toastCookieError'),'err'); }
}

function initCookiePanel(){
  document.getElementById('btnAddCookie').addEventListener('click',()=>openCookieEditor(null));
  document.getElementById('btnRefreshCookies').addEventListener('click',loadCookies);
  document.getElementById('cookieSearch').addEventListener('input',e=>renderCookieList(e.target.value));
  document.getElementById('btnCloseCookieEditor').addEventListener('click',closeCookieEditor);
  document.getElementById('btnSaveCookie').addEventListener('click',saveCookieFromEditor);
  document.getElementById('btnDeleteCookie').addEventListener('click',async()=>{
    const ok=await showConfirm('confirmDeleteCookieTitle','confirmDeleteCookieMsg');
    if(!ok) return;
    const[tab]=await chrome.tabs.query({active:true,currentWindow:true});
    if(!tab?.url) return;
    const c=allCookies.find(x=>x.name===editingCookieName);
    if(c) await deleteCookie(c);
  });
  // Session checkbox ↔ expiry field
  document.getElementById('cSession').addEventListener('change',e=>{
    document.getElementById('cExpiry').disabled=e.target.checked;
    if(e.target.checked) document.getElementById('cExpiry').value='';
  });
}

// ════════════════════════════════════════════════════════════════
// SCRIPT EDITOR
// ════════════════════════════════════════════════════════════════
function renderScriptList(){
  const scripts=cfg.customScripts||[];
  const container=document.getElementById('scriptList');
  const empty=document.getElementById('scriptEmpty');
  if(scripts.length===0){ empty.style.display=''; container.innerHTML=''; container.appendChild(empty); return; }
  empty.style.display='none'; container.innerHTML='';
  scripts.forEach(sc=>{
    const lines=sc.code.split('\n').length;
    const div=document.createElement('div');
    div.className='script-item';
    div.innerHTML=`
      <div class="script-icon"><svg width="13" height="13" viewBox="0 0 24 24" fill="none"><polyline points="16 18 22 12 16 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><polyline points="8 6 2 12 8 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></div>
      <div class="script-info">
        <div class="script-name">${esc(sc.name||'Sans nom')}</div>
        <div class="script-meta">${sc.runAt} · ${lines} ligne${lines>1?'s':''}</div>
      </div>
      <label class="toggle script-toggle"><input type="checkbox" data-script-id="${sc.id}" ${sc.enabled?'checked':''}/><span class="slider"></span></label>`;
    div.addEventListener('click',e=>{ if(e.target.closest('.script-toggle')) return; openScriptEditor(sc.id); });
    div.querySelector('input[data-script-id]').addEventListener('change',e=>{
      const updated=cfg.customScripts.map(s=>s.id===e.target.dataset.scriptId?{...s,enabled:e.target.checked}:s);
      applySettings({customScripts:updated});
    });
    container.appendChild(div);
  });
}

function openScriptEditor(id=null){
  editingScriptId=id;
  const sc=id?cfg.customScripts.find(s=>s.id===id):null;
  document.getElementById('editorName').value=sc?.name||'';
  document.getElementById('editorCode').value=sc?.code||'';
  document.getElementById('editorRunAt').value=sc?.runAt||'document_idle';
  document.getElementById('btnDeleteScript').style.display=id?'':'none';
  document.getElementById('scriptEditor').style.display='';
  document.getElementById('editorName').focus();
}

function closeScriptEditor(){
  editingScriptId=null;
  document.getElementById('scriptEditor').style.display='none';
}

function initScriptEditor(){
  document.getElementById('btnNewScript').addEventListener('click',()=>openScriptEditor(null));
  document.getElementById('btnCloseEditor').addEventListener('click',closeScriptEditor);

  document.getElementById('btnSaveScript').addEventListener('click',()=>{
    const name=document.getElementById('editorName').value.trim()||'Script';
    const code=document.getElementById('editorCode').value;
    const runAt=document.getElementById('editorRunAt').value;
    if(!code.trim()){ toast('Code vide','err'); return; }
    let scripts=[...(cfg.customScripts||[])];
    if(editingScriptId){
      scripts=scripts.map(s=>s.id===editingScriptId?{...s,name,code,runAt}:s);
    } else {
      scripts.push({id:`sc_${Date.now()}`,name,code,runAt,enabled:true});
    }
    applySettings({customScripts:scripts});
    toast(t('toastScriptSaved'));
    closeScriptEditor();
    // List refreshes immediately via updateUI → renderScriptList
  });

  document.getElementById('btnDeleteScript').addEventListener('click',async()=>{
    const ok=await showConfirm('confirmDeleteTitle','confirmDeleteMsg');
    if(!ok) return;
    const scripts=(cfg.customScripts||[]).filter(s=>s.id!==editingScriptId);
    applySettings({customScripts:scripts});
    toast(t('toastScriptDeleted'),'info');
    closeScriptEditor();
    // List refreshes immediately via updateUI → renderScriptList
  });

  document.querySelectorAll('.tip-btn[data-snippet]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      document.getElementById('editorCode').value=btn.dataset.snippet;
      document.getElementById('editorCode').focus();
    });
  });
}

// ════════════════════════════════════════════════════════════════
// SETTINGS
// ════════════════════════════════════════════════════════════════
function applyTheme(t2){
  theme=t2;
  document.body.classList.remove('dark','light');
  document.body.classList.add(t2);
  document.querySelectorAll('.theme-pick').forEach(b=>b.classList.toggle('active',b.dataset.theme===t2));
  document.getElementById('iconMoon').style.display=t2==='dark'?'':'none';
  document.getElementById('iconSun').style.display=t2==='light'?'':'none';
  chrome.storage.sync.set({theme:t2});
}

function initSettings(){
  // Language
  document.querySelectorAll('.lang-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{ lang=btn.dataset.lang; chrome.storage.sync.set({language:lang}); applyI18n(); updateUI(); toast(t('toastSaved')); });
  });
  // Theme buttons in settings panel
  document.getElementById('themePickDark').addEventListener('click',()=>applyTheme('dark'));
  document.getElementById('themePickLight').addEventListener('click',()=>applyTheme('light'));
  // Theme toggle button in header
  document.getElementById('btnTheme').addEventListener('click',()=>applyTheme(theme==='dark'?'light':'dark'));

  // Save defaults
  document.getElementById('btnSaveDefaults').addEventListener('click',async()=>{
    const snap={}; Object.keys(FACTORY_DEFAULTS).forEach(k=>snap[k]=cfg[k]);
    await chrome.storage.sync.set({userDefaults:JSON.stringify(snap)});
    toast(t('toastDefaultsSaved'));
  });
  // Load defaults
  document.getElementById('btnLoadDefaults').addEventListener('click',async()=>{
    const stored=await chrome.storage.sync.get({userDefaults:null});
    if(!stored.userDefaults){ toast(t('toastNoDefaults'),'info'); return; }
    try{ const snap=JSON.parse(stored.userDefaults); applySettings(snap); toast(t('toastDefaultsLoaded')); }
    catch(_){ toast('Erreur','err'); }
  });
  // Factory reset
  document.getElementById('btnFactoryReset').addEventListener('click',async()=>{
    const ok=await showConfirm('confirmFactoryTitle','confirmFactoryMsg');
    if(!ok) return;
    await chrome.storage.sync.clear();
    await chrome.storage.sync.set({...FACTORY_DEFAULTS,customScripts:'[]',language:lang,theme});
    cfg={...FACTORY_DEFAULTS,customScripts:[]};
    updateUI();
    await send('updateSettings',{settings:cfg});
    toast(t('toastFactoryDone'));
  });
  // Version labels
  document.getElementById('versionLabel').textContent=`v${VERSION}`;
  document.getElementById('aboutVersion').textContent=VERSION;
}

// ════════════════════════════════════════════════════════════════
// RUNTIME MESSAGES (from content.js → background → popup)
// ════════════════════════════════════════════════════════════════
function initRuntimeMessages(){
  chrome.runtime.onMessage.addListener(msg=>{
    if(msg.action==='overlayList') renderOverlayList(msg.payload||[]);
    if(msg.action==='pickerDone'){
      pickerOn=false;
      updatePickerBtn();
      toast(t('toastPickerDone'));
      send('getState');
    }
  });
}

// ════════════════════════════════════════════════════════════════
// LOAD
// ════════════════════════════════════════════════════════════════
async function loadSettings(){
  const stored=await chrome.storage.sync.get({...FACTORY_DEFAULTS,customScripts:'[]',language:'fr',theme:'dark'});
  lang=stored.language||'fr';
  theme=stored.theme||'dark';
  let scripts=[]; try{ scripts=JSON.parse(stored.customScripts||'[]'); }catch(_){}
  cfg={...FACTORY_DEFAULTS,...stored,customScripts:scripts};
  applyTheme(theme);
  applyI18n();
  updateUI();
  await send('getState');
}

// ════════════════════════════════════════════════════════════════
// INIT
// ════════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded',async()=>{
  const[tab]=await chrome.tabs.query({active:true,currentWindow:true});
  tabId=tab?.id; tabUrl=tab?.url||'';

  initTabs();
  initToggles();
  initQuickActions();
  initTools();
  initOverlayPanel();
  initCookiePanel();
  initScriptEditor();
  initSettings();
  initRuntimeMessages();
  await loadSettings();

  // Cross-window storage sync
  chrome.storage.onChanged.addListener(changes=>{
    let needsUpdate=false;
    Object.entries(changes).forEach(([k,{newValue}])=>{
      if(k==='customScripts'){ try{ cfg.customScripts=JSON.parse(newValue||'[]'); needsUpdate=true; }catch(_){} }
      else if(k==='language'){ lang=newValue; applyI18n(); }
      else if(k==='theme'){ applyTheme(newValue); }
      else if(k in FACTORY_DEFAULTS){ cfg[k]=newValue; needsUpdate=true; }
    });
    if(needsUpdate) updateUI();
  });
});
