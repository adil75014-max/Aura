/* ---------------------------------------------------------
   🎨 THEME GLOBAL (clair / sombre)
--------------------------------------------------------- */

:root {
    --transition: 0.25s ease;
}

/* 🌞 MODE CLAIR */
html[data-theme="light"] {
    --bg: #f3f4f6;
    --bg2: rgba(255,255,255,0.8);
    --text: #111827;
    --card: #ffffff;
    --border: rgba(0,0,0,0.08);
    --shadow: 0 4px 10px rgba(0,0,0,0.06);
    --accent: #d4af37;
}

/* 🌙 MODE SOMBRE */
html[data-theme="dark"] {
    --bg: #111827;
    --bg2: rgba(31,41,55,0.9);
    --text: #e5e7eb;
    --card: #1f2933;
    --border: rgba(249,250,251,0.08);
    --shadow: none;
    --accent: #9ca3af;
}

/* ---------------------------------------------------------
   🧱 STYLE GLOBAL
--------------------------------------------------------- */

body {
    background: var(--bg);
    color: var(--text);
    font-family: system-ui, sans-serif;
    transition: background var(--transition), color var(--transition);
    padding: 20px;
}

/* ---------------------------------------------------------
   🧩 CARTES (style identique à l’index)
--------------------------------------------------------- */

.card {
    background: var(--card);
    border: 1px solid var(--border);
    padding: 20px;
    border-radius: 14px;
    margin-bottom: 20px;
    box-shadow: var(--shadow);
    transition: transform .2s ease, border-color .2s ease;
}

.card:hover {
    transform: translateY(-4px);
    border-color: var(--accent);
}

/* ---------------------------------------------------------
   🔘 BOUTONS
--------------------------------------------------------- */

button {
    background: var(--bg2);
    border: 1px solid var(--border);
    padding: 8px 14px;
    border-radius: 8px;
    color: var(--text);
    cursor: pointer;
    transition: background var(--transition), color var(--transition), border var(--transition);
}

button:hover {
    background: var(--accent);
    color: #000;
}

/* ---------------------------------------------------------
   📱 RESPONSIVE
--------------------------------------------------------- */

@media (max-width: 480px) {
    body {
        padding: 14px;
    }

    .card {
        padding: 16px;
        border-radius: 12px;
    }

    button {
        padding: 6px 12px;
        font-size: 0.85rem;
    }
}