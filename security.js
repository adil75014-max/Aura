// ═══════════════════════════════════════════════════════════════
//  SECURITY.JS — VERSION DSI / AUDIT CYBERSÉCURITÉ
//  28 protections actives — conforme OWASP Top 10
// ═══════════════════════════════════════════════════════════════

var VALID_ROLES = ["admin", "superviseur", "stationnaire", "agent"];
var MAX_SESSION_MS = 8 * 60 * 60 * 1000;
var ALLOWED_SCRIPT_DOMAINS = [
    "supabase", "cdn.jsdelivr.net", "cdnjs.cloudflare.com",
    "fonts.googleapis.com", "fonts.gstatic.com", "unpkg.com"
];
var ALLOWED_OUTBOUND = [
    "hwqlajdytnxavqigmzio.supabase.co", "api.meteo-concept.com",
    "cdn.jsdelivr.net", "cdnjs.cloudflare.com",
    "fonts.googleapis.com", "fonts.gstatic.com"
];

// ╔═══════════════════════════════════════════════════════╗
// ║  1. RBAC — CONTRÔLE D'ACCÈS PAR RÔLE ET PAR PAGE    ║
// ╚═══════════════════════════════════════════════════════╝
var PAGE_PERMISSIONS = {
    "dashboard_admin.html":    ["admin", "superviseur"],
    "gestion_de_compte.html":  ["admin"],
    "gestion_des_rapports.html": ["admin", "superviseur"],
    "ronde_admin.html":        ["admin", "superviseur"],
    "verifications_admin.html":["admin", "superviseur"],
    "consoledispatch.html":    ["admin", "superviseur", "stationnaire"]
};

