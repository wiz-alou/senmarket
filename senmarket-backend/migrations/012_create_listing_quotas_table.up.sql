-- migrations/006_create_listing_quotas_table.up.sql
-- Migration pour créer la table des quotas mensuels d'annonces par utilisateur

-- Créer la table listing_quotas
CREATE TABLE listing_quotas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL CHECK (year >= 2025),
    free_listings_used INTEGER DEFAULT 0 NOT NULL CHECK (free_listings_used >= 0),
    free_listings_limit INTEGER DEFAULT 3 NOT NULL CHECK (free_listings_limit >= 0),
    paid_listings INTEGER DEFAULT 0 NOT NULL CHECK (paid_listings >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Contrainte d'unicité : un seul quota par utilisateur/mois/année
    UNIQUE(user_id, month, year)
);

-- Ajouter des commentaires pour documentation
COMMENT ON TABLE listing_quotas IS 'Quotas mensuels d''annonces par utilisateur';
COMMENT ON COLUMN listing_quotas.user_id IS 'Référence vers l''utilisateur';
COMMENT ON COLUMN listing_quotas.month IS 'Mois (1-12)';
COMMENT ON COLUMN listing_quotas.year IS 'Année (2025+)';
COMMENT ON COLUMN listing_quotas.free_listings_used IS 'Nombre d''annonces gratuites utilisées ce mois';
COMMENT ON COLUMN listing_quotas.free_listings_limit IS 'Limite d''annonces gratuites pour ce mois';
COMMENT ON COLUMN listing_quotas.paid_listings IS 'Nombre d''annonces payées ce mois';

-- Index principaux pour les performances
CREATE INDEX idx_listing_quotas_user_id ON listing_quotas(user_id);
CREATE INDEX idx_listing_quotas_period ON listing_quotas(year DESC, month DESC);
CREATE INDEX idx_listing_quotas_user_period ON listing_quotas(user_id, year DESC, month DESC);

-- Index pour les requêtes de nettoyage des anciens quotas
CREATE INDEX idx_listing_quotas_cleanup ON listing_quotas(year, month) 
WHERE year < EXTRACT(YEAR FROM CURRENT_DATE) 
   OR (year = EXTRACT(YEAR FROM CURRENT_DATE) AND month < EXTRACT(MONTH FROM CURRENT_DATE));

-- Index composé pour les requêtes d'éligibilité
CREATE INDEX idx_listing_quotas_eligibility ON listing_quotas(user_id, free_listings_used, free_listings_limit)
WHERE year = EXTRACT(YEAR FROM CURRENT_DATE) AND month = EXTRACT(MONTH FROM CURRENT_DATE);

-- Trigger pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_listing_quotas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_listing_quotas_updated_at
    BEFORE UPDATE ON listing_quotas
    FOR EACH ROW
    EXECUTE FUNCTION update_listing_quotas_updated_at();

-- Fonction pour obtenir ou créer un quota pour la période actuelle
CREATE OR REPLACE FUNCTION get_or_create_current_quota(p_user_id UUID)
RETURNS UUID AS $$
DECLARE
    quota_id UUID;
    current_month INTEGER := EXTRACT(MONTH FROM CURRENT_DATE);
    current_year INTEGER := EXTRACT(YEAR FROM CURRENT_DATE);
BEGIN
    -- Essayer de récupérer le quota existant
    SELECT id INTO quota_id
    FROM listing_quotas
    WHERE user_id = p_user_id 
      AND month = current_month 
      AND year = current_year;
    
    -- Si pas trouvé, créer un nouveau quota
    IF quota_id IS NULL THEN
        INSERT INTO listing_quotas (user_id, month, year, free_listings_used, free_listings_limit, paid_listings)
        VALUES (p_user_id, current_month, current_year, 0, 3, 0)
        RETURNING id INTO quota_id;
    END IF;
    
    RETURN quota_id;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour consommer une annonce gratuite
