// ============================================================
//  SUPABASE CLIENT — CONFIGURATION PARTAGÉE
//  Inclure ce fichier dans toutes les pages AVANT les scripts
// ============================================================

const SUPABASE_URL  = "https://hwqlajdytnxavqigmzio.supabase.co";
const SUPABASE_KEY  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3cWxhamR5dG54YXZxaWdtemlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5Mzg1NjgsImV4cCI6MjA4OTUxNDU2OH0.riGzQlfEPmo9SVK9Rs_fl33DnC5RR5qd2OUhgk4Twvs";

// Initialisation unique du client
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

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
