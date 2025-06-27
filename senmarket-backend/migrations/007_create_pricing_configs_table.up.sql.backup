-- migrations/007_create_pricing_configs_table.up.sql
-- Migration pour créer la table de configuration globale des prix et phases de monétisation

-- Créer la table pricing_configs
CREATE TABLE pricing_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Phase 1: Lancement gratuit
    launch_phase_end_date TIMESTAMP NOT NULL DEFAULT '2025-08-26 23:59:59',
    is_launch_phase_active BOOLEAN DEFAULT TRUE NOT NULL,
    launch_phase_message TEXT DEFAULT '🎉 Phase de lancement - Annonces 100% gratuites !' NOT NULL,
    
    -- Phase 2: Système de crédits
    credit_system_active BOOLEAN DEFAULT FALSE NOT NULL,
    monthly_free_listings INTEGER DEFAULT 3 NOT NULL CHECK (monthly_free_listings >= 0),
    credit_system_message TEXT DEFAULT 'Vous avez {remaining} annonce(s) gratuite(s) ce mois' NOT NULL,
    
    -- Phase 3: Tarification complète
    paid_system_active BOOLEAN DEFAULT FALSE NOT NULL,
    
    -- Tarifs de base
    standard_listing_price DECIMAL(10,2) DEFAULT 200.00 NOT NULL CHECK (standard_listing_price >= 0),
    currency VARCHAR(3) DEFAULT 'XOF' NOT NULL,
    
    -- Options premium
    premium_boost_price DECIMAL(10,2) DEFAULT 100.00 NOT NULL CHECK (premium_boost_price >= 0),
    featured_color_price DECIMAL(10,2) DEFAULT 50.00 NOT NULL CHECK (featured_color_price >= 0),
    
    -- Packs promotionnels
    pack_5_listings_price DECIMAL(10,2) DEFAULT 800.00 NOT NULL CHECK (pack_5_listings_price >= 0),
    pack_10_listings_price DECIMAL(10,2) DEFAULT 1500.00 NOT NULL CHECK (pack_10_listings_price >= 0),
    pack_5_discount DECIMAL(5,2) DEFAULT 20.00 NOT NULL CHECK (pack_5_discount >= 0 AND pack_5_discount <= 100),
    pack_10_discount DECIMAL(5,2) DEFAULT 25.00 NOT NULL CHECK (pack_10_discount >= 0 AND pack_10_discount <= 100),
    
    -- Métadonnées
    last_modified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Contrainte : une seule configuration globale active
    CONSTRAINT single_global_config CHECK (id IS NOT NULL)
);

-- Ajouter des commentaires pour documentation
COMMENT ON TABLE pricing_configs IS 'Configuration globale des phases de monétisation et tarification';
COMMENT ON COLUMN pricing_configs.launch_phase_end_date IS 'Date de fin de la phase de lancement gratuit';
COMMENT ON COLUMN pricing_configs.is_launch_phase_active IS 'Si la phase de lancement est actuellement active';
COMMENT ON COLUMN pricing_configs.launch_phase_message IS 'Message affiché pendant la phase de lancement';
COMMENT ON COLUMN pricing_configs.credit_system_active IS 'Si le système de crédits mensuels est actif';
COMMENT ON COLUMN pricing_configs.monthly_free_listings IS 'Nombre d''annonces gratuites par mois en phase 2';
COMMENT ON COLUMN pricing_configs.paid_system_active IS 'Si le système payant complet est actif';
COMMENT ON COLUMN pricing_configs.standard_listing_price IS 'Prix d''une annonce standard en FCFA';
COMMENT ON COLUMN pricing_configs.premium_boost_price IS 'Prix pour mettre en avant une annonce';
COMMENT ON COLUMN pricing_configs.featured_color_price IS 'Prix pour la mise en couleur';
COMMENT ON COLUMN pricing_configs.pack_5_listings_price IS 'Prix du pack 5 annonces';
COMMENT ON COLUMN pricing_configs.pack_10_listings_price IS 'Prix du pack 10 annonces';
COMMENT ON COLUMN pricing_configs.pack_5_discount IS 'Pourcentage de remise pack 5';
COMMENT ON COLUMN pricing_configs.pack_10_discount IS 'Pourcentage de remise pack 10';

-- Index pour optimiser les requêtes
CREATE INDEX idx_pricing_configs_phases ON pricing_configs(is_launch_phase_active, credit_system_active, paid_system_active);
CREATE INDEX idx_pricing_configs_launch_date ON pricing_configs(launch_phase_end_date);
CREATE INDEX idx_pricing_configs_modified ON pricing_configs(last_modified_by, updated_at DESC);