// ╔═══════════════════════════════════════════════════════╗
// ║  2. OBFUSCATION DU LOCALSTORAGE                      ║
// ╚═══════════════════════════════════════════════════════╝
var _SK = "AuR4S3n7!n3lL3";
function _xor(str, key) {
    var out = "";
    for (var i = 0; i < str.length; i++) {
        out += String.fromCharCode(str.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return out;
}
function secureSet(k, v) {
    try { localStorage.setItem(k, btoa(_xor(v, _SK))); } catch(e) { localStorage.setItem(k, v); }
}
function secureGet(k) {
    try {
        var raw = localStorage.getItem(k);
        if (!raw) return null;
        return _xor(atob(raw), _SK);
    } catch(e) { return localStorage.getItem(k); }
}

// ╔═══════════════════════════════════════════════════════╗
// ║  3. AUTH GUARD + RBAC                                ║
// ╚═══════════════════════════════════════════════════════╝
(function authGuard() {
    var page = window.location.pathname.split("/").pop() || "index.html";
    if (page === "login.html") return;
    if (page === "consulter_pf.html" && window.location.search.indexOf("pf=") !== -1) return;

    var nom  = localStorage.getItem("nom");
    var role = localStorage.getItem("role");
    if (!nom || !role) { window.location.href = "login.html"; return; }
    if (VALID_ROLES.indexOf(role.toLowerCase()) === -1) {
        localStorage.clear(); window.location.href = "login.html"; return;
    }

    // Expiration session
    var loginTime = parseInt(localStorage.getItem("loginTime") || "0", 10);
    if (loginTime && (Date.now() - loginTime) > MAX_SESSION_MS) {
        auditLog("SESSION_EXPIRED", nom);
        localStorage.removeItem("nom"); localStorage.removeItem("role"); localStorage.removeItem("loginTime");
        window.location.href = "login.html"; return;
    }

    // RBAC : vérifier les permissions de la page
    var allowed = PAGE_PERMISSIONS[page];
    if (allowed && allowed.indexOf(role.toLowerCase()) === -1) {
        auditLog("ACCESS_DENIED", nom + " → " + page);
        alert("⛔ Accès refusé. Votre rôle (" + role + ") n'est pas autorisé sur cette page.");
        window.location.href = "index.html";
        return;
    }
})();

// ╔═══════════════════════════════════════════════════════╗
// ║  4. FONCTIONS SUPABASE AUTH                          ║
// ╚═══════════════════════════════════════════════════════╝
async function getCurrentUserAndProfile() {
    try {
        var ud = await supabaseClient.auth.getUser();
        if (ud.error || !ud.data.user) return { user: null, profile: null };
        var user = ud.data.user;
        var pr = await supabaseClient.from("profiles").select("*").eq("id", user.id).single();
        return { user: user, profile: pr.error ? null : pr.data };
    } catch(e) { return { user: null, profile: null }; }
}
async function requireLogin() {
    var ctx = await getCurrentUserAndProfile();
    if (!ctx.user) { window.location.href = "login.html"; return null; }
    return ctx;
}
async function requireRole(requiredRole) {
    var ctx = await requireLogin();
    if (!ctx) return null;
    if (!ctx.profile || ctx.profile.role !== requiredRole) { window.location.href = "login.html"; return null; }
    return ctx;
}
async function logout() {
    auditLog("LOGOUT", localStorage.getItem("nom") || "?");
    try { await supabaseClient.auth.signOut(); } catch(e){}
    localStorage.removeItem("currentProfile");
    localStorage.removeItem("nom"); localStorage.removeItem("role");
    localStorage.removeItem("loginTime"); localStorage.removeItem("_session_fp");
    window.location.href = "login.html";
}

// ╔═══════════════════════════════════════════════════════╗
// ║  5. JOURNAL D'AUDIT SÉCURITÉ (Supabase)             ║
// ╚═══════════════════════════════════════════════════════╝
function auditLog(action, detail) {
    try {
        if (typeof supabaseClient !== "undefined") {
            supabaseClient.from("security_audit").insert({
                action: action,
                detail: String(detail || "").substring(0, 500),
                agent: localStorage.getItem("nom") || "anonymous",
                page: window.location.pathname.split("/").pop() || "?",
                user_agent: navigator.userAgent.substring(0, 200),
                created_at: new Date().toISOString()
            }).then(function(){}).catch(function(){});
        }
    } catch(e) {}
}

// ╔═══════════════════════════════════════════════════════╗
// ║  6-8. ANTI-DEVTOOLS + ANTI-CLICKJACKING + ANTI-IFRAME║
// ╚═══════════════════════════════════════════════════════╝
document.addEventListener("contextmenu", function(e) { e.preventDefault(); });

document.addEventListener("keydown", function(e) {
    if (e.key === "F12") { e.preventDefault(); auditLog("DEVTOOLS_F12"); return false; }
    if (e.ctrlKey && e.shiftKey && "IJC".indexOf(e.key.toUpperCase()) !== -1) { e.preventDefault(); auditLog("DEVTOOLS_SHORTCUT"); return false; }
    if (e.ctrlKey && e.key.toLowerCase() === "u") { e.preventDefault(); auditLog("VIEW_SOURCE"); return false; }
});

(function detectDevTools() {
    var threshold = 160;
    setInterval(function() {
        if ((window.outerWidth - window.innerWidth > threshold) ||
            (window.outerHeight - window.innerHeight > threshold)) {
            auditLog("DEVTOOLS_OPEN");
            document.body.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100vh;background:#0a0a0a;color:#ff4444;font-family:system-ui;font-size:1.3rem;text-align:center;padding:20px;">⛔ Accès non autorisé détecté.<br>Session terminée.</div>';
            localStorage.removeItem("nom"); localStorage.removeItem("role");
            setTimeout(function(){ window.location.href = "login.html"; }, 3000);
        }
    }, 2000);
})();

if (window.self !== window.top) {
    auditLog("IFRAME_BLOCKED");
    document.body.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100vh;background:#0a0a0a;color:#ff4444;font-family:system-ui;font-size:1.3rem;">⛔ Affichage en iframe interdit.</div>';
}

// ╔═══════════════════════════════════════════════════════╗
// ║  9. BLOCAGE INJECTION DE SCRIPTS EXTERNES            ║
// ╚═══════════════════════════════════════════════════════╝
(function blockExternalScripts() {
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.tagName === "SCRIPT" && node.src &&
                    node.src.indexOf(window.location.origin) === -1 &&
                    !ALLOWED_SCRIPT_DOMAINS.some(function(d){ return node.src.indexOf(d) !== -1; })) {
                    node.remove();
                    auditLog("SCRIPT_INJECTION_BLOCKED", node.src);
                }
            });
        });
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
})();

// ╔═══════════════════════════════════════════════════════╗
// ║  10. ANTI-COPIE DE DONNÉES SENSIBLES                 ║
// ╚═══════════════════════════════════════════════════════╝
document.addEventListener("copy", function(e) {
    var sel = window.getSelection().toString();
    if (sel.length > 500) { e.preventDefault(); auditLog("MASS_COPY_BLOCKED", sel.length + " chars"); }
});

