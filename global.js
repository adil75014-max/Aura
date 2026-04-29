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
   🏠 BOUTON RETOUR MENU — SANS SUPERPOSITION
   Stratégie :
     1) Pages exclues : index.html, login.html
     2) Si la page a déjà un .back-btn → on le transforme en "⟵ Menu → index.html"
     3) Sinon → on injecte une barre fine NON-FIXE en haut de page
--------------------------------------------------------- */
function injectRetourMenu() {
    const page = window.location.pathname.split("/").pop() || "index.html";
    if (page === "index.html" || page === "login.html" || page === "") return;
    // Pas de retour menu sur accès QR code (mode lecture seule)
    if (page === "consulter_pf.html" && window.location.search.includes("pf=")) return;
    if (document.getElementById("globalRetourMenu")) return;

    // ── Cas 1 : la page a déjà un bouton .back-btn → on le réutilise
    const existingBack = document.querySelector(".back-btn");
    if (existingBack) {
        existingBack.textContent = "⟵ Menu";
        existingBack.onclick = function(e) { e.preventDefault(); window.location.href = "index.html"; };
        if (existingBack.tagName === "A") existingBack.href = "index.html";
        existingBack.id = "globalRetourMenu";
        return;
    }

    // ── Cas 2 : pas de back-btn → injecter une barre en haut de page
    const bar = document.createElement("div");
    bar.id = "globalRetourMenu";
    bar.style.cssText = [
        "width:100%",
        "padding:10px 16px",
        "background:rgba(15,15,25,0.95)",
        "border-bottom:1px solid rgba(212,175,55,0.2)",
        "display:flex",
        "align-items:center",
        "z-index:9999",
        "box-sizing:border-box",
        "backdrop-filter:blur(10px)"
    ].join(";");

    const link = document.createElement("a");
    link.href = "index.html";
    link.textContent = "⟵ Menu";
    link.style.cssText = [
        "color:#d4af37",
        "text-decoration:none",
        "font-size:0.9rem",
        "font-weight:600",
        "font-family:system-ui,-apple-system,sans-serif",
        "padding:4px 14px",
        "border:1px solid rgba(212,175,55,0.3)",
        "border-radius:10px",
        "transition:all 0.2s"
    ].join(";");

    link.addEventListener("mouseenter", function() {
        this.style.background = "#d4af37";
        this.style.color = "#000";
    });
    link.addEventListener("mouseleave", function() {
        this.style.background = "transparent";
        this.style.color = "#d4af37";
    });

    bar.appendChild(link);
    document.body.insertBefore(bar, document.body.firstChild);
}
