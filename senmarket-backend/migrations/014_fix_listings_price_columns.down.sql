-- migrations/014_fix_listings_price_columns.down.sql
-- Rollback de la migration pour revenir à l'ancienne structure

-- 1. Ajouter les anciennes colonnes
ALTER TABLE listings 
ADD COLUMN price DECIMAL(12,2),
ADD COLUMN currency VARCHAR(3) DEFAULT 'XOF';

-- 2. Migrer les données vers les anciennes colonnes
UPDATE listings 
SET price = price_amount, 
    currency = price_currency;

-- 3. Rendre les anciennes colonnes NOT NULL
ALTER TABLE listings 
ALTER COLUMN price SET NOT NULL;

-- 4. Supprimer les nouvelles colonnes
ALTER TABLE listings 
DROP COLUMN IF EXISTS price_amount,
DROP COLUMN IF EXISTS price_currency,
DROP COLUMN IF EXISTS is_paid,
DROP COLUMN IF EXISTS contacts_count;

-- 5. Renommer is_promoted en is_featured
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'listings' AND column_name = 'is_promoted') THEN
        ALTER TABLE listings RENAME COLUMN is_promoted TO is_featured;
    END IF;
END $$;

-- 6. Supprimer les index
DROP INDEX IF EXISTS idx_listings_price_amount;
DROP INDEX IF EXISTS idx_listings_price_currency;
DROP INDEX IF EXISTS idx_listings_is_paid;