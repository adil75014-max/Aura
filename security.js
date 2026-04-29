// ===============================
//  SECURITY.JS — VERSION SUPABASE + ANTI-PIRATAGE
// ===============================

// ⚠️ Ce fichier suppose que supabaseClient
// est déjà chargé dans la page via supabaseClient.js

// --------------------------------------
// Récupérer l'utilisateur + son profil
// --------------------------------------
async function getCurrentUserAndProfile() {
    const { data: userData, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !userData.user) return { user: null, profile: null };
    const user = userData.user;
    const { data: profile, error: profileError } = await supabaseClient
        .from("profiles").select("*").eq("id", user.id).single();
    if (profileError) return { user, profile: null };
    return { user, profile };
}

// --------------------------------------
// Exiger que l'utilisateur soit connecté
// --------------------------------------
async function requireLogin() {
    const { user, profile } = await getCurrentUserAndProfile();
    if (!user) { window.location.href = "login.html"; return null; }
    return { user, profile };
}

// --------------------------------------
// Exiger un rôle spécifique
// --------------------------------------
async function requireRole(requiredRole) {
    const ctx = await requireLogin();
    if (!ctx) return null;
    const { profile } = ctx;
    if (!profile || profile.role !== requiredRole) {
        window.location.href = "login.html"; return null;
    }
    return ctx;
}

// --------------------------------------
// Déconnexion
// --------------------------------------
async function logout() {
    await supabaseClient.auth.signOut();
    localStorage.removeItem("currentProfile");
    localStorage.removeItem("nom");
    localStorage.removeItem("role");
    localStorage.removeItem("loginTime");
    window.location.href = "login.html";
}

// ===============================
//  GARDE D'AUTHENTIFICATION AUTO
// ===============================
(function authGuard() {
    const page = window.location.pathname.split("/").pop() || "index.html";
    if (page === "login.html") return;

    // Autoriser l'accès QR code au permis feu (mode lecture seule)
    if (page === "consulter_pf.html" && window.location.search.includes("pf=")) return;

    const nom  = localStorage.getItem("nom");
    const role = localStorage.getItem("role");
    if (!nom || !role) { window.location.href = "login.html"; return; }

    // Expiration de session (8h max)
    const loginTime = parseInt(localStorage.getItem("loginTime") || "0", 10);
    const MAX_SESSION = 8 * 60 * 60 * 1000;
    if (loginTime && (Date.now() - loginTime) > MAX_SESSION) {
        localStorage.removeItem("nom");
        localStorage.removeItem("role");
        localStorage.removeItem("loginTime");
        window.location.href = "login.html";
        return;
    }
})();

// ===============================
//  PROTECTION ANTI-PIRATAGE
// ===============================

// 1) Bloquer le clic droit
document.addEventListener("contextmenu", function(e) { e.preventDefault(); });

// 2) Bloquer les raccourcis DevTools
document.addEventListener("keydown", function(e) {
    if (e.key === "F12") { e.preventDefault(); return; }
    if (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J" || e.key === "C")) { e.preventDefault(); return; }
    if (e.ctrlKey && e.key === "u") { e.preventDefault(); return; }
});

// 3) Détection d'ouverture DevTools
(function detectDevTools() {
    const threshold = 160;
    setInterval(function() {
        const w = window.outerWidth - window.innerWidth > threshold;
        const h = window.outerHeight - window.innerHeight > threshold;
        if (w || h) {
            document.body.innerHTML = "<div style='display:flex;justify-content:center;align-items:center;height:100vh;background:#0a0a0a;color:#ff4444;font-family:system-ui;font-size:1.3rem;text-align:center;padding:20px;'>⛔ Accès non autorisé détecté.<br>Session terminée.</div>";
            localStorage.removeItem("nom");
            localStorage.removeItem("role");
            setTimeout(() => { window.location.href = "login.html"; }, 3000);
        }
    }, 1000);
})();

// 4) Protection contre l'injection de scripts externes
(function blockExternalScripts() {
    const allowed = ["supabase","cdn.jsdelivr.net","cdnjs.cloudflare.com","fonts.googleapis.com","fonts.gstatic.com"];
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.tagName === "SCRIPT" && node.src &&
                    !node.src.includes(window.location.origin) &&
                    !allowed.some(d => node.src.includes(d))) {
                    node.remove();
                    console.warn("[SECURITY] Script externe bloqué:", node.src);
                }
            });
        });
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
})();

// 5) Vérification d'intégrité du rôle
(function checkIntegrity() {
    const role = localStorage.getItem("role");
    const validRoles = ["admin", "superviseur", "stationnaire", "agent"];
    if (role && !validRoles.includes(role.toLowerCase())) {
        localStorage.removeItem("nom");
        localStorage.removeItem("role");
        window.location.href = "login.html";
    }
})();
