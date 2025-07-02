-- ===============================================
-- TRANSITIONS COMPLÈTES ENTRE PHASES SENMARKET
-- Guide de référence pour basculer entre phases
-- ===============================================

-- ===============================================
-- 1. PHASE 1 → PHASE 2 (Gratuit → 3 annonces/mois)
-- ===============================================
UPDATE pricing_configs SET 
    is_launch_phase_active = FALSE,
    credit_system_active = TRUE,
    paid_system_active = FALSE;

-- ===============================================
-- 2. PHASE 2 → PHASE 1 (3 annonces/mois → Gratuit)
-- ===============================================
UPDATE pricing_configs SET 
    is_launch_phase_active = TRUE,
    credit_system_active = FALSE,
    paid_system_active = FALSE;

-- ===============================================
-- 3. PHASE 2 → PHASE 3 (3 annonces/mois → Tout payant)
-- ===============================================
UPDATE pricing_configs SET 
    is_launch_phase_active = FALSE,
    credit_system_active = FALSE,
    paid_system_active = TRUE;

-- ===============================================
-- 4. PHASE 3 → PHASE 2 (Tout payant → 3 annonces/mois)
-- ===============================================
UPDATE pricing_configs SET 
    is_launch_phase_active = FALSE,
    credit_system_active = TRUE,
    paid_system_active = FALSE;

-- ===============================================
-- 5. PHASE 3 → PHASE 1 (Tout payant → Gratuit - Direct)
-- ===============================================
UPDATE pricing_configs SET 
    is_launch_phase_active = TRUE,
    credit_system_active = FALSE,
    paid_system_active = FALSE;

-- ===============================================
-- 6. PHASE 1 → PHASE 3 (Gratuit → Tout payant - Direct)
-- ===============================================
UPDATE pricing_configs SET 
    is_launch_phase_active = FALSE,
    credit_system_active = FALSE,
    paid_system_active = TRUE;

-- ===============================================
-- COMMANDES DE VÉRIFICATION
-- ===============================================

-- Voir la phase actuelle
SELECT 
    CASE 
        WHEN is_launch_phase_active THEN '🟢 PHASE 1 - GRATUIT ILLIMITÉ'
        WHEN credit_system_active THEN '🟡 PHASE 2 - 3 GRATUITES/MOIS'
        WHEN paid_system_active THEN '🔴 PHASE 3 - TOUT PAYANT'
        ELSE '❓ PHASE INCONNUE'
    END as phase_actuelle,
    is_launch_phase_active,
    credit_system_active,
    paid_system_active,
    monthly_free_listings,
    standard_listing_price,
    currency
FROM pricing_configs;

-- Voir l'état utilisateur
SELECT 
    phone,
    onboarding_phase,
    free_listings_used,
    free_listings_limit,
    (free_listings_limit - free_listings_used) as restantes
FROM users 
WHERE phone = '+221777080757';

-- Voir les annonces et leurs statuts
SELECT 
    title,
    status,
    created_at,
    CASE 
        WHEN status = 'active' THEN '✅ PUBLIÉE'
        WHEN status = 'draft' THEN '📝 BROUILLON'
        ELSE status
    END as statut_lisible
FROM listings 
WHERE user_id = (SELECT id FROM users WHERE phone = '+221777080757')
ORDER BY created_at DESC
LIMIT 5;

-- ===============================================
-- SYNCHRONISATION UTILISATEUR AVEC PHASE
-- ===============================================

-- Mettre l'utilisateur en phase correspondante (PHASE 1)
UPDATE users SET 
    onboarding_phase = 'free_launch',
    registration_phase = 'launch',
    free_listings_used = 0,
    free_listings_limit = 999
WHERE phone = '+221777080757'
AND (SELECT is_launch_phase_active FROM pricing_configs LIMIT 1) = TRUE;

-- Mettre l'utilisateur en phase correspondante (PHASE 2)
UPDATE users SET 
    onboarding_phase = 'credit_system',
    free_listings_limit = 3
WHERE phone = '+221777080757'
AND (SELECT credit_system_active FROM pricing_configs LIMIT 1) = TRUE;

-- Mettre l'utilisateur en phase correspondante (PHASE 3)
UPDATE users SET 
    onboarding_phase = 'paid'
WHERE phone = '+221777080757'
AND (SELECT paid_system_active FROM pricing_configs LIMIT 1) = TRUE;

-- ===============================================
-- GESTION DES ANNONCES SELON LA PHASE
-- ===============================================

-- Publier toutes les annonces en brouillon (PHASE 1)
UPDATE listings 
SET status = 'active'
WHERE user_id = (SELECT id FROM users WHERE phone = '+221777080757')
AND status = 'draft'
AND (SELECT is_launch_phase_active FROM pricing_configs LIMIT 1) = TRUE;

-- Remettre en brouillon les annonces excédentaires (PHASE 2/3)
-- (Cette commande est plus complexe, à utiliser avec précaution)

-- ===============================================
-- RACCOURCIS RAPIDES POUR TESTS
-- ===============================================

-- Retour rapide à PHASE 1 (développement)
UPDATE pricing_configs SET is_launch_phase_active = TRUE, credit_system_active = FALSE, paid_system_active = FALSE;
UPDATE users SET onboarding_phase = 'free_launch', free_listings_used = 0 WHERE phone = '+221777080757';
UPDATE listings SET status = 'active' WHERE user_id = (SELECT id FROM users WHERE phone = '+221777080757') AND status = 'draft';

-- Test PHASE 2
UPDATE pricing_configs SET is_launch_phase_active = FALSE, credit_system_active = TRUE, paid_system_active = FALSE;
UPDATE users SET onboarding_phase = 'credit_system', free_listings_limit = 3 WHERE phone = '+221777080757';

-- Test PHASE 3
UPDATE pricing_configs SET is_launch_phase_active = FALSE, credit_system_active = FALSE, paid_system_active = TRUE;
UPDATE users SET onboarding_phase = 'paid' WHERE phone = '+221777080757';

-- ===============================================
-- RÉSUMÉ DES PHASES
-- ===============================================

/*
🟢 PHASE 1 - Lancement gratuit
   - Annonces illimitées gratuites
   - Toutes créées avec status = 'active'
   - Quota non consommé

🟡 PHASE 2 - Système de crédits  
   - 3 annonces gratuites/mois
   - 3 premières: status = 'active'
   - 4ème+: status = 'draft' (paiement requis)

🔴 PHASE 3 - Système payant
   - Toutes les annonces payantes
   - Toutes créées avec status = 'draft'
   - Publication après paiement uniquement
*/