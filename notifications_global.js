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

// La cloche de notification / l'alarme sont RÉSERVÉES au service Sécurité Incendie.
// Les autres services (sûreté, technique, services généraux) n'ont ni cloche,
// ni alarme sonore, ni souscription temps réel aux notifications.
// (Un superadmin qui "incarne" le service incendie aura service === "incendie"
//  en localStorage, donc la cloche s'active normalement dans ce cas.)
function _isNotifServiceIncendie() {
    var svc = (localStorage.getItem("service") || "").toLowerCase().trim();
    return svc === "incendie";
}

async function initGlobalNotifications() {
    // Garde service : pas de cloche hors incendie.
    if (!_isNotifServiceIncendie()) {
        return;
    }

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
                    // Stationnaire : uniquement les alarmes liées aux permis feu.
                    // Le message va UNIQUEMENT dans la bannière plein écran (pas de
                    // toast en plus, sinon l'adresse s'affiche deux fois).
                    if (isPermisFeuAlarm) {
                        playAlarmSound();
                        const msgEl = document.getElementById("alarmBannerMsg");
                        if (msgEl) msgEl.textContent = toastText;
                    }
                    return;
                }

                // ── Agent / Superviseur / Admin / Superadmin ──
                if (isAlarm) {
                    // ALARME : bannière plein écran + son. Le texte (titre + lieu +
                    // agent) va UNIQUEMENT dans la bannière. Auparavant on affichait
                    // EN PLUS un toast avec le même texte → l'adresse apparaissait
                    // deux fois à l'écran. Corrigé : plus de toast pour les alarmes.
                    playAlarmSound();
                    const msgEl = document.getElementById("alarmBannerMsg");
                    if (msgEl) msgEl.textContent = toastText;
                } else {
                    // Notification banale : toast + son léger.
                    playNotifSound();
                    showGlobalToast(toastText);
                }
            })
            .subscribe();

        // ─── Subscription auxiliaire sur alertes_urgence ───
        // Quand UNE row passe à statut='traitee' (UPDATE), on ferme
        // automatiquement le banner d'alarme et on stoppe le son sur
        // CE device. Combiné avec stopAllAlarms() qui broadcast cet
        // UPDATE, ça donne un acquittement multi-device en temps réel.
        try {
            supabaseClient
                .channel("alertes_urgence_stop")
                .on("postgres_changes", {
                    event: "UPDATE",
                    schema: "public",
                    table: "alertes_urgence"
                }, (payload) => {
                    const row = payload.new || {};
                    if (window.AuraTenant && !window.AuraTenant.matchesRealtime(row)) return;
                    if (row.statut === "traitee") {
                        // Quelqu'un (peut-être nous, peut-être un autre poste) a stoppé.
                        // On ferme le banner et on coupe le son sans rebroadcaster.
                        closeAlarmBanner();
                    }
                })
                .subscribe();
        } catch (e) {
            console.warn("[NOTIF] Subscription alertes_urgence_stop indisponible:", e);
        }
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
        texte: message || titre || "Notification", // colonne NOT NULL en base — sans elle l'insert échouait
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
var _alarmSource = null;        // BufferSourceNode actif (pour pouvoir l'arrêter)
var _alarmGain = null;          // Gain pour fade out propre
var _bufferDecodePromise = null;
var _alarmDecodeWaiting = false; // évite d'empiler plusieurs attentes de décodage

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

