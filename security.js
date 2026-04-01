// ===============================
//  SECURITY.JS — VERSION SUPABASE
// ===============================

// ⚠️ IMPORTANT : ce fichier suppose que supabaseClient
// est déjà chargé dans la page via supabaseClient.js

// --------------------------------------
// Récupérer l'utilisateur + son profil
// --------------------------------------
async function getCurrentUserAndProfile() {
    // 1) Récupérer l'utilisateur connecté
    const { data: userData, error: userError } = await supabaseClient.auth.getUser();

    if (userError || !userData.user) {
        return { user: null, profile: null };
    }

    const user = userData.user;

    // 2) Récupérer le profil associé
    const { data: profile, error: profileError } = await supabaseClient
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    if (profileError) {
        return { user, profile: null };
    }

    return { user, profile };
}

// --------------------------------------
// Exiger que l'utilisateur soit connecté
// --------------------------------------
async function requireLogin() {
    const { user, profile } = await getCurrentUserAndProfile();

    if (!user) {
        window.location.href = "login.html";
        return null;
    }

    return { user, profile };
}

// --------------------------------------
// Exiger un rôle spécifique
// --------------------------------------
async function requireRole(requiredRole) {
    const ctx = await requireLogin();
    if (!ctx) return null;

    const { profile } = ctx;

    if (!profile || profile.role !== requiredRole) {
        window.location.href = "unauthorized.html";
        return null;
    }

    return ctx;
}

// --------------------------------------
// Déconnexion
// --------------------------------------
async function logout() {
    await supabaseClient.auth.signOut();
    localStorage.removeItem("currentProfile");
    window.location.href = "login.html";
}