-- Trigger pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_pricing_configs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    
    -- Recalculer automatiquement les remises des packs
    IF NEW.standard_listing_price > 0 THEN
        -- Pack 5: remise par rapport au prix unitaire
        IF NEW.pack_5_listings_price < (NEW.standard_listing_price * 5) THEN
            NEW.pack_5_discount = ROUND(
                ((NEW.standard_listing_price * 5 - NEW.pack_5_listings_price) / (NEW.standard_listing_price * 5)) * 100, 
                2
            );
        ELSE
            NEW.pack_5_discount = 0;
        END IF;
        
        -- Pack 10: remise par rapport au prix unitaire
        IF NEW.pack_10_listings_price < (NEW.standard_listing_price * 10) THEN
            NEW.pack_10_discount = ROUND(
                ((NEW.standard_listing_price * 10 - NEW.pack_10_listings_price) / (NEW.standard_listing_price * 10)) * 100, 
                2
            );
        ELSE
            NEW.pack_10_discount = 0;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_pricing_configs_updated_at
    BEFORE UPDATE ON pricing_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_pricing_configs_updated_at();

-- Fonction pour obtenir la configuration globale actuelle
CREATE OR REPLACE FUNCTION get_global_pricing_config()
RETURNS pricing_configs AS $$
DECLARE
    config pricing_configs;
BEGIN
    SELECT * INTO config FROM pricing_configs LIMIT 1;
    
    -- Si aucune configuration n'existe, créer la configuration par défaut
    IF config IS NULL THEN
        INSERT INTO pricing_configs DEFAULT VALUES RETURNING * INTO config;
    END IF;
    
    RETURN config;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour vérifier si la phase de lancement est active
CREATE OR REPLACE FUNCTION is_launch_phase_active()
RETURNS BOOLEAN AS $$
DECLARE
    config pricing_configs;
BEGIN
    config := get_global_pricing_config();
    
    RETURN config.is_launch_phase_active AND CURRENT_TIMESTAMP < config.launch_phase_end_date;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir la phase actuelle
CREATE OR REPLACE FUNCTION get_current_monetization_phase()
RETURNS VARCHAR(20) AS $$
DECLARE
    config pricing_configs;
BEGIN
    config := get_global_pricing_config();
    
    -- Phase 1: Lancement gratuit
    IF config.is_launch_phase_active AND CURRENT_TIMESTAMP < config.launch_phase_end_date THEN
        RETURN 'launch';
    END IF;
    
    -- Phase 2: Système de crédits
    IF config.credit_system_active AND NOT config.paid_system_active THEN
        RETURN 'credit_system';
    END IF;
    
    -- Phase 3: Système payant complet
    IF config.paid_system_active THEN
        RETURN 'paid_system';
    END IF;
    
    -- Par défaut, retourner à la phase de crédits
    RETURN 'credit_system';
END;
$$ LANGUAGE plpgsql;

-- Fonction pour faire la transition vers la phase suivante
CREATE OR REPLACE FUNCTION transition_to_next_phase(admin_user_id UUID DEFAULT NULL)
RETURNS TEXT AS $$
DECLARE
    config pricing_configs;
    current_phase VARCHAR(20);
    new_phase VARCHAR(20);
BEGIN
    config := get_global_pricing_config();
    current_phase := get_current_monetization_phase();
    
    CASE current_phase
        WHEN 'launch' THEN
            -- Passer à la phase de crédits
            UPDATE pricing_configs SET
                is_launch_phase_active = FALSE,
                credit_system_active = TRUE,
                last_modified_by = admin_user_id,
                updated_at = CURRENT_TIMESTAMP;
            new_phase := 'credit_system';
            
        WHEN 'credit_system' THEN
            -- Passer à la phase payante complète
            UPDATE pricing_configs SET
                credit_system_active = FALSE,
                paid_system_active = TRUE,
                last_modified_by = admin_user_id,
                updated_at = CURRENT_TIMESTAMP;
            new_phase := 'paid_system';
            
        ELSE
            RETURN 'Déjà à la phase finale';
    END CASE;
    
    -- Logger la transition
    INSERT INTO system_logs (operation, details, created_at)
    VALUES ('phase_transition', 
            'Transition de ' || current_phase || ' vers ' || new_phase || 
            CASE WHEN admin_user_id IS NOT NULL THEN ' par admin ' || admin_user_id ELSE '' END,
            CURRENT_TIMESTAMP);
    
    RETURN 'Transition réussie de ' || current_phase || ' vers ' || new_phase;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour prolonger la phase de lancement
CREATE OR REPLACE FUNCTION extend_launch_phase(new_end_date TIMESTAMP, admin_user_id UUID DEFAULT NULL)
RETURNS TEXT AS $$
BEGIN
    IF new_end_date <= CURRENT_TIMESTAMP THEN
        RETURN 'Erreur: La nouvelle date doit être dans le futur';
    END IF;
    
    UPDATE pricing_configs SET
        launch_phase_end_date = new_end_date,
        is_launch_phase_active = TRUE,
        last_modified_by = admin_user_id,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Logger l'extension
    INSERT INTO system_logs (operation, details, created_at)
    VALUES ('extend_launch_phase', 
            'Phase de lancement prolongée jusqu''au ' || new_end_date ||
            CASE WHEN admin_user_id IS NOT NULL THEN ' par admin ' || admin_user_id ELSE '' END,
            CURRENT_TIMESTAMP);
    
    RETURN 'Phase de lancement prolongée jusqu''au ' || new_end_date;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour mettre à jour les tarifs
