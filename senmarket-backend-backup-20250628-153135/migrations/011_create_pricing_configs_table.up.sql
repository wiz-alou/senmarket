-- Migration pour créer la table de configuration globale des prix et phases de monétisation

-- Créer la table pricing_configs
CREATE TABLE IF NOT EXISTS pricing_configs (
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
    last_modified_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Créer la configuration par défaut si elle n'existe pas
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
) 
SELECT 
    '2025-08-26 23:59:59',
    TRUE,
    '🎉 Phase de lancement - Annonces 100% gratuites !',
    FALSE,
    3,
    'Vous avez {remaining} annonce(s) gratuite(s) ce mois',
    FALSE,
    200.00,
    'XOF',
    100.00,
    50.00,
    800.00,
    1500.00
WHERE NOT EXISTS (SELECT 1 FROM pricing_configs);
