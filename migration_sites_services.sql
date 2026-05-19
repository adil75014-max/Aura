-- ═══════════════════════════════════════════════════════════════
--  MIGRATION : tables sites & services + bootstrap super-admin
--  ----------------------------------------------------------------
--  À exécuter dans Supabase Studio → SQL Editor → New query.
--  Vérifie chaque section avant d'exécuter. Tout est idempotent.
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. Table `sites` ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.sites (
    code        TEXT PRIMARY KEY,
    nom         TEXT NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ─── 2. Table `services` ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.services (
    code        TEXT PRIMARY KEY,
    nom         TEXT NOT NULL,
    couleur     TEXT,
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ─── 3. Trigger updated_at (générique, réutilisable) ───────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sites_updated   ON public.sites;
DROP TRIGGER IF EXISTS trg_services_updated ON public.services;
CREATE TRIGGER trg_sites_updated    BEFORE UPDATE ON public.sites    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_services_updated BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── 4. Seed initial (valeurs hard-codées actuelles) ───────────
INSERT INTO public.sites (code, nom) VALUES
    ('LBM',  'Le Bon Marché'),
    ('SAM',  'Samaritaine'),
    ('GERD', 'La Grande Épicerie Rive Droite'),
    ('GERG', 'La Grande Épicerie Rive Gauche'),
    ('MH',   'Moët Hennessy')
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.services (code, nom, couleur) VALUES
    ('incendie',          'Sécurité Incendie', '#ef4444'),
    ('surete',            'Sûreté',            '#3b82f6'),
    ('technique',         'Technique',         '#f59e0b'),
    ('services_generaux', 'Services Généraux', '#10b981')
ON CONFLICT (code) DO NOTHING;

-- ─── 5. RLS : lecture publique, écriture sous responsabilité front ──
-- L'application utilise l'anon key + check côté client (rôle superadmin).
-- Pour durcir : remplacer la policy d'écriture par une vérification JWT
-- custom une fois que l'edge function login renverra un JWT signé.
ALTER TABLE public.sites    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sites_read_all"      ON public.sites;
DROP POLICY IF EXISTS "sites_write_all"     ON public.sites;
DROP POLICY IF EXISTS "services_read_all"   ON public.services;
DROP POLICY IF EXISTS "services_write_all"  ON public.services;

CREATE POLICY "sites_read_all"     ON public.sites    FOR SELECT USING (true);
CREATE POLICY "sites_write_all"    ON public.sites    FOR ALL    USING (true) WITH CHECK (true);
CREATE POLICY "services_read_all"  ON public.services FOR SELECT USING (true);
CREATE POLICY "services_write_all" ON public.services FOR ALL    USING (true) WITH CHECK (true);

-- ─── 6. BOOTSTRAP DU PREMIER SUPER-ADMIN ───────────────────────
-- Remplacer 'TON_NOM_UTILISATEUR' par le `nom` exact (case-sensitive)
-- d'un compte existant dans la table `users`. Une fois ce user promu,
-- il pourra promouvoir les suivants via l'UI (gestion_de_compte.html).
--
-- DÉCOMMENTER LA LIGNE SUIVANTE ET METTRE LE BON NOM AVANT D'EXÉCUTER :

-- UPDATE public.users SET role = 'superadmin' WHERE nom = 'TON_NOM_UTILISATEUR';

-- Vérifier ensuite :
-- SELECT id, nom, role, site_code, service FROM public.users WHERE role = 'superadmin';