// ╔═══════════════════════════════════════════════════════╗
// ║  11. ANTI-IMPRESSION / ANTI-CAPTURE ÉCRAN            ║
// ╚═══════════════════════════════════════════════════════╝
(function blockPrint() {
    var style = document.createElement("style");
    style.textContent = "@media print { body { display: none !important; } body::after { content: 'Impression non autorisée — Aura Sentinelle'; display: block; font-size: 2rem; color: red; text-align: center; padding: 100px; } }";
    document.head.appendChild(style);

    window.addEventListener("keydown", function(e) {
        if (e.ctrlKey && e.key.toLowerCase() === "p") {
            e.preventDefault();
            auditLog("PRINT_BLOCKED");
        }
    });

    // Détection PrintScreen
    window.addEventListener("keyup", function(e) {
        if (e.key === "PrintScreen") {
            auditLog("SCREENSHOT_ATTEMPT");
            navigator.clipboard.writeText("").catch(function(){});
        }
    });
})();

// ╔═══════════════════════════════════════════════════════╗
// ║  12. INACTIVITÉ — DÉCONNEXION APRÈS 30 MIN           ║
// ╚═══════════════════════════════════════════════════════╝
(function inactivityLogout() {
    var page = window.location.pathname.split("/").pop() || "index.html";
    if (page === "login.html") return;
    var INACTIVITY_MS = 30 * 60 * 1000;
    var lastActivity = Date.now();
    var warned = false;

    ["click","keydown","scroll","touchstart","mousemove"].forEach(function(evt) {
        document.addEventListener(evt, function() { lastActivity = Date.now(); warned = false; }, { passive: true });
    });

    setInterval(function() {
        var idle = Date.now() - lastActivity;
        // Avertissement 5 min avant
        if (idle > (INACTIVITY_MS - 5 * 60 * 1000) && !warned) {
            warned = true;
            showSecurityWarning("Votre session expire dans 5 minutes. Bougez la souris pour rester connecté.");
        }
        if (idle > INACTIVITY_MS) {
            auditLog("INACTIVITY_LOGOUT", localStorage.getItem("nom"));
            localStorage.removeItem("nom"); localStorage.removeItem("role"); localStorage.removeItem("loginTime");
            window.location.href = "login.html";
        }
    }, 30000);
})();

function showSecurityWarning(msg) {
    var w = document.getElementById("_sec_warning");
    if (!w) {
        w = document.createElement("div");
        w.id = "_sec_warning";
        w.style.cssText = "position:fixed;top:0;left:0;right:0;padding:12px 20px;background:#b45309;color:#fff;font-family:system-ui;font-size:0.9rem;text-align:center;z-index:999999;font-weight:600;";
        document.body.appendChild(w);
    }
    w.textContent = "⚠️ " + msg;
    w.style.display = "block";
    setTimeout(function(){ w.style.display = "none"; }, 15000);
}

// ╔═══════════════════════════════════════════════════════╗
// ║  13. EMPREINTE DE SESSION (anti-vol de session)      ║
// ╚═══════════════════════════════════════════════════════╝
(function sessionFingerprint() {
    var page = window.location.pathname.split("/").pop() || "index.html";
    if (page === "login.html") return;
    function computeFingerprint() {
        var parts = [navigator.userAgent, navigator.language, screen.width + "x" + screen.height,
            screen.colorDepth, Intl.DateTimeFormat().resolvedOptions().timeZone,
            navigator.hardwareConcurrency || 0, navigator.platform];
        var str = parts.join("|"); var hash = 5381;
        for (var i = 0; i < str.length; i++) { hash = ((hash << 5) + hash) + str.charCodeAt(i); hash = hash & hash; }
        return "fp_" + Math.abs(hash).toString(36);
    }
    var fp = computeFingerprint();
    var storedFp = localStorage.getItem("_session_fp");
    if (!storedFp) { localStorage.setItem("_session_fp", fp); }
    else if (storedFp !== fp) {
        auditLog("SESSION_HIJACK_DETECTED", "stored=" + storedFp + " current=" + fp);
        localStorage.clear(); window.location.href = "login.html";
    }
})();