CREATE OR REPLACE FUNCTION consume_free_listing(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    quota_id UUID;
    current_used INTEGER;
    current_limit INTEGER;
BEGIN
    -- Obtenir ou créer le quota pour le mois actuel
    quota_id := get_or_create_current_quota(p_user_id);
    
    -- Vérifier la disponibilité
    SELECT free_listings_used, free_listings_limit
    INTO current_used, current_limit
    FROM listing_quotas
    WHERE id = quota_id;
    
    -- Si quota épuisé, retourner false
    IF current_used >= current_limit THEN
        RETURN FALSE;
    END IF;
    
    -- Consommer une annonce gratuite
    UPDATE listing_quotas
    SET free_listings_used = free_listings_used + 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = quota_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour ajouter une annonce payée
CREATE OR REPLACE FUNCTION add_paid_listing(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
    quota_id UUID;
BEGIN
    -- Obtenir ou créer le quota pour le mois actuel
    quota_id := get_or_create_current_quota(p_user_id);
    
    -- Incrémenter le compteur d'annonces payées
    UPDATE listing_quotas
    SET paid_listings = paid_listings + 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = quota_id;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour nettoyer les anciens quotas (> 12 mois)
CREATE OR REPLACE FUNCTION cleanup_old_quotas()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
    cutoff_date DATE;
BEGIN
    -- Calculer la date limite (12 mois en arrière)
    cutoff_date := DATE_TRUNC('month', CURRENT_DATE - INTERVAL '12 months');
    
    -- Supprimer les quotas anciens
    DELETE FROM listing_quotas
    WHERE (year < EXTRACT(YEAR FROM cutoff_date))
       OR (year = EXTRACT(YEAR FROM cutoff_date) AND month < EXTRACT(MONTH FROM cutoff_date));
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Logger l'opération
    INSERT INTO system_logs (operation, affected_rows, details, created_at)
    VALUES ('cleanup_old_quotas', deleted_count, 
            'Suppression quotas antérieurs à ' || cutoff_date::text, 
            CURRENT_TIMESTAMP);
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Vue pour faciliter les requêtes sur les quotas actuels
CREATE VIEW current_user_quotas AS
SELECT 
    lq.*,
    u.first_name,
    u.last_name,
    u.phone,
    u.onboarding_phase,
    (lq.free_listings_limit - lq.free_listings_used) AS remaining_free,
    (lq.free_listings_used + lq.paid_listings) AS total_listings_this_month,
    CASE 
        WHEN lq.free_listings_limit > 0 THEN 
            ROUND((lq.free_listings_used::DECIMAL / lq.free_listings_limit) * 100, 2)
        ELSE 0 
    END AS quota_usage_percent
FROM listing_quotas lq
JOIN users u ON lq.user_id = u.id
WHERE lq.year = EXTRACT(YEAR FROM CURRENT_DATE)
  AND lq.month = EXTRACT(MONTH FROM CURRENT_DATE);

-- Index sur la vue
CREATE INDEX idx_current_user_quotas_user_id ON listing_quotas(user_id)
WHERE year = EXTRACT(YEAR FROM CURRENT_DATE) AND month = EXTRACT(MONTH FROM CURRENT_DATE);

-- Fonction pour générer des statistiques mensuelles
CREATE OR REPLACE FUNCTION get_monthly_quota_stats(p_year INTEGER DEFAULT NULL, p_month INTEGER DEFAULT NULL)
RETURNS JSON AS $$
DECLARE
    target_year INTEGER := COALESCE(p_year, EXTRACT(YEAR FROM CURRENT_DATE));
    target_month INTEGER := COALESCE(p_month, EXTRACT(MONTH FROM CURRENT_DATE));
    stats JSON;
BEGIN
    SELECT json_build_object(
        'period', target_month || '/' || target_year,
        'total_users_with_quotas', COUNT(*),
        'total_free_listings_used', SUM(free_listings_used),
        'total_paid_listings', SUM(paid_listings),
        'total_listings', SUM(free_listings_used + paid_listings),
        'average_free_usage', ROUND(AVG(free_listings_used), 2),
        'users_at_quota_limit', COUNT(*) FILTER (WHERE free_listings_used >= free_listings_limit),
        'quota_utilization_rate', ROUND(
            (SUM(free_listings_used)::DECIMAL / NULLIF(SUM(free_listings_limit), 0)) * 100, 2
        )
    ) INTO stats
    FROM listing_quotas
    WHERE year = target_year AND month = target_month;
    
    RETURN COALESCE(stats, '{"error": "No data found"}'::json);
END;
$$ LANGUAGE plpgsql;

-- Créer des quotas pour les utilisateurs existants qui ont des annonces
INSERT INTO listing_quotas (user_id, month, year, free_listings_used, free_listings_limit, paid_listings)
SELECT DISTINCT
    l.user_id,
    EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER,
    EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER,
    0, -- free_listings_used (on commence à 0 pour le mois actuel)
    3, -- free_listings_limit (valeur par défaut)
    0  -- paid_listings (on commence à 0)
FROM listings l
JOIN users u ON l.user_id = u.id
WHERE l.deleted_at IS NULL
  AND NOT EXISTS (
      SELECT 1 FROM listing_quotas lq 
      WHERE lq.user_id = l.user_id 
        AND lq.month = EXTRACT(MONTH FROM CURRENT_DATE)
        AND lq.year = EXTRACT(YEAR FROM CURRENT_DATE)
  )
ON CONFLICT (user_id, month, year) DO NOTHING;