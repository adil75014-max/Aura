// ═══════════════════════════════════════════════════════════════
//  TENANT.JS v3 — Cloisonnement site_code + service + Super-admin
//  ----------------------------------------------------------------
//  Intercepte automatiquement les opérations Supabase sur les
//  tables tenant pour ajouter un filtre site_code + service.
//
//  Couvre :
//    .insert() / .upsert()  → enrichit les données
//    .select() / .update() / .delete() → ajoute .eq() en filtre
//
//  Échappatoires (admin global) :
//    client.fromAll("table")            → sans filtre (méthode dédiée)
//    AuraTenant.unscoped("table")       → alias équivalent
//    AuraTenant.bypassNext()            → bypass UNE requête .from()
//
//  ════ NOUVEAU v3 ═════════════════════════════════════════════
//  AuraTenant.patch(client)             → patche un client Supabase
//                                          créé après tenant.js
//                                          (utile pour supabaseFg
//                                          ou tout createClient
//                                          additionnel).
//  AuraTenant.realtimeFilter()          → renvoie une chaîne
//                                          "site_code=eq.LBM" prête
//                                          à mettre dans .on(...,
//                                          { filter: ... }).
//                                          Renvoie null si super-admin.
//  AuraTenant.isSuperAdmin              → bool
//  AuraTenant.switchContext(site, srv)  → bascule le contexte
//                                          super-admin (recharge).
//  AuraTenant.resetGlobalMode()         → super-admin → mode "voir
//                                          tout" (pas d'incarnation).
//  AuraTenant.loadCatalogues()          → async, charge sites + services
//                                          depuis BDD (tables `sites`
//                                          et `services`). Fallback sur
//                                          listes hard-codées si tables
//                                          inaccessibles. Cache 5 min.
//  AuraTenant.sites()                   → tableau {code, nom}
//  AuraTenant.services()                → tableau {code, nom, couleur}
//
//  Mode SUPER-ADMIN :
//    Détecté via localStorage.role === "superadmin".
//    Dans ce mode, si AUCUNE incarnation n'est active :
//      - aucun filtre auto sur les select/update/delete
//      - aucun enrichissement auto sur les insert/upsert
//      - tenant.js se comporte comme un no-op (sauf pour la BDD
//        catalogue sites/services).
//    Si une incarnation est active (localStorage.superadmin_incarne
//    contient "LBM|incendie"), le filtrage reprend mais en utilisant
//    le contexte incarné, pas le contexte personnel du super-admin.
// ═══════════════════════════════════════════════════════════════

