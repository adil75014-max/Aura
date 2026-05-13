// ═══════════════════════════════════════════════════════════════
//  TENANT.JS v2 — Cloisonnement complet site_code + service
//  ----------------------------------------------------------------
//  Intercepte AUTOMATIQUEMENT toutes les opérations Supabase sur
//  les tables tenant pour ajouter un filtre site_code + service.
//
//  Couvre :
//    .insert() / .upsert() → enrichit les données
//    .select() / .update() / .delete() → ajoute .eq() en filtre
//
//  Échappatoires (admin global) :
//    client.fromAll("table")            → sans filtre (méthode dédiée)
//    AuraTenant.unscoped("table")       → alias équivalent
//    AuraTenant.bypassNext()            → bypass UNE requête .from()
// ═══════════════════════════════════════════════════════════════

(function () {
    "use strict";

    // ── 1. Contexte tenant (lu en localStorage) ─────────────────
    var SITE = (localStorage.getItem("site_code") || "LBM").toUpperCase();
    var SERV = (localStorage.getItem("service")   || "incendie").toLowerCase();
    var _bypassNext = false;

    window.AuraTenant = {
        siteCode: SITE,
        service:  SERV,
        label: function () {
            var sites = { "LBM":"Le Bon Marché","SAM":"Samaritaine","GERD":"La Grande Épicerie Rive Droite","GERG":"La Grande Épicerie Rive Gauche","MH":"Moët Hennessy" };
            var services = { "incendie":"Sécurité Incendie","surete":"Sûreté","technique":"Technique","services_generaux":"Services Généraux" };
            return (services[SERV] || SERV) + " · " + (sites[SITE] || SITE);
        },
        color: function () {
            return ({ "incendie":"#ef4444","surete":"#3b82f6","technique":"#f59e0b","services_generaux":"#10b981" })[SERV] || "#6b7280";
        },
        // Bypass ponctuel — désactivé après le prochain .from()
        bypassNext: function () { _bypassNext = true; },
        unscoped: null   // assigné plus bas
    };

    // ── 2. Tables soumises au cloisonnement ─────────────────────
    var TENANT_TABLES = [
        // Données opérationnelles
        "rapports", "permis_feu", "dai_hors_service", "ssiap2_chantier",
        "feuille_de_garde", "consignes_permanentes", "consignes_journalieres",
        "notifications", "audit_log", "verifications", "verifications_types",
        "rondes", "interventions_exterieures", "suivi_travaux", "interventions",
        // Ajouts v2 — modèles et rapports spécifiques
        "rapport_modeles",        // Form Builder : modèles par service
        "rapports_entree_sortie", // Entrées/sorties par service
        "interventions_syope",    // Interventions médicales
        "plan_prevention", "plans",
        "alertes_urgence",        // Urgences cloisonnées par service
        "ssiap"
    ];

    // Tables JAMAIS filtrées
    var GLOBAL_TABLES = [
        "users",            // admins doivent voir tous les comptes
        "login_attempts",   // audit cross-tenant
        "security_audit",
        "system_config",
        "profiles"          // lookup utilisateurs (cross-service)
    ];

    function isTenantTable(name) {
        if (!name) return false;
        name = String(name).toLowerCase();
        if (GLOBAL_TABLES.indexOf(name) !== -1) return false;
        return TENANT_TABLES.indexOf(name) !== -1;
    }

    // ── 3. Enrichissement INSERT/UPSERT ─────────────────────────
    function enrichWithTenant(values) {
        if (!values) return values;
        if (Array.isArray(values)) {
            return values.map(function (v) { return addFields(v); });
        }
        return addFields(values);
    }

    function addFields(obj) {
        if (!obj || typeof obj !== "object") return obj;
        var out = {};
        for (var k in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, k)) out[k] = obj[k];
        }
        if (typeof out.site_code === "undefined" || out.site_code === null || out.site_code === "") {
            out.site_code = SITE;
        }
        if (typeof out.service === "undefined" || out.service === null || out.service === "") {
            out.service = SERV;
        }
        return out;
    }

    // ── 4. Application des filtres sur PostgrestFilterBuilder ───
    function applyTenantFilter(fb) {
        if (!fb || typeof fb.eq !== "function") return fb;
        try {
            fb = fb.eq("site_code", SITE);
            fb = fb.eq("service", SERV);
        } catch (e) { console.warn("[Tenant] applyFilter:", e); }
        return fb;
    }

    // ── 5. Monkey-patch supabaseClient.from() ───────────────────
    function patchClient(client) {
        if (!client || client.__auraTenantPatched) return;

        var originalFrom = client.from.bind(client);

        // Échappatoire : client.fromAll("table") → pas de filtre
        client.fromAll = function (tableName) {
            return originalFrom(tableName);
        };
        window.AuraTenant.unscoped = function (tableName) {
            return originalFrom(tableName);
        };

        client.from = function (tableName) {
            var qb = originalFrom(tableName);

            // Non-tenant ou bypass ponctuel → pas de patch
            if (!isTenantTable(tableName) || _bypassNext) {
                _bypassNext = false;
                return qb;
            }

            // SELECT ───────────────────────────────────────────
            if (typeof qb.select === "function") {
                var origSelect = qb.select.bind(qb);
                qb.select = function () {
                    var result = origSelect.apply(null, arguments);
                    return applyTenantFilter(result);
                };
            }

            // INSERT ───────────────────────────────────────────
            if (typeof qb.insert === "function") {
                var origInsert = qb.insert.bind(qb);
                qb.insert = function (values, options) {
                    return origInsert(enrichWithTenant(values), options);
                };
            }

            // UPSERT ───────────────────────────────────────────
            if (typeof qb.upsert === "function") {
                var origUpsert = qb.upsert.bind(qb);
                qb.upsert = function (values, options) {
                    return origUpsert(enrichWithTenant(values), options);
                };
            }

            // UPDATE ───────────────────────────────────────────
            if (typeof qb.update === "function") {
                var origUpdate = qb.update.bind(qb);
                qb.update = function (values, options) {
                    var result = origUpdate(values, options);
                    return applyTenantFilter(result);
                };
            }

            // DELETE ───────────────────────────────────────────
            if (typeof qb["delete"] === "function") {
                var origDelete = qb["delete"].bind(qb);
                qb["delete"] = function (options) {
                    var result = origDelete(options);
                    return applyTenantFilter(result);
                };
            }

            return qb;
        };

        client.__auraTenantPatched = true;
    }

    // ── 6. Helper pour filtrer manuellement ─────────────────────
    window.AuraTenant.filter = function (queryBuilder) {
        return applyTenantFilter(queryBuilder);
    };

    // ── 7. Lance le patch dès que possible ──────────────────────
    function tryPatch() {
        try {
            if (typeof window.supabaseClient !== "undefined" && window.supabaseClient) {
                patchClient(window.supabaseClient);
                return true;
            }
        } catch (e) {}
        return false;
    }

    if (!tryPatch()) {
        var attempts = 0;
        var interval = setInterval(function () {
            attempts++;
            if (tryPatch() || attempts > 30) clearInterval(interval);
        }, 100);
    }

    console.info("[Tenant v2] Cloisonnement actif :", SITE, "/", SERV);
})();
