/* ---------------------------------------------------------
   🎨 SYNCHRONISATION DU THÈME GLOBAL
--------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
    injectRetourMenu();
    injectServiceBanner();
});

function toggleTheme() {
    const html = document.documentElement;
    const current = html.getAttribute("data-theme");
    const next = current === "light" ? "dark" : "light";
    html.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
}

/* ---------------------------------------------------------
   🏷️ BANNIÈRE SERVICE ACTIF
   
   Affiche en haut de chaque page une pastille indiquant
   service + site de l'utilisateur (cloisonnement visible).
   N'apparaît PAS sur login.html ni index.html (qui a déjà
   sa pastille intégrée au topbar).
--------------------------------------------------------- */
function injectServiceBanner() {
    const page = (window.location.pathname.split("/").pop() || "").toLowerCase();
    if (page === "login.html" || page === "index.html" || page === "") return;
    if (document.getElementById("auraServiceBanner")) return;

    // Lit le contexte tenant
    const site = (localStorage.getItem("site_code") || "").toUpperCase();
    const srv  = (localStorage.getItem("service")   || "").toLowerCase();
    if (!site && !srv) return; // pas connecté

    const sites = { "LBM":"LBM", "GERG":"GERG", "GERD":"GERD", "SAM":"SAM", "MH":"MH" };
    const services = {
        "incendie":          { label:"Sécurité Incendie",   color:"#ef4444" },
        "surete":            { label:"Sûreté",              color:"#3b82f6" },
        "technique":         { label:"Technique",           color:"#f59e0b" },
        "services_generaux": { label:"Services Généraux",   color:"#10b981" }
    };
    const cfg = services[srv] || { label: srv || "—", color: "#6b7280" };
    const siteLabel = sites[site] || site || "—";

    const banner = document.createElement("div");
    banner.id = "auraServiceBanner";
    banner.style.cssText = [
        "position:fixed", "top:0", "left:0", "right:0",
        "z-index:9998",
        "padding:5px 14px",
        "background:" + cfg.color,
        "color:#fff",
        "font-family:system-ui,-apple-system,sans-serif",
        "font-size:0.78rem",
        "font-weight:600",
        "letter-spacing:0.04em",
        "display:flex",
        "justify-content:space-between",
        "align-items:center",
        "box-shadow:0 1px 4px rgba(0,0,0,0.2)"
    ].join(";");

    banner.innerHTML =
        '<span>● ' + cfg.label + ' · ' + siteLabel + '</span>' +
        '<span style="opacity:0.85;font-size:0.72rem;">' +
            (localStorage.getItem("nom") || "") +
        '</span>';

    document.body.appendChild(banner);

    // Pousse le contenu de la page vers le bas pour ne pas masquer
    document.body.style.paddingTop = (parseInt(getComputedStyle(document.body).paddingTop) || 0) + 28 + "px";
}

/* ---------------------------------------------------------
   🏠 BOUTON RETOUR MENU — ZÉRO DOUBLON
   
   1) Si la page a déjà un lien/bouton vers index.html → NE RIEN FAIRE
   2) Sinon → injecter UN bouton dans le contenu (pas fixed)
--------------------------------------------------------- */
function injectRetourMenu() {
    const page = window.location.pathname.split("/").pop() || "index.html";
    if (page === "index.html" || page === "login.html" || page === "") return;
    if (page === "consulter_pf.html" && window.location.search.includes("pf=")) return;
    if (document.getElementById("globalRetourMenu")) return;

    // ── Chercher TOUT lien ou bouton existant pointant vers index.html ──
    const allLinks = document.querySelectorAll("a[href='index.html'], a[href='./index.html']");
    const allBtns = document.querySelectorAll(
        "button[onclick*='index.html'], .back-btn, .btn-back, .nav-back, .menu-return"
    );

    // Si un élément retour existe déjà → on le marque et on s'arrête
    if (allLinks.length > 0 || allBtns.length > 0) {
        const el = allLinks[0] || allBtns[0];
        el.id = "globalRetourMenu";
        return; // ← NE RIEN AJOUTER
    }

    // ── Aucun retour trouvé → injecter dans le contenu ──
    const container = document.querySelector(".page-container")
                   || document.querySelector(".container")
                   || document.querySelector("main")
                   || document.body;

    const bar = document.createElement("div");
    bar.id = "globalRetourMenu";
    bar.style.cssText = "padding:12px 0; margin-bottom:10px;";

    const link = document.createElement("a");
    link.href = "index.html";
    link.textContent = "⟵ Menu";
    link.style.cssText = [
        "color:#d4af37",
        "text-decoration:none",
        "font-size:0.9rem",
        "font-weight:600",
        "font-family:system-ui,-apple-system,sans-serif",
        "padding:8px 16px",
        "border:1px solid rgba(212,175,55,0.3)",
        "border-radius:10px",
        "background:rgba(20,20,30,0.85)",
        "transition:all 0.2s",
        "display:inline-block"
    ].join(";");

    link.addEventListener("mouseenter", function() {
        this.style.background = "#d4af37";
        this.style.color = "#000";
    });
    link.addEventListener("mouseleave", function() {
        this.style.background = "rgba(20,20,30,0.85)";
        this.style.color = "#d4af37";
    });

    bar.appendChild(link);
    container.insertBefore(bar, container.firstChild);
}

/* ---------------------------------------------------------
   🛡️ PROTECTION XSS — échappement HTML partagé
   ---------------------------------------------------------
   Toute donnée issue de la base (saisie par un utilisateur :
   nom, description, lieu, entreprise, commentaire, etc.) DOIT
   passer par escapeHtml() avant d'être injectée via innerHTML.
   Empêche l'exécution de code type <img src=x onerror=...>.
--------------------------------------------------------- */
function escapeHtml(value) {
    if (value === null || value === undefined) return "";
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}
// Alias court + exposition globale (les pages chargent global.js)
window.escapeHtml = escapeHtml;
window.esc = escapeHtml;

/* Échappe aussi pour un attribut entre guillemets simples ou doubles,
   utile dans les onclick="...('${val}')". À utiliser quand une valeur
   dynamique est placée dans un attribut HTML. */
function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, "&#96;");
}
window.escapeAttr = escapeAttr;