(function () {
    "use strict";

    // ── 0. Constantes et fallback hard-codé ─────────────────────
    var FALLBACK_SITES = [
        { code: "LBM",  nom: "Le Bon Marché" },
        { code: "SAM",  nom: "Samaritaine" },
        { code: "GERD", nom: "La Grande Épicerie Rive Droite" },
        { code: "GERG", nom: "La Grande Épicerie Rive Gauche" },
        { code: "MH",   nom: "Moët Hennessy" },
        { code: "EBAG", nom: "Entrepôt Bagneux" }
    ];
    var FALLBACK_SERVICES = [
        { code: "incendie",          nom: "Sécurité Incendie", couleur: "#ef4444" },
        { code: "surete",            nom: "Sûreté",            couleur: "#3b82f6" },
        { code: "technique",         nom: "Technique",         couleur: "#f59e0b" },
        { code: "services_generaux", nom: "Services Généraux", couleur: "#10b981" }
    ];

    // ── 1. Contexte tenant (lu en localStorage) ─────────────────
    var ROLE = (localStorage.getItem("role") || "").toLowerCase();
    var IS_SUPERADMIN = (ROLE === "superadmin");

    // Super-admin peut "incarner" un tenant : valeur "LBM|incendie"
    var INCARNATION = localStorage.getItem("superadmin_incarne") || "";
    var INCARN_SITE = null, INCARN_SRV = null;
    if (IS_SUPERADMIN && INCARNATION.indexOf("|") !== -1) {
        var parts = INCARNATION.split("|");
        INCARN_SITE = (parts[0] || "").toUpperCase();
        INCARN_SRV  = (parts[1] || "").toLowerCase();
    }

    // Contexte effectif (utilisé pour filtrer/enrichir)
    var SITE = IS_SUPERADMIN
        ? (INCARN_SITE || null)
        : (localStorage.getItem("site_code") || "LBM").toUpperCase();
    var SERV = IS_SUPERADMIN
        ? (INCARN_SRV || null)
        : (localStorage.getItem("service")   || "incendie").toLowerCase();

    // Super-admin SANS incarnation = mode global "voir tout"
    var IS_GLOBAL_MODE = IS_SUPERADMIN && (!SITE || !SERV);

    var _bypassNext = false;

    // ── 2. Catalogues sites/services (cache mémoire) ────────────
    var _sitesCache = null, _srvCache = null, _cacheTs = 0;
    var CACHE_TTL_MS = 5 * 60 * 1000;

    async function loadCatalogues(force) {
        var now = Date.now();
        if (!force && _sitesCache && _srvCache && (now - _cacheTs) < CACHE_TTL_MS) {
            return { sites: _sitesCache, services: _srvCache };
        }
        var sites = FALLBACK_SITES.slice();
        var services = FALLBACK_SERVICES.slice();
        try {
            if (typeof window.supabaseClient !== "undefined" && window.supabaseClient) {
                // Bypass tenant pour ces lookups
                _bypassNext = true;
                var rs = await window.supabaseClient
                    .from("sites").select("code, nom").order("nom", { ascending: true });
                if (rs && rs.data && rs.data.length) {
                    sites = rs.data.map(function (r) { return { code: r.code, nom: r.nom }; });
                }
                _bypassNext = true;
                var rsv = await window.supabaseClient
                    .from("services").select("code, nom, couleur").order("nom", { ascending: true });
                if (rsv && rsv.data && rsv.data.length) {
                    services = rsv.data.map(function (r) {
                        return { code: r.code, nom: r.nom, couleur: r.couleur || "#6b7280" };
                    });
                }
            }
        } catch (e) {
            console.warn("[Tenant] Catalogue BDD inaccessible, fallback hard-codé:", e && e.message);
        }
        _sitesCache = sites;
        _srvCache   = services;
        _cacheTs    = Date.now();
        return { sites: sites, services: services };
    }

    // ── 3. API publique AuraTenant ──────────────────────────────
    function labelFor(siteCode, srvCode) {
        var siteName = siteCode;
        var srvName  = srvCode;
        if (_sitesCache) {
            for (var i = 0; i < _sitesCache.length; i++) {
                if (_sitesCache[i].code === siteCode) { siteName = _sitesCache[i].nom; break; }
            }
        } else {
            for (var j = 0; j < FALLBACK_SITES.length; j++) {
                if (FALLBACK_SITES[j].code === siteCode) { siteName = FALLBACK_SITES[j].nom; break; }
            }
        }
        if (_srvCache) {
            for (var k = 0; k < _srvCache.length; k++) {
                if (_srvCache[k].code === srvCode) { srvName = _srvCache[k].nom; break; }
            }
        } else {
            for (var m = 0; m < FALLBACK_SERVICES.length; m++) {
                if (FALLBACK_SERVICES[m].code === srvCode) { srvName = FALLBACK_SERVICES[m].nom; break; }
            }
        }
        return srvName + " · " + siteName;
    }

    function colorFor(srvCode) {
        var list = _srvCache || FALLBACK_SERVICES;
        for (var i = 0; i < list.length; i++) {
            if (list[i].code === srvCode) return list[i].couleur || "#6b7280";
        }
        return "#6b7280";
    }

    window.AuraTenant = {
        siteCode: SITE,
        service:  SERV,
        role:     ROLE,
        isSuperAdmin: IS_SUPERADMIN,
        isGlobalMode: IS_GLOBAL_MODE,
        incarnation:  INCARNATION,

        label: function () {
            if (IS_GLOBAL_MODE) return "🌐 Mode global (super-admin)";
            if (!SITE || !SERV) return "—";
            return labelFor(SITE, SERV);
        },
        color: function () {
            if (IS_GLOBAL_MODE) return "#a855f7"; // violet pour mode global
            return colorFor(SERV);
        },

        bypassNext: function () { _bypassNext = true; },
        unscoped: null,  // assigné plus bas

        // Patch d'un client Supabase créé après tenant.js
        patch: function (client) {
            try {
                if (client) patchClient(client);
            } catch (e) { console.warn("[Tenant] patch externe:", e); }
            return client;
        },

        // Filtre realtime côté Supabase pour les channels
        // Renvoie ex: "site_code=eq.LBM" — combiner avec ".eq.service.eq."
        // si tu veux un AND, mais Supabase realtime n'accepte qu'UN filtre.
        // On filtre donc par site_code et on laisse le client filtrer par service.
        // En mode global → null (pas de filtre).
        realtimeFilter: function () {
            if (IS_GLOBAL_MODE || !SITE) return null;
            return "site_code=eq." + SITE;
        },
        // Pour un filtrage client complémentaire des payloads realtime
        matchesRealtime: function (row) {
            if (!row) return true;
            if (IS_GLOBAL_MODE) return true;
            if (!SITE || !SERV) return true;
            if (row.site_code && row.site_code !== SITE) return false;
            if (row.service   && row.service   !== SERV) return false;
            return true;
        },

        switchContext: function (siteCode, srvCode) {
            if (!IS_SUPERADMIN) {
                console.warn("[Tenant] switchContext refusé : non super-admin");
                return;
            }
            localStorage.setItem("superadmin_incarne", siteCode + "|" + srvCode);
            // Aussi mettre à jour site_code/service pour rétrocompatibilité
            localStorage.setItem("site_code", siteCode);
            localStorage.setItem("service",   srvCode);
            window.location.reload();
        },
        resetGlobalMode: function () {
            if (!IS_SUPERADMIN) return;
            localStorage.removeItem("superadmin_incarne");
            localStorage.removeItem("site_code");
            localStorage.removeItem("service");
            window.location.reload();
        },

        loadCatalogues: loadCatalogues,
        sites:    function () { return (_sitesCache || FALLBACK_SITES).slice(); },
        services: function () { return (_srvCache   || FALLBACK_SERVICES).slice(); }
    };

    // ── 4. Tables soumises au cloisonnement ─────────────────────
    var TENANT_TABLES = [
        "rapports", "permis_feu", "dai_hors_service", "ssiap2_chantier",
        "feuille_de_garde", "consignes_permanentes", "consignes_journalieres",
        "notifications", "audit_log", "verifications", "verifications_types",
        "rondes", "interventions_exterieures", "suivi_travaux", "interventions",
        "rapport_modeles", "rapports_entree_sortie", "interventions_syope",
        "plan_prevention", "plans", "alertes_urgence", "ssiap", "controle_acces", "prets_materiel"
    ];

    // Tables JAMAIS filtrées
    var GLOBAL_TABLES = [
        "users", "login_attempts", "security_audit",
        "system_config", "profiles",
        "sites", "services"           // catalogues globaux
    ];

    function isTenantTable(name) {
        if (!name) return false;
        name = String(name).toLowerCase();
        if (GLOBAL_TABLES.indexOf(name) !== -1) return false;
        return TENANT_TABLES.indexOf(name) !== -1;
    }

    // ── 5. Enrichissement INSERT/UPSERT ─────────────────────────
    function enrichWithTenant(values) {
        if (!values) return values;
        if (Array.isArray(values)) return values.map(addFields);
        return addFields(values);
    }
    function addFields(obj) {
        if (!obj || typeof obj !== "object") return obj;
        var out = {};
        for (var k in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, k)) out[k] = obj[k];
        }
        if (SITE && (typeof out.site_code === "undefined" || out.site_code === null || out.site_code === "")) {
            out.site_code = SITE;
        }
        if (SERV && (typeof out.service === "undefined" || out.service === null || out.service === "")) {
            out.service = SERV;
        }
        return out;
    }

    // ── 6. Application des filtres ──────────────────────────────
    function applyTenantFilter(fb) {
        if (!fb || typeof fb.eq !== "function") return fb;
        if (!SITE || !SERV) return fb;
        try {
            fb = fb.eq("site_code", SITE);
            fb = fb.eq("service", SERV);
        } catch (e) { console.warn("[Tenant] applyFilter:", e); }
        return fb;
    }

    // ── 7. Patch sur un client Supabase ─────────────────────────
    function patchClient(client) {
        if (!client || client.__auraTenantPatched) return;
        var originalFrom = client.from.bind(client);

        client.fromAll = function (tableName) { return originalFrom(tableName); };
        // unscoped() exposé une seule fois (sur le premier patch)
        if (!window.AuraTenant.unscoped) {
            window.AuraTenant.unscoped = function (tableName) {
                if (window.supabaseClient && window.supabaseClient !== client) {
                    return window.supabaseClient.from
                        ? originalFrom(tableName)
                        : originalFrom(tableName);
                }
                return originalFrom(tableName);
            };
        }

        client.from = function (tableName) {
            var qb = originalFrom(tableName);

            // Cas où on n'a pas à filtrer :
            //   - mode global (super-admin sans incarnation)
            //   - table non-tenant ou bypass ponctuel
            if (IS_GLOBAL_MODE || !isTenantTable(tableName) || _bypassNext) {
                _bypassNext = false;
                return qb;
            }

            // SELECT
            if (typeof qb.select === "function") {
                var origSelect = qb.select.bind(qb);
                qb.select = function () {
                    var result = origSelect.apply(null, arguments);
                    return applyTenantFilter(result);
                };
            }
            // INSERT
            if (typeof qb.insert === "function") {
                var origInsert = qb.insert.bind(qb);
                qb.insert = function (values, options) {
                    return origInsert(enrichWithTenant(values), options);
                };
            }
            // UPSERT
            if (typeof qb.upsert === "function") {
                var origUpsert = qb.upsert.bind(qb);
                qb.upsert = function (values, options) {
                    return origUpsert(enrichWithTenant(values), options);
                };
            }
            // UPDATE
            if (typeof qb.update === "function") {
                var origUpdate = qb.update.bind(qb);
                qb.update = function (values, options) {
                    var result = origUpdate(values, options);
                    return applyTenantFilter(result);
                };
            }
            // DELETE
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

    // Filtre manuel exposé
    window.AuraTenant.filter = function (queryBuilder) {
        return applyTenantFilter(queryBuilder);
    };

    // ── 8. Lance le patch dès que possible ──────────────────────
    function tryPatch() {
        try {
            if (typeof window.supabaseClient !== "undefined" && window.supabaseClient) {
                patchClient(window.supabaseClient);
                // Charger catalogues en arrière-plan (best-effort, non bloquant)
                loadCatalogues().catch(function () {});
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

    console.info(
        "[Tenant v3] Mode :",
        IS_GLOBAL_MODE ? "🌐 SUPER-ADMIN GLOBAL"
                       : (IS_SUPERADMIN ? "👤 super-admin incarné " + SITE + "/" + SERV
                                        : "🔒 " + SITE + "/" + SERV)
    );
})();
