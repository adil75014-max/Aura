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
        notifChannel = supabaseClient
            .channel("global-notifications")
            .on("postgres_changes", {
                event: "INSERT",
                schema: "public",
                table: "notifications"
            }, (payload) => {
                const newNotif = payload.new;
                globalNotifications.unshift(newNotif);
                updateGlobalNotifBadge();
                renderGlobalNotifPanel();
                showGlobalToast(newNotif.titre || newNotif.message || "Nouvelle notification");

                // Son de notification (plus fort pour alarmes/haute priorité)
                if (newNotif.type_notif === "alarme" || newNotif.priorite === "haute" || newNotif.priorite === "critique") {
                    playAlarmSound();
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

// ───────────────────────────────────────
//  SON DE NOTIFICATION
// ───────────────────────────────────────
let notifAudio = null;

function playAlarmSound() {
    try {
        // Utiliser le son fire_station_tone dédié aux notifications
        if (!notifAudio) {
            notifAudio = new Audio("fire_station_tone_x4.mp3");
            notifAudio.volume = 0.7;
        }
        notifAudio.currentTime = 0;
        notifAudio.play().catch(() => {});
    } catch (e) {}
}

function playNotifSound() {
    try {
        if (!notifAudio) {
            notifAudio = new Audio("fire_station_tone_x4.mp3");
            notifAudio.volume = 0.5;
        }
        notifAudio.currentTime = 0;
        notifAudio.play().catch(() => {});
    } catch (e) {}
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
