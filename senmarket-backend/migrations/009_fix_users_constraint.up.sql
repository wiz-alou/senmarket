-- migrations/009_fix_users_constraint.up.sql
-- Fix pour l'erreur de contrainte uni_users_phone

-- Vérifier et supprimer l'ancienne contrainte si elle existe
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'uni_users_phone' 
        AND table_name = 'users'
        AND table_schema = CURRENT_SCHEMA()
    ) THEN
        ALTER TABLE users DROP CONSTRAINT uni_users_phone;
        RAISE NOTICE 'Contrainte uni_users_phone supprimée';
    ELSE
        RAISE NOTICE 'Contrainte uni_users_phone n''existe pas (OK)';
    END IF;
END
$$;

-- Vérifier et créer la contrainte unique correcte si nécessaire
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_type = 'UNIQUE'
        AND table_name = 'users'
        AND table_schema = CURRENT_SCHEMA()
        AND constraint_name LIKE '%phone%'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT users_phone_unique UNIQUE (phone);
        RAISE NOTICE 'Contrainte users_phone_unique créée';
    ELSE
        RAISE NOTICE 'Contrainte unique sur phone existe déjà (OK)';
    END IF;
END
$$;

-- S'assurer que l'index existe
CREATE INDEX IF NOT EXISTS idx_users_phone_unique ON users(phone) WHERE deleted_at IS NULL;

RAISE NOTICE 'Migration 009 terminée avec succès';