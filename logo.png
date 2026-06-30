-- ═══════════════════════════════════════════════════════════════
-- MIGRATION : Table service_menus
-- ----------------------------------------------------------------
-- À exécuter dans Supabase Dashboard → SQL Editor
-- ----------------------------------------------------------------
-- Permet à chaque admin d'éditer le menu de son service / site.
-- Si aucune entrée n'existe pour un service, le code retombe
-- automatiquement sur le menu hardcodé (default).
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS service_menus (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    site_code   TEXT NOT NULL,
    service     TEXT NOT NULL,
    menu_json   JSONB NOT NULL,
    updated_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_by  TEXT,
    UNIQUE (site_code, service)
);

-- Index pour lookup rapide
CREATE INDEX IF NOT EXISTS idx_service_menus_lookup
    ON service_menus(site_code, service);

-- Trigger : maintien automatique de updated_at
CREATE OR REPLACE FUNCTION update_service_menus_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_service_menus_timestamp ON service_menus;
CREATE TRIGGER trigger_service_menus_timestamp
    BEFORE UPDATE ON service_menus
    FOR EACH ROW
    EXECUTE FUNCTION update_service_menus_timestamp();

-- Vérification
SELECT 'Table service_menus créée' AS status;
