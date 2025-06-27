-- Supprimer les colonnes de quota ajoutées à la table users
ALTER TABLE users 
DROP COLUMN IF EXISTS monthly_quota,
DROP COLUMN IF EXISTS used_quota,
DROP COLUMN IF EXISTS quota_reset_date;
