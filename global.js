/* ---------------------------------------------------------
   🎨 SYNCHRONISATION DU THÈME GLOBAL
--------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
    injectRetourMenu();
});

function toggleTheme() {
    const html = document.documentElement;
    const current = html.getAttribute("data-theme");
    const next = current === "light" ? "dark" : "light";
    html.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
}

/* ---------------------------------------------------------
   🏠 BOUTON RETOUR MENU — UN SEUL, SANS SUPERPOSITION
   
   Détecte TOUS les types de boutons retour existants :
     .back-btn, .menu-return button, boutons onclick→index.html
   Si trouvé : le transforme en "⟵ Menu → index.html"
   Sinon : injecte UNE barre non-fixe en haut du contenu
--------------------------------------------------------- */
function injectRetourMenu() {
    const page = window.location.pathname.split("/").pop() || "index.html";
    if (page === "index.html" || page === "login.html" || page === "") return;
    if (page === "consulter_pf.html" && window.location.search.includes("pf=")) return;
    if (document.getElementById("globalRetourMenu")) return;

    // ── Chercher un bouton retour existant (tous les patterns) ──
    const selectors = [
        ".back-btn",
        ".menu-return button",
        ".menu-return a",
        "button[onclick*='index.html']",
        "a[href='index.html']"
    ];

    let existing = null;
    for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (el) { existing = el; break; }
    }

    if (existing) {
        // Transformer le bouton existant
        existing.textContent = "⟵ Menu";
        existing.id = "globalRetourMenu";
        if (existing.tagName === "A") {
            existing.href = "index.html";
        } else {
            existing.onclick = function(e) { e.preventDefault(); window.location.href = "index.html"; };
        }
        return;
    }

    // ── Aucun bouton trouvé → injecter dans le contenu ──
    // Trouver le meilleur point d'insertion (pas dans un flex-body)
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
