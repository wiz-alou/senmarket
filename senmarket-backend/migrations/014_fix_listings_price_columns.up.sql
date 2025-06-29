-- migrations/014_fix_listings_price_columns.up.sql
-- Migration pour corriger les colonnes de prix dans la table listings

-- 1. Ajouter les nouvelles colonnes price_amount et price_currency
ALTER TABLE listings 
ADD COLUMN price_amount DECIMAL(12,2),
ADD COLUMN price_currency VARCHAR(3) DEFAULT 'XOF';

-- 2. Migrer les données existantes
UPDATE listings 
SET price_amount = price, 
    price_currency = COALESCE(currency, 'XOF');

-- 3. Rendre les nouvelles colonnes NOT NULL après migration des données
ALTER TABLE listings 
ALTER COLUMN price_amount SET NOT NULL,
ALTER COLUMN price_currency SET NOT NULL;

-- 4. Supprimer les anciennes colonnes
ALTER TABLE listings 
DROP COLUMN IF EXISTS price,
DROP COLUMN IF EXISTS currency;

-- 5. Ajouter les nouvelles colonnes manquantes si nécessaire
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS contacts_count INTEGER DEFAULT 0;

-- 6. Renommer is_featured en is_promoted si nécessaire
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'listings' AND column_name = 'is_featured') THEN
        ALTER TABLE listings RENAME COLUMN is_featured TO is_promoted;
    END IF;
END $$;

-- 7. Créer les index pour les nouvelles colonnes
CREATE INDEX IF NOT EXISTS idx_listings_price_amount ON listings(price_amount) 
WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_listings_price_currency ON listings(price_currency);

CREATE INDEX IF NOT EXISTS idx_listings_is_paid ON listings(is_paid);

-- 8. Mettre à jour les contraintes
ALTER TABLE listings 
ADD CONSTRAINT chk_price_amount_positive CHECK (price_amount >= 0),
ADD CONSTRAINT chk_price_currency_valid CHECK (price_currency IN ('XOF', 'EUR', 'USD'));

-- 9. Commentaires pour documentation
COMMENT ON COLUMN listings.price_amount IS 'Montant du prix en décimal';
COMMENT ON COLUMN listings.price_currency IS 'Devise du prix (XOF, EUR, USD)';
COMMENT ON COLUMN listings.is_paid IS 'Indique si l''annonce est payante';
COMMENT ON COLUMN listings.contacts_count IS 'Nombre de fois où l''annonce a été contactée';