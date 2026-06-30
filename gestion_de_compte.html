-- ═══════════════════════════════════════════════════════════════
--  MIGRATION : ajout du site « Entrepôt Bagneux » (code EBAG)
--  ----------------------------------------------------------------
--  À exécuter dans Supabase Studio → SQL Editor → New query.
--  Idempotent : ré-exécutable sans risque.
--  Pré-requis : la table `sites` et `services` existent déjà
--  (migration_sites_services.sql).
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. Le site ────────────────────────────────────────────────
INSERT INTO public.sites (code, nom) VALUES
    ('EBAG', 'Entrepôt Bagneux')
ON CONFLICT (code) DO UPDATE SET nom = EXCLUDED.nom;

-- ─── 2. Les services incendie + sûreté (au cas où ils manquent) ─
--  Ils sont globaux : un site n'a pas de liste de services dédiée,
--  toute combinaison site × service est valide dès que les deux
--  existent. On se contente donc de garantir leur présence.
INSERT INTO public.services (code, nom, couleur) VALUES
    ('incendie', 'Sécurité Incendie', '#ef4444'),
    ('surete',   'Sûreté',            '#3b82f6')
ON CONFLICT (code) DO NOTHING;

-- ─── 3. Vérification ───────────────────────────────────────────
SELECT code, nom FROM public.sites    WHERE code = 'EBAG';
SELECT code, nom FROM public.services WHERE code IN ('incendie', 'surete');

-- ═══════════════════════════════════════════════════════════════
--  ENSUITE (optionnel) : affecter un agent à ce site/service.
--  Soit via l'UI gestion_de_compte.html (recommandé), soit en SQL :
--
--    UPDATE public.users
--    SET site_code = 'EBAG', service = 'incendie'   -- ou 'surete'
--    WHERE nom = 'NOM_EXACT_DE_L_AGENT';
-- ═══════════════════════════════════════════════════════════════
