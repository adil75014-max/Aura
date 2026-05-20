// ===============================================================
//  NOTIFICATIONS GLOBALES — SUPABASE REALTIME
//  Visible par tous : agent, stationnaire, superviseur, admin
// ===============================================================

// ⚠️ Requiert supabaseClient.js chargé avant ce fichier

// ───────────────────────────────────────
//  INITIALISATION DES NOTIFICATIONS
// ───────────────────────────────────────

let globalNotifications = [];
let notifChannel = null;

async function initGlobalNotifications() {
    // Charger les notifications existantes depuis Supabase
    await loadNotifications();

    // Écouter les nouvelles notifications en temps réel
    subscribeToNotifications();

    // Injecter le bouton cloche sur toutes les pages (sauf login)
    injectNotifBell();

    // Mettre à jour le badge
    updateGlobalNotifBadge();
}

// ───────────────────────────────────────
//  CHARGER LES NOTIFICATIONS DEPUIS SUPABASE
// ───────────────────────────────────────
async function loadNotifications() {
    try {
        const { data, error } = await supabaseClient
            .from("notifications")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(50);

        if (error) {
            console.warn("[NOTIF] Erreur chargement:", error.message);
            // Fallback sur localStorage
            globalNotifications = JSON.parse(localStorage.getItem("notifications_global") || "[]");
            return;
        }
        globalNotifications = data || [];
    } catch (e) {
        console.warn("[NOTIF] Erreur:", e);
        globalNotifications = JSON.parse(localStorage.getItem("notifications_global") || "[]");
    }
}

// ───────────────────────────────────────
//  ABONNEMENT TEMPS RÉEL
// ───────────────────────────────────────
function subscribeToNotifications() {
    try {
        /* On NE filtre PAS côté serveur Supabase ici : si les anciens rows
           ont site_code=NULL ou si la colonne manque, le filter serveur
           les mange tous et l'utilisateur ne reçoit plus rien (régression
           identifiée). Le cloisonnement reste assuré côté client via
           AuraTenant.matchesRealtime() ci-dessous, qui rejette les
           payloads d'un autre tenant tout en laissant passer ceux avec
           site_code/service à NULL ou manquant. */
        var rtOpts = { event: "INSERT", schema: "public", table: "notifications" };

        notifChannel = supabaseClient
            .channel("global-notifications")
            .on("postgres_changes", rtOpts, (payload) => {
                const newNotif = payload.new;

                // Filet client : rejet uniquement si le row appartient
                // explicitement à un AUTRE tenant. Les rows sans site_code
                // ou sans service passent (compatibilité ascendante).
                if (window.AuraTenant && !window.AuraTenant.matchesRealtime(newNotif)) return;

                const myRole = (localStorage.getItem("role") || "agent").toLowerCase();
                const myName = localStorage.getItem("nom") || "";

                // Toujours ajouter à la liste pour TOUS les rôles
                globalNotifications.unshift(newNotif);
                updateGlobalNotifBadge();
                renderGlobalNotifPanel();

                const isAlarm = newNotif.type_notif === "alarme" || newNotif.priorite === "haute" || newNotif.priorite === "critique";
                const isPermisFeuAlarm = isAlarm && /permis.*feu|incendie|secours.*victime|svv/i.test(
                    (newNotif.titre || "") + " " + (newNotif.message || "")
                );
                const isCriticalAlarm = isPermisFeuAlarm || newNotif.priorite === "critique";

                // Self-bypass différencié : on ne se notifie pas soi-même sur les
                // notifs banales, mais on RECOIT les alarmes critiques (utile pour
                // confirmer le départ du signal sur ses autres devices + acquitter).
                if (newNotif.emetteur === myName && !isCriticalAlarm) return;

                // Toast complet (titre + détails comme le lieu, agent, etc.)
                const toastText = (newNotif.titre || "") +
                                  (newNotif.message ? "\n" + newNotif.message : "") ||
                                  "Nouvelle notification";

                // ── RÈGLES PAR RÔLE ──
                if (myRole === "stationnaire") {
                    // Stationnaire : uniquement les alarmes liées aux permis feu
                    if (isPermisFeuAlarm) {
                        showGlobalToast(toastText);
                        playAlarmSound();
                        const msgEl = document.getElementById("alarmBannerMsg");
                        if (msgEl) msgEl.textContent = toastText;
                    }
                    return;
                }

                // ── Agent / Superviseur / Admin / Superadmin : son + toast pour TOUT ──
                showGlobalToast(toastText);

                if (isAlarm) {
                    playAlarmSound();
                    const msgEl = document.getElementById("alarmBannerMsg");
                    if (msgEl) msgEl.textContent = toastText;
                } else {
                    playNotifSound();
                }
            })
            .subscribe();
    } catch (e) {
        console.warn("[NOTIF] Realtime non disponible:", e);
    }
}

