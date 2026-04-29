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
   🏠 BOUTON RETOUR MENU — EN HAUT À GAUCHE
   Un seul bouton, injecté sur toutes les pages sauf index et login
--------------------------------------------------------- */
function injectRetourMenu() {
    const page = window.location.pathname.split("/").pop() || "index.html";
    if (page === "index.html" || page === "login.html" || page === "") return;

    // Ne pas dupliquer
    if (document.getElementById("globalRetourMenu")) return;

    const btn = document.createElement("a");
    btn.id = "globalRetourMenu";
    btn.href = "index.html";
    btn.innerHTML = "⟵ Menu";
    btn.style.cssText = [
        "position:fixed",
        "top:16px",
        "left:16px",
        "z-index:99998",
        "background:rgba(20,20,30,0.92)",
        "color:#d4af37",
        "border:1px solid rgba(212,175,55,0.35)",
        "padding:10px 18px",
        "border-radius:12px",
        "font-size:0.88rem",
        "font-weight:600",
        "cursor:pointer",
        "backdrop-filter:blur(12px)",
        "box-shadow:0 4px 16px rgba(0,0,0,0.35),0 0 10px rgba(212,175,55,0.12)",
        "transition:all 0.25s ease",
        "font-family:system-ui,-apple-system,sans-serif",
        "text-decoration:none",
        "letter-spacing:0.02em"
    ].join(";");

    btn.addEventListener("mouseenter", function() {
        this.style.background = "#d4af37";
        this.style.color = "#000";
        this.style.transform = "translateY(-1px)";
        this.style.boxShadow = "0 6px 20px rgba(212,175,55,0.35)";
    });
    btn.addEventListener("mouseleave", function() {
        this.style.background = "rgba(20,20,30,0.92)";
        this.style.color = "#d4af37";
        this.style.transform = "translateY(0)";
        this.style.boxShadow = "0 4px 16px rgba(0,0,0,0.35),0 0 10px rgba(212,175,55,0.12)";
    });

    document.body.appendChild(btn);
}
