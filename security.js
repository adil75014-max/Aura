// ============================================================
//  SUPABASE CLIENT — CONFIGURATION PARTAGÉE
//  Inclure ce fichier dans toutes les pages AVANT les scripts
// ============================================================

// ============================================================
//  ⚙️  POINT UNIQUE DE CONFIGURATION
//  Pour migrer vers une autre instance Supabase, ne changez QUE
//  ces deux lignes (URL + clé anon). Tout le reste de l'app
//  (endpoints functions, contrôles réseau, 2e client…) en dérive.
// ============================================================

const SUPABASE_URL  = "https://hwqlajdytnxavqigmzio.supabase.co";
const SUPABASE_KEY  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3cWxhamR5dG54YXZxaWdtemlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5Mzg1NjgsImV4cCI6MjA4OTUxNDU2OH0.riGzQlfEPmo9SVK9Rs_fl33DnC5RR5qd2OUhgk4Twvs";

// ── Dérivés (ne pas modifier) ──
const SUPABASE_ANON_KEY = SUPABASE_KEY;                 // alias
const FUNCTIONS_BASE    = SUPABASE_URL + "/functions/v1";

// Exposition globale pour les pages/scripts isolés
if (typeof window !== "undefined") {
    window.SUPABASE_URL      = SUPABASE_URL;
    window.SUPABASE_KEY      = SUPABASE_KEY;
    window.SUPABASE_ANON_KEY = SUPABASE_KEY;
    window.FUNCTIONS_BASE    = FUNCTIONS_BASE;
    window.AURA_CONFIG       = { SUPABASE_URL, SUPABASE_ANON_KEY: SUPABASE_KEY, FUNCTIONS_BASE };
}

// Initialisation unique du client (tolérante : null si la lib supabase-js
// n'est pas chargée sur la page — utile pour les pages qui ne veulent que la config)
const supabaseClient = (typeof supabase !== "undefined" && supabase.createClient)
    ? supabase.createClient(SUPABASE_URL, SUPABASE_KEY)
    : null;

// ============================================================
//  HELPERS TOAST
// ============================================================
function showToast(msg, isError = false) {
    let t = document.getElementById("supa-toast");
    if (!t) {
        t = document.createElement("div");
        t.id = "supa-toast";
        t.style.cssText = `
            position:fixed;bottom:24px;right:24px;
            padding:14px 22px;border-radius:10px;
            font-size:0.95rem;z-index:99999;
            transform:translateY(100px);opacity:0;
            transition:all 0.4s;color:#fff;
            box-shadow:0 6px 20px rgba(0,0,0,0.4);
        `;
        document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.background = isError ? "#5f1e1e" : "#1e3a5f";
    t.style.transform = "translateY(0)";
    t.style.opacity = "1";
    setTimeout(() => { t.style.transform = "translateY(100px)"; t.style.opacity = "0"; }, 3500);
}

// ============================================================
//  HELPERS PROFIL
// ============================================================
async function getProfileName(profileId) {
    if (!profileId) return "—";
    const { data } = await supabaseClient
        .from("profiles")
        .select("nom, prenom")
        .eq("id", profileId)
        .single();
    if (data) return [data.prenom, data.nom].filter(Boolean).join(" ");
    return "—";
}

function getCurrentAgent() {
    return localStorage.getItem("nom") || "Inconnu";
}

function getCurrentRole() {
    return localStorage.getItem("role") || "agent";
}
