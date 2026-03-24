/* ---------------------------------------------------------
   🎨 SYNCHRONISATION DU THÈME GLOBAL
--------------------------------------------------------- */

// Applique automatiquement le thème sauvegardé
document.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
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