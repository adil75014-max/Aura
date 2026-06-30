// supabase/functions/bright-function/create-user.ts
// ─────────────────────────────────────────────────────────────────────────
//  CRÉATION DE COMPTE — VERSION DURCIE
//  Avant : n'importe qui connaissant l'URL pouvait POST {username,password,
//  role:"superadmin"} et se créer un compte superadmin (aucune vérification).
//  Maintenant : l'appelant DOIT prouver qu'il est admin en fournissant son
//  propre identifiant + mot de passe, vérifiés côté serveur (bcrypt) contre
//  la table users. Création de rôles privilégiés réservée au superadmin.
//
//  ⚠️ À déployer EN MÊME TEMPS que le patch de gestion_de_compte.html
//     (qui envoie désormais adminUser + adminPass).
// ─────────────────────────────────────────────────────────────────────────

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.0";
import bcrypt from "https://esm.sh/bcryptjs@2.4.3";

const URL = Deno.env.get("URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY")!;
const supabase = createClient(URL, SERVICE_ROLE_KEY);

const PRIVILEGED = ["admin", "superadmin"];

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function err(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), { status, headers });
}

// Échappe les jokers LIKE pour éviter qu'un nom avec % ou _ matche large
function likeSafe(s: string) {
  return s.replace(/[%_\\]/g, (m) => "\\" + m);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers });
  if (req.method !== "POST") return err("Méthode non autorisée", 405);

  try {
    const body = await req.json();
    const { adminUser, adminPass, username, password, role, site_code, service } = body;

    // ── 1. Authentification de l'appelant ──
    if (!adminUser || !adminPass) {
      return err("Authentification administrateur requise", 401);
    }
    const { data: admin, error: adminErr } = await supabase
      .from("users")
      .select("id, role, password_hash")
      .ilike("nom", likeSafe(adminUser))
      .limit(1)
      .maybeSingle();

    if (adminErr) { console.error("Lookup admin:", adminErr); return err("Erreur base de données", 500); }
    if (!admin || !admin.password_hash) return err("Identifiants administrateur invalides", 401);

    const adminOk = await bcrypt.compare(adminPass, admin.password_hash);
    if (!adminOk) return err("Identifiants administrateur invalides", 401);

    const callerRole = String(admin.role || "").toLowerCase();
    if (!PRIVILEGED.includes(callerRole)) return err("Droits insuffisants", 403);

    // ── 2. Autorisation sur le rôle demandé ──
    const wantedRole = role ? String(role).toLowerCase() : null;
    if (!username || !password) return err("Champs manquants", 400);
    // Seul un superadmin peut créer un compte admin ou superadmin
    if (wantedRole && PRIVILEGED.includes(wantedRole) && callerRole !== "superadmin") {
      return err("Seul un superadmin peut créer un compte privilégié", 403);
    }

    // ── 3. Création (service_role) — on pose aussi site_code/service ──
    const password_hash = await bcrypt.hash(password, 10);
    const { data, error } = await supabase
      .from("users")
      .insert({
        nom: username,
        password_hash,
        role: wantedRole,
        site_code: site_code || null,
        service: service || null,
      })
      .select("id, nom, role, site_code, service")
      .single();

    if (error) { console.error("Erreur Supabase:", error); return err("Erreur base de données", 500); }
    return new Response(JSON.stringify({ user: data }), { status: 201, headers });
  } catch (e) {
    console.error("Erreur interne:", e);
    return err("Erreur interne", 500);
  }
});