// Décode le MP3 en AudioBuffer une seule fois → son instantané au play
function _decodeAlarmBuffer() {
    if (_alarmBuffer) return Promise.resolve(_alarmBuffer);
    if (_bufferDecodePromise) return _bufferDecodePromise;
    if (!_audioCtx) {
        try { _audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
        catch(e) { return Promise.reject(e); }
    }
    _bufferDecodePromise = fetch("fire_station_tone_x4.mp3", { cache: "force-cache" })
        .then(function(r) {
            if (!r.ok) throw new Error("HTTP " + r.status);
            return r.arrayBuffer();
        })
        .then(function(ab) {
            // Safari iOS exige la forme callback de decodeAudioData (pas la promise)
            return new Promise(function(resolve, reject) {
                _audioCtx.decodeAudioData(ab, function(buf) {
                    _alarmBuffer = buf;
                    console.info("[Audio] Buffer alarme décodé : " + buf.duration.toFixed(1) + "s");
                    resolve(buf);
                }, function(err) {
                    console.warn("[Audio] decodeAudioData failed:", err);
                    reject(err);
                });
            });
        })
        .catch(function(e) {
            console.warn("[Audio] Échec pré-décodage buffer (fallback HTML5 prendra le relais):", e);
            _bufferDecodePromise = null; // permettre une nouvelle tentative plus tard
            return null;
        });
    return _bufferDecodePromise;
}

// Débloquer au premier geste utilisateur (iOS exige absolument un user gesture)
function _unlockAudio() {
    _ensureAudioElements();

    // 1) Créer/reprendre l'AudioContext sur le geste utilisateur
    if (!_audioCtx) {
        try { _audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
    }
    if (_audioCtx && _audioCtx.state === "suspended") {
        try { _audioCtx.resume(); } catch(e) {}
    }

    // 2) Lancer (ou relancer) le pré-décodage du buffer alarme
    _decodeAlarmBuffer();

    // 2bis) KEEP-ALIVE : maintenir le contexte audio "running" en jouant un
    // silence en boucle (gain 0). Sans ça, le navigateur suspend le contexte
    // après le geste, et la 1ère alarme ne sonne pas (il fallait 2-3 essais).
    // Avec ce keep-alive, le contexte reste actif → son instantané dès la 1ère.
    _startAudioKeepAlive();

    // 3) Débloquer aussi les éléments <audio> HTML5 (fallback iOS très ancien)
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

    _audioUnlocked = true;
}

// Source silencieuse persistante qui empêche la suspension du contexte audio.
var _keepAliveSource = null;
function _startAudioKeepAlive() {
    if (!_audioCtx || _keepAliveSource) return;
    try {
        // Buffer d'1 frame silencieuse, joué en boucle à volume 0
        var buf = _audioCtx.createBuffer(1, 1, _audioCtx.sampleRate);
        var src = _audioCtx.createBufferSource();
        src.buffer = buf;
        src.loop = true;
        var g = _audioCtx.createGain();
        g.gain.value = 0; // totalement silencieux
        src.connect(g);
        g.connect(_audioCtx.destination);
        src.start(0);
        _keepAliveSource = src;
    } catch(e) { /* pas bloquant */ }
}

// Si l'onglet revient au premier plan, on relance resume() + keep-alive
document.addEventListener("visibilitychange", function() {
    if (!document.hidden && _audioCtx) {
        if (_audioCtx.state === "suspended") { try { _audioCtx.resume(); } catch(e){} }
        _startAudioKeepAlive();
    }
});

// Attacher le déblocage à TOUS les types de gestes utilisateur (re-déclenche aussi resume() à chaque fois)
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
        // Pré-décoder le son d'alarme DÈS le chargement (ne nécessite pas de
        // geste utilisateur : decodeAudioData fonctionne sur un contexte suspendu).
        // Sans ça, le décodage ne démarrait qu'au 1er clic → la 1ère alarme
        // arrivait avant la fin du décodage et ne sonnait pas ("2e fois seulement").
        _decodeAlarmBuffer();
    });
} else {
    _ensureAudioElements();
    _attachUnlockListeners();
    _decodeAlarmBuffer();
}

