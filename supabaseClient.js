-- ═══════════════════════════════════════════════════════
--  TABLE NOTIFICATIONS — AURA SENTINELLE
--  À exécuter dans le SQL Editor de Supabase
-- ═══════════════════════════════════════════════════════

-- 1) Créer la table notifications
CREATE TABLE IF NOT EXISTS notifications (
    id          BIGSERIAL PRIMARY KEY,
    titre       TEXT NOT NULL DEFAULT '',
    message     TEXT NOT NULL DEFAULT '',
    type        TEXT NOT NULL DEFAULT 'info'
                CHECK (type IN ('info', 'alarme', 'intervention', 'alerte')),
    priorite    TEXT NOT NULL DEFAULT 'normale'
                CHECK (priorite IN ('normale', 'haute', 'critique')),
    emetteur    TEXT DEFAULT 'Système',
    emetteur_role TEXT DEFAULT 'système',
    visible_par TEXT[] DEFAULT ARRAY['agent', 'stationnaire', 'superviseur', 'admin'],
    lu          BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2) Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_lu ON notifications(lu);

-- 3) Activer le Realtime sur la table
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- 4) Politique RLS : tout le monde peut lire les notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tous les utilisateurs peuvent lire les notifications"
    ON notifications FOR SELECT
    USING (true);

CREATE POLICY "Les utilisateurs authentifiés peuvent créer des notifications"
    ON notifications FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Les admins peuvent mettre à jour les notifications"
    ON notifications FOR UPDATE
    USING (true);

-- 5) Nettoyage automatique des vieilles notifications (> 30 jours)
-- (optionnel — à activer via un cron Supabase ou une Edge Function)
-- DELETE FROM notifications WHERE created_at < NOW() - INTERVAL '30 days';

-- ═══════════════════════════════════════════════════════
--  FIN DE LA MIGRATION
-- ═══════════════════════════════════════════════════════