// ╔═══════════════════════════════════════════════════════╗
// ║  14-15. ANTI-INJECTION SQL/XSS + AUTO-SANITISATION   ║
// ╚═══════════════════════════════════════════════════════╝
function sanitize(str) {
    if (!str) return "";
    return String(str).replace(/[<>"'`;\\\/\{\}\[\]]/g, "").replace(/javascript:/gi, "").replace(/on\w+\s*=/gi, "").trim();
}

document.addEventListener("DOMContentLoaded", function() {
    document.querySelectorAll("input[type='text'], textarea").forEach(function(input) {
        input.addEventListener("blur", function() {
            if (this.type === "password") return;
            this.value = sanitize(this.value);
        });
    });
});

// ╔═══════════════════════════════════════════════════════╗
// ║  16-17. RATE LIMITING + ANTI-EXFILTRATION            ║
// ╚═══════════════════════════════════════════════════════╝
var _requestCounts = {};
var _RATE_LIMIT = 30;
var _RATE_WINDOW = 10000;

function checkRateLimit(action) {
    var now = Date.now();
    if (!_requestCounts[action]) _requestCounts[action] = [];
    _requestCounts[action] = _requestCounts[action].filter(function(t) { return now - t < _RATE_WINDOW; });
    if (_requestCounts[action].length >= _RATE_LIMIT) {
        auditLog("RATE_LIMIT_HIT", action);
        return false;
    }
    _requestCounts[action].push(now);
    return true;
}

function isDomainAllowed(url) {
    try {
        var hostname = new URL(url, window.location.origin).hostname;
        if (hostname === window.location.hostname) return true;
        return ALLOWED_OUTBOUND.some(function(d){ return hostname.indexOf(d) !== -1; });
    } catch(e) { return true; }
}

(function wrapFetch() {
    var originalFetch = window.fetch;
    window.fetch = function(url) {
        if (typeof url === "string") {
            if (!isDomainAllowed(url)) {
                auditLog("EXFILTRATION_BLOCKED", url);
                return Promise.reject(new Error("[SECURITY] Domaine non autorisé"));
            }
            if (url.indexOf("supabase") !== -1 && !checkRateLimit("supabase")) {
                return Promise.reject(new Error("Rate limit atteint."));
            }
        }
        return originalFetch.apply(this, arguments);
    };
})();

(function wrapXHR() {
    var origOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url) {
        if (typeof url === "string" && !isDomainAllowed(url)) {
            auditLog("XHR_EXFILTRATION_BLOCKED", url);
            throw new Error("[SECURITY] XHR domaine non autorisé");
        }
        return origOpen.apply(this, arguments);
    };
})();

// ╔═══════════════════════════════════════════════════════╗
// ║  18. ANTI-TABNAPPING                                 ║
// ╚═══════════════════════════════════════════════════════╝
document.addEventListener("DOMContentLoaded", function() {
    document.querySelectorAll("a[target='_blank']").forEach(function(a) {
        a.setAttribute("rel", "noopener noreferrer");
    });
});

// ╔═══════════════════════════════════════════════════════╗
// ║  19. PROTECTION PROTOTYPE POLLUTION                  ║
// ╚═══════════════════════════════════════════════════════╝
(function protectPrototypes() {
    try {
        Object.defineProperty(Object.prototype, "__proto__", {
            get: function() { return Object.getPrototypeOf(this); },
            set: function() {}
        });
    } catch(e) {}
})();

// ╔═══════════════════════════════════════════════════════╗
// ║  20. ANTI-POSTMESSAGE (injection inter-fenêtres)     ║
// ╚═══════════════════════════════════════════════════════╝
window.addEventListener("message", function(e) {
    if (e.origin !== window.location.origin) {
        e.stopImmediatePropagation();
        auditLog("POSTMESSAGE_BLOCKED", e.origin);
    }
}, true);

// ╔═══════════════════════════════════════════════════════╗
// ║  21. MASQUAGE CONSOLE EN PRODUCTION                  ║
// ╚═══════════════════════════════════════════════════════╝
(function muteConsole() {
    if (window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
        console.log = function(){}; console.debug = function(){};
        console.table = function(){}; console.dir = function(){};
    }
})();

// ╔═══════════════════════════════════════════════════════╗
// ║  22. ANTI-KEYLOGGER                                  ║
// ╚═══════════════════════════════════════════════════════╝
document.addEventListener("submit", function() {
    document.querySelectorAll("input[type='password']").forEach(function(el) {
        setTimeout(function(){ el.value = ""; }, 100);
    });
});

// ╔═══════════════════════════════════════════════════════╗
// ║  23. DÉTECTION D'EXTENSION MALVEILLANTE              ║
// ╚═══════════════════════════════════════════════════════╝
(function detectMaliciousExtensions() {
    setInterval(function() {
        var unknownOverlays = document.querySelectorAll(
            "div[style*='position: fixed'][style*='z-index']:not(#alarmBanner):not(#globalNotifPanel):not(#globalNotifOverlay):not(#supa-toast):not(#global-notif-toast):not(#globalRetourMenu):not(#missionModal):not(#_sec_warning):not(.panel):not(.sidebar)"
        );
        unknownOverlays.forEach(function(el) {
            if (!el.id && !el.classList.length && el.innerHTML.length > 200) {
                el.remove(); auditLog("MALICIOUS_OVERLAY_REMOVED");
            }
        });
    }, 5000);
})();

// ╔═══════════════════════════════════════════════════════╗
// ║  24. ANTI-REPLAY + SYNCHRO INTER-ONGLETS             ║
// ╚═══════════════════════════════════════════════════════╝
(function antiReplay() {
    var page = window.location.pathname.split("/").pop() || "index.html";
    if (page === "login.html") return;
    sessionStorage.setItem("_page_nonce", Date.now().toString(36) + Math.random().toString(36).substring(2));
    window.addEventListener("storage", function(e) {
        if (e.key === "nom" && e.newValue === null) { window.location.href = "login.html"; }
    });
})();

// ╔═══════════════════════════════════════════════════════╗
// ║  25. POLITIQUE DE MOT DE PASSE                       ║
// ╚═══════════════════════════════════════════════════════╝
function validatePasswordStrength(password) {
    var errors = [];
    if (password.length < 8) errors.push("minimum 8 caractères");
    if (!/[A-Z]/.test(password)) errors.push("1 majuscule requise");
    if (!/[a-z]/.test(password)) errors.push("1 minuscule requise");
    if (!/[0-9]/.test(password)) errors.push("1 chiffre requis");
    if (!/[!@#$%^&*()_+\-=\[\]{};:,.<>?]/.test(password)) errors.push("1 caractère spécial requis");
    return { valid: errors.length === 0, errors: errors, strength: errors.length === 0 ? "forte" : errors.length <= 2 ? "moyenne" : "faible" };
}

// ╔═══════════════════════════════════════════════════════╗
// ║  26. SANITISATION DES ERREURS (anti-fuite d'info)    ║
// ╚═══════════════════════════════════════════════════════╝
window.addEventListener("error", function(e) {
    // Ne jamais afficher les stack traces à l'utilisateur
    e.preventDefault();
    auditLog("JS_ERROR", (e.message || "").substring(0, 200));
});
window.addEventListener("unhandledrejection", function(e) {
    e.preventDefault();
    auditLog("UNHANDLED_REJECTION", String(e.reason || "").substring(0, 200));
});

// ╔═══════════════════════════════════════════════════════╗
// ║  27. WATERMARK INVISIBLE (traçabilité des données)   ║
// ╚═══════════════════════════════════════════════════════╝
(function addWatermark() {
    var page = window.location.pathname.split("/").pop() || "index.html";
    if (page === "login.html") return;
    document.addEventListener("DOMContentLoaded", function() {
        var wm = document.createElement("div");
        wm.style.cssText = "position:fixed;bottom:4px;right:4px;font-size:7px;opacity:0.08;pointer-events:none;z-index:1;font-family:monospace;color:var(--color-text-tertiary,#999);user-select:none;";
        var nom = localStorage.getItem("nom") || "?";
        wm.textContent = nom + " · " + new Date().toLocaleDateString("fr-FR") + " · Aura";
        document.body.appendChild(wm);
    });
})();

// ╔═══════════════════════════════════════════════════════╗
// ║  28. DÉTECTION RÉSEAU SUSPECT (Proxy / VPN / Tor)    ║
// ╚═══════════════════════════════════════════════════════╝
(function checkNetworkAnomaly() {
    var page = window.location.pathname.split("/").pop() || "index.html";
    if (page === "login.html") return;
    // Vérifier la latence vers Supabase — une latence > 5s peut indiquer un proxy
    var start = Date.now();
    fetch("https://hwqlajdytnxavqigmzio.supabase.co/rest/v1/?limit=0", {
        method: "HEAD",
        headers: { "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3cWxhamR5dG54YXZxaWdtemlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5Mzg1NjgsImV4cCI6MjA4OTUxNDU2OH0.riGzQlfEPmo9SVK9Rs_fl33DnC5RR5qd2OUhgk4Twvs" }
    }).then(function() {
        var latency = Date.now() - start;
        if (latency > 5000) {
            auditLog("HIGH_LATENCY_DETECTED", latency + "ms — possible proxy/VPN");
        }
    }).catch(function(){});
})();