// ───────────────────────────────────────
//  ENVOYER UNE NOTIFICATION (TOUS LES RÔLES)
// ───────────────────────────────────────
async function sendGlobalNotification(titre, message, type = "info", priorite = "normale") {
    const agent = localStorage.getItem("nom") || "Système";
    const role  = localStorage.getItem("role") || "système";

    const notif = {
        titre: titre,
        message: message,
        type_notif: type, // "info", "alarme", "intervention", "alerte"
        priorite: priorite, // "normale", "haute", "critique"
        emetteur: agent,
        emetteur_role: role,
        visible_par: ["agent", "stationnaire", "superviseur", "admin"],
        lu: false,
        created_at: new Date().toISOString()
    };

    try {
        const { error } = await supabaseClient
            .from("notifications")
            .insert(notif);

        if (error) {
            console.warn("[NOTIF] Erreur envoi Supabase:", error.message);
            // Fallback localStorage
            globalNotifications.unshift(notif);
            localStorage.setItem("notifications_global", JSON.stringify(globalNotifications));
        }
    } catch (e) {
        console.warn("[NOTIF] Fallback localStorage");
        globalNotifications.unshift(notif);
        localStorage.setItem("notifications_global", JSON.stringify(globalNotifications));
    }

    updateGlobalNotifBadge();
    renderGlobalNotifPanel();
}

