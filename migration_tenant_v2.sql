-- ═══════════════════════════════════════════════════════════════
-- MIGRATION TENANT v2 — Cloisonnement site_code + service
-- ----------------------------------------------------------------
-- À exécuter dans Supabase Dashboard → SQL Editor
-- ----------------------------------------------------------------
-- Ajoute les colonnes site_code + service à toutes les tables
-- opérationnelles, avec defaults LBM / incendie.
-- Crée les index pour des SELECT rapides.
-- Idempotent : peut être ré-exécuté sans risque.
-- ═══════════════════════════════════════════════════════════════

DO $$
DECLARE
    t TEXT;
    tables_tenant TEXT[] := ARRAY[
        'rapports','permis_feu','dai_hors_service','ssiap2_chantier',
        'feuille_de_garde','consignes_permanentes','consignes_journalieres',
        'notifications','audit_log','verifications','verifications_types',
        'rondes','interventions_exterieures','suivi_travaux','interventions',
        -- v2 additions
        'rapport_modeles','rapports_entree_sortie','interventions_syope',
        'plan_prevention','plans','alertes_urgence','ssiap'
    ];
BEGIN
    FOREACH t IN ARRAY tables_tenant LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables
                   WHERE table_schema='public' AND table_name=t) THEN
            -- Ajoute les colonnes si elles n'existent pas
            EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS site_code TEXT DEFAULT ''LBM''', t);
            EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS service   TEXT DEFAULT ''incendie''', t);

            -- Remplit les NULL avec les defaults (sinon invisibles dans les SELECT filtrés)
            EXECUTE format('UPDATE %I SET site_code = ''LBM''      WHERE site_code IS NULL', t);
            EXECUTE format('UPDATE %I SET service   = ''incendie'' WHERE service   IS NULL', t);

            -- Index composite pour SELECT rapides
            EXECUTE format(
                'CREATE INDEX IF NOT EXISTS idx_%I_tenant ON %I(site_code, service)',
                t, t
            );

            RAISE NOTICE '✓ Table % migrée', t;
        ELSE
            RAISE NOTICE '⚠ Table % introuvable (skipping)', t;
        END IF;
    END LOOP;
END $$;

-- ═══════════════════════════════════════════════════════════════
-- VÉRIFICATION POST-MIGRATION
-- ═══════════════════════════════════════════════════════════════

-- Liste toutes les tables qui ont maintenant site_code + service
SELECT
    table_name,
    BOOL_OR(column_name = 'site_code') AS has_site_code,
    BOOL_OR(column_name = 'service')   AS has_service
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name IN ('site_code', 'service')
GROUP BY table_name
ORDER BY table_name;

-- Compte les enregistrements par service (vérifie la répartition)
-- Décommenter et adapter pour chaque table :
-- SELECT service, site_code, COUNT(*) FROM rapports GROUP BY service, site_code;
