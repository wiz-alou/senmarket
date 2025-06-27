-- migrations/005_add_user_quota_fields.up.sql
-- Migration pour ajouter les champs de quotas et phases de monétisation aux utilisateurs

-- Ajouter les nouveaux champs à la table users
ALTER TABLE users 
ADD COLUMN free_listings_used INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN free_listings_limit INTEGER DEFAULT 3 NOT NULL,
ADD COLUMN last_free_reset TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
ADD COLUMN total_listings_count INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN premium_expires_at TIMESTAMP NULL,
ADD COLUMN onboarding_phase VARCHAR(50) DEFAULT 'free_launch' NOT NULL,
ADD COLUMN registration_phase VARCHAR(50) DEFAULT 'launch' NOT NULL;

-- Ajouter des commentaires pour documentation
COMMENT ON COLUMN users.free_listings_used IS 'Nombre d''annonces gratuites utilisées ce mois';
COMMENT ON COLUMN users.free_listings_limit IS 'Limite d''annonces gratuites par mois (défaut: 3)';
COMMENT ON COLUMN users.last_free_reset IS 'Dernière réinitialisation du quota mensuel';
COMMENT ON COLUMN users.total_listings_count IS 'Nombre total d''annonces créées par l''utilisateur';
COMMENT ON COLUMN users.premium_expires_at IS 'Date d''expiration du statut premium (pour packs futurs)';
COMMENT ON COLUMN users.onboarding_phase IS 'Phase actuelle: free_launch, credit_system, paid';
COMMENT ON COLUMN users.registration_phase IS 'Phase lors de l''inscription: launch, transition, paid';

-- Créer des index pour optimiser les performances
CREATE INDEX idx_users_onboarding_phase ON users(onboarding_phase);
CREATE INDEX idx_users_registration_phase ON users(registration_phase);
CREATE INDEX idx_users_last_free_reset ON users(last_free_reset);
CREATE INDEX idx_users_premium_expires ON users(premium_expires_at) WHERE premium_expires_at IS NOT NULL;

-- Index composé pour les requêtes de quotas
CREATE INDEX idx_users_quota_lookup ON users(onboarding_phase, free_listings_used, free_listings_limit);

-- Contraintes de validation
ALTER TABLE users ADD CONSTRAINT chk_free_listings_used_positive 
    CHECK (free_listings_used >= 0);

ALTER TABLE users ADD CONSTRAINT chk_free_listings_limit_positive 
    CHECK (free_listings_limit >= 0);

ALTER TABLE users ADD CONSTRAINT chk_total_listings_count_positive 
    CHECK (total_listings_count >= 0);

ALTER TABLE users ADD CONSTRAINT chk_onboarding_phase_valid 
    CHECK (onboarding_phase IN ('free_launch', 'credit_system', 'paid'));

ALTER TABLE users ADD CONSTRAINT chk_registration_phase_valid 
    CHECK (registration_phase IN ('launch', 'transition', 'paid'));

-- Mise à jour des utilisateurs existants
-- Tous les utilisateurs existants sont considérés comme étant en phase de lancement
UPDATE users SET 
    free_listings_used = 0,
    free_listings_limit = 3,
    last_free_reset = CURRENT_TIMESTAMP,
    total_listings_count = COALESCE((
        SELECT COUNT(*) 
        FROM listings 
        WHERE listings.user_id = users.id 
        AND listings.deleted_at IS NULL
    ), 0),
    onboarding_phase = 'free_launch',
    registration_phase = 'launch'
WHERE 
    free_listings_used IS NULL 
    OR onboarding_phase IS NULL 
    OR registration_phase IS NULL;

-- Fonction pour réinitialiser automatiquement les quotas mensuels
CREATE OR REPLACE FUNCTION reset_monthly_quotas()
RETURNS INTEGER AS $$
DECLARE
    affected_rows INTEGER;
BEGIN
    -- Réinitialiser les quotas pour les utilisateurs dont le dernier reset
    -- est antérieur au début du mois actuel
    UPDATE users 
    SET 
        free_listings_used = 0,
        last_free_reset = CURRENT_TIMESTAMP
    WHERE 
        onboarding_phase != 'free_launch' 
        AND DATE_TRUNC('month', last_free_reset) < DATE_TRUNC('month', CURRENT_TIMESTAMP);
    
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    
    -- Log de l'opération
    INSERT INTO system_logs (operation, affected_rows, created_at) 
    VALUES ('reset_monthly_quotas', affected_rows, CURRENT_TIMESTAMP);
    
    RETURN affected_rows;
END;
$$ LANGUAGE plpgsql;

-- Table pour les logs système (si elle n'existe pas déjà)
CREATE TABLE IF NOT EXISTS system_logs (
    id SERIAL PRIMARY KEY,
    operation VARCHAR(100) NOT NULL,
    affected_rows INTEGER DEFAULT 0,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour les logs
CREATE INDEX IF NOT EXISTS idx_system_logs_operation ON system_logs(operation);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at DESC);