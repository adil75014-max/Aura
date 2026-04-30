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
