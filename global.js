/* ---------------------------------------------------------
   🎨 SYNCHRONISATION DU THÈME GLOBAL
--------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);

    // ─── AUTO-INJECTION BOUTON RETOUR MENU ───
    injectRetourMenu();
});

/* ---------------------------------------------------------
   🎨 FONCTION GLOBALE POUR CHANGER LE THÈME
--------------------------------------------------------- */
function toggleTheme() {
    const html = document.documentElement;
    const current = html.getAttribute("data-theme");
    const next = current === "light" ? "dark" : "light";
    html.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
}

/* ---------------------------------------------------------
   🏠 INJECTION AUTOMATIQUE DU BOUTON RETOUR MENU
   S'injecte sur toutes les pages sauf index.html et login.html
--------------------------------------------------------- */
function injectRetourMenu() {
    const page = window.location.pathname.split("/").pop() || "index.html";
    if (page === "index.html" || page === "login.html" || page === "") return;

    // Ne pas dupliquer si un bouton existe déjà
    if (document.getElementById("globalRetourMenu")) return;

    const btn = document.createElement("button");
    btn.id = "globalRetourMenu";
    btn.innerHTML = "⟵ Retour au menu";
    btn.onclick = function() { window.location.href = "index.html"; };
    btn.style.cssText = `
        position: fixed;
        bottom: 24px;
        left: 24px;
        z-index: 99998;
        background: rgba(20, 20, 30, 0.92);
        color: #d4af37;
        border: 1px solid rgba(212, 175, 55, 0.35);
        padding: 12px 22px;
        border-radius: 14px;
        font-size: 0.92rem;
        font-weight: 600;
        cursor: pointer;
        backdrop-filter: blur(12px);
        box-shadow: 0 4px 20px rgba(0,0,0,0.4), 0 0 12px rgba(212,175,55,0.15);
        transition: all 0.3s ease;
        font-family: system-ui, -apple-system, sans-serif;
        letter-spacing: 0.02em;
    `;
    btn.addEventListener("mouseenter", function() {
        this.style.background = "#d4af37";
        this.style.color = "#000";
        this.style.transform = "translateY(-2px)";
        this.style.boxShadow = "0 6px 24px rgba(212,175,55,0.4)";
    });
    btn.addEventListener("mouseleave", function() {
        this.style.background = "rgba(20, 20, 30, 0.92)";
        this.style.color = "#d4af37";
        this.style.transform = "translateY(0)";
        this.style.boxShadow = "0 4px 20px rgba(0,0,0,0.4), 0 0 12px rgba(212,175,55,0.15)";
    });

    document.body.appendChild(btn);
}