// ───────────────────────────────────────
//  UI : CLOCHE DE NOTIFICATION GLOBALE
// ───────────────────────────────────────
function injectNotifBell() {
    const page = window.location.pathname.split("/").pop() || "index.html";
    if (page === "login.html") return;
    // Ne pas dupliquer si l'index a déjà sa propre cloche
    if (document.getElementById("globalNotifBell")) return;
    // Ne pas injecter sur index.html car il a déjà sa propre cloche
    if (page === "index.html") return;

    // Conteneur cloche
    const bell = document.createElement("div");
    bell.id = "globalNotifBell";
    bell.innerHTML = `
        <span style="font-size:1.4rem;cursor:pointer;">🔔</span>
        <span id="globalNotifBadge" style="
            position:absolute; top:-4px; right:-6px;
            background:#ff4444; color:#fff;
            font-size:0.65rem; font-weight:700;
            min-width:18px; height:18px;
            border-radius:50%; display:none;
            align-items:center; justify-content:center;
            line-height:18px; text-align:center;
        ">0</span>
    `;
    bell.style.cssText = `
        position:fixed; top:18px; right:24px; z-index:99999;
        cursor:pointer; user-select:none;
    `;
    bell.onclick = toggleGlobalNotifPanel;
    document.body.appendChild(bell);

    // Panneau notifications
    const panel = document.createElement("div");
    panel.id = "globalNotifPanel";
    panel.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.08);">
            <span style="font-weight:700;font-size:1rem;">🔔 Notifications & Alarmes</span>
            <button onclick="toggleGlobalNotifPanel()" style="background:none;border:none;color:inherit;font-size:1.3rem;cursor:pointer;">✖</button>
        </div>
        <div id="globalNotifContent" style="padding:12px 20px;max-height:60vh;overflow-y:auto;">
            Aucune notification.
        </div>
    `;
    panel.style.cssText = `
        position:fixed; top:0; right:-400px; width:380px; max-width:90vw;
        height:100vh; background:rgba(10,12,20,0.97);
        border-left:1px solid rgba(255,255,255,0.08);
        backdrop-filter:blur(16px); z-index:100000;
        transition:right 0.35s ease; color:#e0e4ef;
        font-family:system-ui,sans-serif;
        box-shadow:-8px 0 30px rgba(0,0,0,0.5);
    `;
    document.body.appendChild(panel);

    // Overlay
    const overlay = document.createElement("div");
    overlay.id = "globalNotifOverlay";
    overlay.style.cssText = `
        position:fixed;inset:0;background:rgba(0,0,0,0.4);
        z-index:99999;display:none;
    `;
    overlay.onclick = toggleGlobalNotifPanel;
    document.body.appendChild(overlay);
}

function toggleGlobalNotifPanel() {
    const panel = document.getElementById("globalNotifPanel");
    const overlay = document.getElementById("globalNotifOverlay");
    if (!panel) return;

    const isOpen = panel.style.right === "0px";
    panel.style.right = isOpen ? "-400px" : "0px";
    overlay.style.display = isOpen ? "none" : "block";

    if (!isOpen) {
        // Marquer comme lu
        markAllNotifAsRead();
        renderGlobalNotifPanel();
    }
}

function updateGlobalNotifBadge() {
    const badge = document.getElementById("globalNotifBadge");
    if (!badge) return;
    const unread = globalNotifications.filter(n => !n.lu).length;
    badge.style.display = unread > 0 ? "flex" : "none";
    badge.textContent = unread > 99 ? "99+" : unread;
}

function renderGlobalNotifPanel() {
    const container = document.getElementById("globalNotifContent");
    if (!container) return;
    container.innerHTML = "";

    if (!globalNotifications.length) {
        container.innerHTML = "<div style='opacity:0.5;padding:20px;text-align:center;'>Aucune notification.</div>";
        return;
    }

    const role = (localStorage.getItem("role") || "agent").toLowerCase();

    globalNotifications.forEach(n => {
        // Vérifier que ce rôle peut voir cette notification
        if (n.visible_par && !n.visible_par.includes(role) && !n.visible_par.includes("admin")) return;

        const div = document.createElement("div");
        const typeIcon = {
            "alarme": "🚨",
            "intervention": "🔥",
            "alerte": "⚠️",
            "info": "ℹ️"
        }[n.type_notif] || "📢";

        const prioriteColor = {
            "critique": "#ff4444",
            "haute": "#fbbf24",
            "normale": "#4da3ff"
        }[n.priorite] || "#6b7280";

        const date = n.created_at ? new Date(n.created_at).toLocaleString("fr-FR") : "";

        div.style.cssText = `
            padding:14px 0; border-bottom:1px solid rgba(255,255,255,0.06);
            border-left:3px solid ${prioriteColor}; padding-left:14px; margin-bottom:4px;
        `;
        div.innerHTML = `
            <div style="font-weight:700;font-size:0.92rem;">${typeIcon} ${n.titre || "Notification"}</div>
            <div style="font-size:0.84rem;opacity:0.85;margin-top:4px;">${n.message || ""}</div>
            <div style="font-size:0.72rem;opacity:0.45;margin-top:6px;">
                ${n.emetteur || ""} ${n.emetteur_role ? "(" + n.emetteur_role + ")" : ""} · ${date}
            </div>
        `;
        container.appendChild(div);
    });
}

async function markAllNotifAsRead() {
    globalNotifications.forEach(n => n.lu = true);
    updateGlobalNotifBadge();

    // Mettre à jour dans Supabase si possible
    try {
        const ids = globalNotifications.filter(n => n.id).map(n => n.id);
        if (ids.length) {
            await supabaseClient
                .from("notifications")
                .update({ lu: true })
                .in("id", ids);
        }
    } catch (e) {
        // Silencieux
    }
}

// ═══════════════════════════════════════════════════════
//  SON DE NOTIFICATION & ALARME — FIABLE iOS/Android/Web
// ═══════════════════════════════════════════════════════
//  Stratégie multi-niveaux :
//   1) Élément <audio> HTML caché dans la page (le plus fiable)
//   2) Pré-déblocage au premier geste utilisateur
//   3) Fallback AudioContext si <audio> bloqué
//   4) Fallback bip généré (oscillator) si tout échoue
// ═══════════════════════════════════════════════════════

var _alarmEl = null;
var _notifEl = null;
var _audioUnlocked = false;
var _audioCtx = null;
var _alarmBuffer = null;
var _alarmSource = null;

function _ensureAudioElements() {
    if (!_alarmEl) {
        _alarmEl = document.createElement("audio");
        _alarmEl.id = "_global_alarm_audio";
        _alarmEl.src = "fire_station_tone_x4.mp3";
        _alarmEl.preload = "auto";
        _alarmEl.loop = true;
        _alarmEl.volume = 1.0;
        _alarmEl.playsInline = true;
        _alarmEl.setAttribute("playsinline", "true");
        _alarmEl.setAttribute("webkit-playsinline", "true");
        _alarmEl.style.cssText = "position:absolute;left:-9999px;width:1px;height:1px;";
        document.body.appendChild(_alarmEl);
    }
    if (!_notifEl) {
        _notifEl = document.createElement("audio");
        _notifEl.id = "_global_notif_audio";
        _notifEl.src = "fire_station_tone_x4.mp3";
        _notifEl.preload = "auto";
        _notifEl.volume = 0.5;
        _notifEl.playsInline = true;
        _notifEl.setAttribute("playsinline", "true");
        _notifEl.style.cssText = "position:absolute;left:-9999px;width:1px;height:1px;";
        document.body.appendChild(_notifEl);
    }
}

// Débloquer au premier geste utilisateur (iOS exige absolument un user gesture)
function _unlockAudio() {
    if (_audioUnlocked) return;
    _ensureAudioElements();

    // Test : jouer-pauser immédiatement pour débloquer le tag audio
    try {
        _alarmEl.muted = true;
        var p1 = _alarmEl.play();
        if (p1 && p1.then) {
            p1.then(function() {
                _alarmEl.pause();
                _alarmEl.currentTime = 0;
                _alarmEl.muted = false;
            }).catch(function(){});
        }

        _notifEl.muted = true;
        var p2 = _notifEl.play();
        if (p2 && p2.then) {
            p2.then(function() {
                _notifEl.pause();
                _notifEl.currentTime = 0;
                _notifEl.muted = false;
            }).catch(function(){});
        }
    } catch(e) {}

    // Aussi débloquer AudioContext (fallback)
    try {
        _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (_audioCtx.state === "suspended") _audioCtx.resume();
    } catch(e) {}

    _audioUnlocked = true;
}

// Attacher le déblocage à TOUS les types de gestes utilisateur
function _attachUnlockListeners() {
    var events = ["click", "touchstart", "touchend", "pointerdown", "keydown", "mousedown"];
    events.forEach(function(evt) {
        document.addEventListener(evt, _unlockAudio, { capture: true, passive: true });
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() {
        _ensureAudioElements();
        _attachUnlockListeners();
    });
} else {
    _ensureAudioElements();
    _attachUnlockListeners();
}

function playAlarmSound() {
    _ensureAudioElements();

    // Tentative 1 : élément <audio>
    try {
        _alarmEl.currentTime = 0;
        _alarmEl.loop = true;
        _alarmEl.volume = 1.0;
        var p = _alarmEl.play();
        if (p && p.catch) p.catch(function() { _playFallbackAlarm(); });

        // Couper après 30 secondes
        setTimeout(function() {
            try { _alarmEl.pause(); _alarmEl.currentTime = 0; } catch(e){}
        }, 30000);
    } catch(e) {
        _playFallbackAlarm();
    }

    showAlarmBanner();

    // Vibration mobile (si disponible)
    if (navigator.vibrate) {
        try { navigator.vibrate([500, 200, 500, 200, 500, 200, 500]); } catch(e){}
    }
}

function playNotifSound() {
    _ensureAudioElements();
    try {
        _notifEl.currentTime = 0;
        _notifEl.volume = 0.5;
        var p = _notifEl.play();
        if (p && p.catch) p.catch(function(){ _playFallbackBeep(0.5, 0.3); });
    } catch(e) {
        _playFallbackBeep(0.5, 0.3);
    }
    if (navigator.vibrate) {
        try { navigator.vibrate(200); } catch(e){}
    }
}

// Fallback alarme : bip d'urgence répété via AudioContext
function _playFallbackAlarm() {
    if (!_audioCtx) {
        try { _audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e){ return; }
    }
    if (_audioCtx.state === "suspended") _audioCtx.resume();

    var beepCount = 0;
    var maxBeeps = 30;
    var interval = setInterval(function() {
        if (beepCount >= maxBeeps) { clearInterval(interval); return; }
        _playFallbackBeep(1.0, 0.3, beepCount % 2 === 0 ? 880 : 660);
        beepCount++;
    }, 1000);
}

function _playFallbackBeep(volume, duration, frequency) {
    if (!_audioCtx) {
        try { _audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e){ return; }
    }
    try {
        if (_audioCtx.state === "suspended") _audioCtx.resume();
        var osc = _audioCtx.createOscillator();
        var gain = _audioCtx.createGain();
        osc.frequency.value = frequency || 880;
        osc.type = "square";
        gain.gain.value = volume;
        osc.connect(gain);
        gain.connect(_audioCtx.destination);
        osc.start();
        osc.stop(_audioCtx.currentTime + (duration || 0.3));
    } catch(e){}
}

// ───────────────────────────────────────
//  BANNIÈRE D'ALARME VISUELLE
//  S'affiche en plein écran pour garantir que l'alarme est vue
// ───────────────────────────────────────
function showAlarmBanner() {
    if (document.getElementById("alarmBanner")) return;

    const banner = document.createElement("div");
    banner.id = "alarmBanner";
    banner.innerHTML = `
        <div style="font-size:2.5rem;margin-bottom:10px;">🚨</div>
        <div style="font-size:1.4rem;font-weight:800;letter-spacing:0.05em;">ALARME EN COURS</div>
        <div style="font-size:0.95rem;margin-top:8px;opacity:0.95;white-space:pre-line;line-height:1.5;max-width:90%;text-align:center;" id="alarmBannerMsg"></div>
        <button onclick="closeAlarmBanner()" style="
            margin-top:20px; padding:12px 30px; background:#fff; color:#b91c1c;
            border:none; border-radius:10px; font-weight:700; font-size:1rem;
            cursor:pointer;
        ">✔ Acquitter</button>
    `;
    banner.style.cssText = `
        position:fixed; inset:0; z-index:999999;
        background:rgba(180,20,20,0.97); color:#fff;
        display:flex; flex-direction:column;
        justify-content:center; align-items:center;
        font-family:system-ui,sans-serif; text-align:center;
        animation: alarmPulse 0.8s ease-in-out infinite alternate;
    `;

    // CSS animation
    const style = document.createElement("style");
    style.textContent = `
        @keyframes alarmPulse {
            from { background: rgba(180,20,20,0.97); }
            to { background: rgba(220,40,40,0.97); }
        }
    `;
    document.head.appendChild(style);
    document.body.appendChild(banner);
}

function closeAlarmBanner() {
    var banner = document.getElementById("alarmBanner");
    if (banner) banner.remove();
    if (_alarmEl) { try { _alarmEl.pause(); _alarmEl.currentTime = 0; } catch(e){} }
    if (_alarmSource) { try { _alarmSource.stop(); } catch(e){} _alarmSource = null; }
    if (navigator.vibrate) { try { navigator.vibrate(0); } catch(e){} }
}

// ───────────────────────────────────────
//  TOAST GLOBAL
// ───────────────────────────────────────
function showGlobalToast(text) {
    let t = document.getElementById("global-notif-toast");
    if (!t) {
        t = document.createElement("div");
        t.id = "global-notif-toast";
        t.style.cssText = `
            position:fixed;top:24px;left:50%;transform:translateX(-50%) translateY(-80px);
            padding:14px 28px;border-radius:12px;font-size:0.92rem;z-index:999999;
            opacity:0;transition:all 0.4s;color:#fff;
            background:rgba(20,20,40,0.95);border:1px solid rgba(212,175,55,0.3);
            backdrop-filter:blur(12px);box-shadow:0 6px 24px rgba(0,0,0,0.5);
            font-family:system-ui,sans-serif;max-width:90vw;text-align:center;
        `;
        document.body.appendChild(t);
    }
    t.textContent = text;
    t.style.transform = "translateX(-50%) translateY(0)";
    t.style.opacity = "1";
    setTimeout(() => {
        t.style.transform = "translateX(-50%) translateY(-80px)";
        t.style.opacity = "0";
    }, 4500);
}

// ───────────────────────────────────────
//  AUTO-INIT AU CHARGEMENT
// ───────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
    const page = window.location.pathname.split("/").pop() || "index.html";
    // Ne pas init sur login ou sur accès QR code (pas de session)
    if (page === "login.html") return;
    if (page === "consulter_pf.html" && window.location.search.includes("pf=") && !localStorage.getItem("nom")) return;
    initGlobalNotifications();
});