function playAlarmSound() {
    _ensureAudioElements();
    showAlarmBanner();

    // Vibration mobile (immédiate, indépendante de l'audio)
    if (navigator.vibrate) {
        try { navigator.vibrate([500, 200, 500, 200, 500, 200, 500]); } catch(e){}
    }

    // ── PRIORITÉ 0 : buffer pas encore décodé ──
    // Cas rare (toute 1ère alarme juste après le chargement, décodage non
    // terminé). On réveille le contexte, on attend la fin du décodage et on
    // relance proprement, AU LIEU de tomber sur le fallback HTML5 peu fiable
    // qui ne sonnait qu'à la 2e tentative. On sort ensuite (pas de double son).
    if (_audioCtx && !_alarmBuffer && !_alarmDecodeWaiting) {
        _alarmDecodeWaiting = true;
        if (_audioCtx.state === "suspended") { try { _audioCtx.resume(); } catch(e){} }
        _decodeAlarmBuffer().then(function(buf) {
            _alarmDecodeWaiting = false;
            if (buf && !_alarmSource) {
                playAlarmSound();          // buffer prêt → lecture Web Audio propre
            } else if (!buf) {
                _playFallbackAlarm();      // décodage impossible → bip d'urgence
            }
        });
        return;
    }

    // ── PRIORITÉ 1 : Web Audio API avec buffer pré-décodé ──
    // Le plus fiable : démarrage instantané, marche sur iOS dès que le
    // contexte audio a été réveillé par un user gesture (ce que fait
    // _unlockAudio attaché à tous les events).
    if (_audioCtx && _alarmBuffer) {
        try {
            // S'assurer que le contexte n'est pas suspendu
            if (_audioCtx.state === "suspended") {
                _audioCtx.resume(); // best-effort
            }
            // Couper toute alarme précédente
            if (_alarmSource) {
                try { _alarmSource.stop(); } catch(e){}
                _alarmSource = null;
            }
            var src = _audioCtx.createBufferSource();
            src.buffer = _alarmBuffer;
            src.loop = true;
            var gain = _audioCtx.createGain();
            gain.gain.value = 1.0;
            src.connect(gain);
            gain.connect(_audioCtx.destination);
            src.start(0);
            _alarmSource = src;
            _alarmGain = gain;
            // Auto-cut à 30s
            setTimeout(function() {
                try { src.stop(); } catch(e){}
                if (_alarmSource === src) _alarmSource = null;
            }, 30000);
            return; // ✅ son lancé via Web Audio, on s'arrête là
        } catch(e) {
            console.warn("[Audio] Web Audio playback échec, fallback HTML5:", e);
        }
    }

    // ── PRIORITÉ 2 : élément <audio> HTML5 (fallback) ──
    // Si le buffer n'est pas encore décodé (premier chargement, ou décodage
    // a échoué), on tombe sur l'élément audio classique. Au passage on
    // relance le décodage pour la prochaine fois.
    _decodeAlarmBuffer();
    try {
        _alarmEl.currentTime = 0;
        _alarmEl.loop = true;
        _alarmEl.volume = 1.0;
        _alarmEl.muted = false;
        var p = _alarmEl.play();
        if (p && p.catch) {
            p.catch(function(err) {
                console.warn("[Audio] HTML5 play échec, fallback bip:", err && err.message);
                _playFallbackAlarm();
            });
        }
        setTimeout(function() {
            try { _alarmEl.pause(); _alarmEl.currentTime = 0; } catch(e){}
        }, 30000);
    } catch(e) {
        _playFallbackAlarm();
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
//  Le bouton "🛑 ARRÊTER L'ALARME" broadcaste à tous les agents
//  connectés via UPDATE de alertes_urgence → statut='traitee'.
// ───────────────────────────────────────
function showAlarmBanner() {
    if (document.getElementById("alarmBanner")) return;

    const banner = document.createElement("div");
    banner.id = "alarmBanner";
    banner.innerHTML = `
        <div style="font-size:2.5rem;margin-bottom:6px;">🚨</div>
        <div style="font-size:1.4rem;font-weight:800;letter-spacing:0.05em;">ALARME EN COURS</div>
        <div style="font-size:1rem;margin-top:12px;opacity:0.98;white-space:pre-line;line-height:1.5;max-width:92%;text-align:center;font-weight:500;" id="alarmBannerMsg"></div>
        <button onclick="window.stopAllAlarms && window.stopAllAlarms()" style="
            margin-top:24px; padding:16px 32px; background:#fff; color:#b91c1c;
            border:none; border-radius:12px; font-weight:800; font-size:1.05rem;
            cursor:pointer; box-shadow:0 4px 12px rgba(0,0,0,0.3);
            letter-spacing:0.03em;
        ">🛑 ARRÊTER L'ALARME</button>
        <div style="margin-top:10px;font-size:0.78rem;opacity:0.85;">
            ⚠️ Stoppe l'alarme sur TOUS les postes connectés.
        </div>
    `;
    banner.style.cssText = `
        position:fixed; inset:0; z-index:999999;
        background:rgba(180,20,20,0.97); color:#fff;
        display:flex; flex-direction:column;
        justify-content:center; align-items:center;
        font-family:system-ui,sans-serif; text-align:center;
        animation: alarmPulse 0.8s ease-in-out infinite alternate;
        padding:20px;
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
    // Stop HTML5 audio
    if (_alarmEl) { try { _alarmEl.pause(); _alarmEl.currentTime = 0; } catch(e){} }
    // Stop Web Audio BufferSource (la source primaire du son)
    if (_alarmSource) { try { _alarmSource.stop(); } catch(e){} _alarmSource = null; }
    if (navigator.vibrate) { try { navigator.vibrate(0); } catch(e){} }
}

// ───────────────────────────────────────
//  STOP ALARM BROADCAST
//  Marque toutes les urgences actives comme traitées en BDD.
//  Le realtime UPDATE propagera la fermeture du banner sur tous
//  les autres devices connectés (incluant le PC sécurité).
// ───────────────────────────────────────
async function stopAllAlarms() {
    closeAlarmBanner(); // ferme immédiatement localement, on n'attend pas le round-trip

    if (typeof supabaseClient === "undefined") return;

    try {
        // Récupère toutes les urgences encore actives pour ce tenant.
        // tenant.js patche déjà supabaseClient.from() → on est cloisonné automatiquement.
        let q = supabaseClient.from("alertes_urgence")
            .select("id")
            .eq("statut", "active");

        const { data, error } = await q;
        if (error) { console.warn("[STOP-ALARM] fetch:", error); return; }
        if (!data || !data.length) return;

        // Marquer toutes traitées en parallèle
        const nom = localStorage.getItem("nom") || null;
        const updates = data.map(u =>
            supabaseClient.from("alertes_urgence")
                .update({
                    statut: "traitee",
                    traitee_at: new Date().toISOString(),
                    traitee_par: nom
                })
                .eq("id", u.id)
        );
        await Promise.all(updates);
        console.info("[STOP-ALARM] " + data.length + " urgence(s) traitée(s) par " + (nom || "—"));
    } catch (e) {
        console.error("[STOP-ALARM]", e);
    }
}
// Exposé global pour le bouton onclick="window.stopAllAlarms()"
window.stopAllAlarms = stopAllAlarms;

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
