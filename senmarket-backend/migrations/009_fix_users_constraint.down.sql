-- migrations/009_fix_users_constraint.down.sql
-- Rollback de la correction des contraintes users

-- Supprimer la contrainte créée
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'users_phone_unique' 
        AND table_name = 'users'
        AND table_schema = CURRENT_SCHEMA()
    ) THEN
        ALTER TABLE users DROP CONSTRAINT users_phone_unique;
        RAISE NOTICE 'Contrainte users_phone_unique supprimée';
    END IF;
END
$$;

-- Supprimer l'index
DROP INDEX IF EXISTS idx_users_phone_unique;

RAISE NOTICE 'Rollback migration 009 terminé';