CREATE OR REPLACE FUNCTION update_pricing(
    new_standard_price DECIMAL DEFAULT NULL,
    new_premium_boost_price DECIMAL DEFAULT NULL,
    new_featured_color_price DECIMAL DEFAULT NULL,
    new_pack_5_price DECIMAL DEFAULT NULL,
    new_pack_10_price DECIMAL DEFAULT NULL,
    admin_user_id UUID DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
    updates_count INTEGER := 0;
    changes TEXT := '';
BEGIN
    -- Construire la requête de mise à jour dynamiquement
    IF new_standard_price IS NOT NULL THEN
        UPDATE pricing_configs SET standard_listing_price = new_standard_price;
        updates_count := updates_count + 1;
        changes := changes || 'prix_standard=' || new_standard_price || ' ';
    END IF;
    
    IF new_premium_boost_price IS NOT NULL THEN
        UPDATE pricing_configs SET premium_boost_price = new_premium_boost_price;
        updates_count := updates_count + 1;
        changes := changes || 'boost=' || new_premium_boost_price || ' ';
    END IF;
    
    IF new_featured_color_price IS NOT NULL THEN
        UPDATE pricing_configs SET featured_color_price = new_featured_color_price;
        updates_count := updates_count + 1;
        changes := changes || 'couleur=' || new_featured_color_price || ' ';
    END IF;
    
    IF new_pack_5_price IS NOT NULL THEN
        UPDATE pricing_configs SET pack_5_listings_price = new_pack_5_price;
        updates_count := updates_count + 1;
        changes := changes || 'pack5=' || new_pack_5_price || ' ';
    END IF;
    
    IF new_pack_10_price IS NOT NULL THEN
        UPDATE pricing_configs SET pack_10_listings_price = new_pack_10_price;
        updates_count := updates_count + 1;
        changes := changes || 'pack10=' || new_pack_10_price || ' ';
    END IF;
    
    -- Mettre à jour les métadonnées
    IF updates_count > 0 THEN
        UPDATE pricing_configs SET
            last_modified_by = admin_user_id,
            updated_at = CURRENT_TIMESTAMP;
        
        -- Logger les changements
        INSERT INTO system_logs (operation, details, created_at)
        VALUES ('update_pricing', 
                TRIM(changes) || 
                CASE WHEN admin_user_id IS NOT NULL THEN ' par admin ' || admin_user_id ELSE '' END,
                CURRENT_TIMESTAMP);
        
        RETURN updates_count || ' tarif(s) mis à jour: ' || TRIM(changes);
    ELSE
        RETURN 'Aucun tarif à mettre à jour';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Vue pour faciliter les requêtes sur la configuration actuelle
CREATE VIEW current_pricing_info AS
SELECT 
    *,
    get_current_monetization_phase() AS current_phase,
    is_launch_phase_active() AS is_launch_currently_active,
    CASE 
        WHEN is_launch_phase_active() THEN 
            EXTRACT(EPOCH FROM (launch_phase_end_date - CURRENT_TIMESTAMP))/86400
        ELSE 0 
    END AS days_until_launch_end,
    
    -- Calculs des économies des packs
    (standard_listing_price * 5) - pack_5_listings_price AS pack_5_savings,
    (standard_listing_price * 10) - pack_10_listings_price AS pack_10_savings,
    
    -- Prix par annonce dans les packs
    ROUND(pack_5_listings_price / 5, 2) AS pack_5_price_per_listing,
    ROUND(pack_10_listings_price / 10, 2) AS pack_10_price_per_listing
FROM pricing_configs;

-- Créer la configuration par défaut
INSERT INTO pricing_configs (
    launch_phase_end_date,
    is_launch_phase_active,
    launch_phase_message,
    credit_system_active,
    monthly_free_listings,
    credit_system_message,
    paid_system_active,
    standard_listing_price,
    currency,
    premium_boost_price,
    featured_color_price,
    pack_5_listings_price,
    pack_10_listings_price
) VALUES (
    '2025-08-26 23:59:59',  -- Date de fin du lancement
    TRUE,                    -- Phase de lancement active
    '🎉 Phase de lancement - Annonces 100% gratuites !',
    FALSE,                   -- Système de crédits pas encore actif
    3,                       -- 3 annonces gratuites par mois
    'Vous avez {remaining} annonce(s) gratuite(s) ce mois',
    FALSE,                   -- Système payant pas encore actif
    200.00,                  -- Prix standard 200 FCFA
    'XOF',                   -- Devise
    100.00,                  -- Boost premium +100 FCFA
    50.00,                   -- Couleur featured +50 FCFA
    800.00,                  -- Pack 5 annonces
    1500.00                  -- Pack 10 annonces
) ON CONFLICT DO NOTHING;

-- Logger la création de la configuration
INSERT INTO system_logs (operation, details, created_at)
VALUES ('create_pricing_config', 'Configuration de tarification initiale créée', CURRENT_TIMESTAMP);