// ═══════════════════════════════════════════════════════════════
//  TENANT.JS — Filtrage automatique site_code + service
//  ----------------------------------------------------------------
//  Injecte automatiquement site_code et service sur tous les inserts
//  et upserts vers les tables tenant. Évite les fuites de données
//  entre sites (LBM/GERG/GERD/SAM/MH) et services (incendie/surete/
//  technique/services_generaux).
// ═══════════════════════════════════════════════════════════════

(function () {
    "use strict";

    // ── 1. Exposer le contexte tenant en lecture ────────────────
    var SITE  = (localStorage.getItem("site_code") || "LBM").toUpperCase();
    var SERV  = (localStorage.getItem("service")   || "incendie").toLowerCase();

    window.AuraTenant = {
        siteCode: SITE,
        service:  SERV,
        // Helpers
        label: function () {
            var sites = {
                "LBM":  "Le Bon Marché",
                "GERG": "Gerland Gauche",
                "GERD": "Gerland Droite",
                "SAM":  "Samaritaine",
                "MH":   "Mont-Hélios"
            };
            var services = {
                "incendie":          "Sécurité Incendie",
                "surete":            "Sûreté",
                "technique":         "Technique",
                "services_generaux": "Services Généraux"
            };
            return (services[SERV] || SERV) + " · " + (sites[SITE] || SITE);
        },
        color: function () {
            return ({
                "incendie":          "#ef4444",
                "surete":            "#3b82f6",
                "technique":         "#f59e0b",
                "services_generaux": "#10b981"
            })[SERV] || "#6b7280";
        }
    };

    // ── 2. Tables soumises au filtrage multi-tenant ─────────────
    var TENANT_TABLES = [
        "rapports", "permis_feu", "dai_hors_service", "ssiap2_chantier",
        "feuille_de_garde", "consignes_permanentes", "consignes_journalieres",
        "notifications", "audit_log", "verifications", "verifications_types",
        "rondes", "interventions_exterieures", "suivi_travaux", "interventions"
    ];
    // users a aussi site_code+service mais on ne le force PAS au filtre auto
    // (la gestion des comptes admin doit pouvoir voir tous les utilisateurs)

    function isTenantTable(name) {
        if (!name) return false;
        return TENANT_TABLES.indexOf(String(name).toLowerCase()) !== -1;
    }

    // ── 3. Monkey-patch supabaseClient.from() ───────────────────
    function patchClient(client) {
        if (!client || client.__auraTenantPatched) return;
        var originalFrom = client.from.bind(client);

        client.from = function (tableName) {
            var qb = originalFrom(tableName);

            if (!isTenantTable(tableName)) return qb;

            // Wrap insert
            if (typeof qb.insert === "function") {
                var origInsert = qb.insert.bind(qb);
                qb.insert = function (values, options) {
                    var enriched = enrichWithTenant(values);
                    return origInsert(enriched, options);
                };
            }

            // Wrap upsert
            if (typeof qb.upsert === "function") {
                var origUpsert = qb.upsert.bind(qb);
                qb.upsert = function (values, options) {
                    var enriched = enrichWithTenant(values);
                    return origUpsert(enriched, options);
                };
            }

            return qb;
        };

        client.__auraTenantPatched = true;
    }

    function enrichWithTenant(values) {
        if (!values) return values;
        if (Array.isArray(values)) {
            return values.map(function (v) { return addTenantFields(v); });
        }
        return addTenantFields(values);
    }

    function addTenantFields(obj) {
        if (!obj || typeof obj !== "object") return obj;
        var out = {};
        // Copier l'objet d'origine
        for (var k in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, k)) out[k] = obj[k];
        }
        // N'écrase pas si déjà fourni explicitement
        if (typeof out.site_code === "undefined" || out.site_code === null || out.site_code === "") {
            out.site_code = SITE;
        }
        if (typeof out.service === "undefined" || out.service === null || out.service === "") {
            out.service = SERV;
        }
        return out;
    }

    // ── 4. Patch dès que supabaseClient est disponible ──────────
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
        // Réessayer pendant 3 secondes si supabaseClient se charge plus tard
        var attempts = 0;
        var interval = setInterval(function () {
            attempts++;
            if (tryPatch() || attempts > 30) clearInterval(interval);
        }, 100);
    }

    // ── 5. Helper public pour ajouter des filtres aux SELECTs ───
    // Usage : AuraTenant.filter(client.from("rapports").select("*"))
    window.AuraTenant.filter = function (queryBuilder, opts) {
        opts = opts || {};
        try {
            if (typeof queryBuilder.eq === "function") {
                if (opts.siteOnly !== false) queryBuilder = queryBuilder.eq("site_code", SITE);
                if (opts.serviceOnly !== false) queryBuilder = queryBuilder.eq("service", SERV);
            }
        } catch (e) {}
        return queryBuilder;
    };

    console.info("[Tenant] Actif :", SITE, "/", SERV);
})();
