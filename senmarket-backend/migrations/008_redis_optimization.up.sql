-- ============================================
-- 1. NOUVELLE MIGRATION: 008_redis_optimization.up.sql
-- ============================================

-- Optimisations DB pour Redis Cache
-- Création d'index pour améliorer les performances des requêtes fréquemment mises en cache

-- Index pour les listings (cache misses)
CREATE INDEX IF NOT EXISTS idx_listings_status_expires ON listings(status, expires_at) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_listings_category_status ON listings(category_id, status) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_listings_region_status ON listings(region, status) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_listings_featured ON listings(featured, created_at) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_listings_price ON listings(price) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_listings_created_desc ON listings(created_at DESC) WHERE status = 'published';

-- Index pour la recherche full-text
CREATE INDEX IF NOT EXISTS idx_listings_search_title ON listings USING gin(to_tsvector('french', title)) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_listings_search_desc ON listings USING gin(to_tsvector('french', description)) WHERE status = 'published';

-- Index pour les statistiques utilisateur (cache dashboard)
CREATE INDEX IF NOT EXISTS idx_listings_user_status ON listings(user_id, status);
CREATE INDEX IF NOT EXISTS idx_payments_user_status ON payments(user_id, status);
CREATE INDEX IF NOT EXISTS idx_contacts_user_created ON contacts(user_id, created_at);

-- Index pour les statistiques par catégorie
CREATE INDEX IF NOT EXISTS idx_listings_category_created ON listings(category_id, created_at) WHERE status = 'published';

-- Index pour les sessions Redis (si on utilise des foreign keys)
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_sms_verifications_phone ON sms_verifications(phone, created_at);

-- Statistiques automatiques pour l'optimiseur
ANALYZE listings;
ANALYZE categories;
ANALYZE users;
ANALYZE payments;

-- ============================================
-- 2. MIGRATION DOWN: 008_redis_optimization.down.sql  
-- ============================================

-- Suppression des index d'optimisation Redis
DROP INDEX IF EXISTS idx_listings_status_expires;
DROP INDEX IF EXISTS idx_listings_category_status;
DROP INDEX IF EXISTS idx_listings_region_status;
DROP INDEX IF EXISTS idx_listings_featured;
DROP INDEX IF EXISTS idx_listings_price;
DROP INDEX IF EXISTS idx_listings_created_desc;
DROP INDEX IF EXISTS idx_listings_search_title;
DROP INDEX IF EXISTS idx_listings_search_desc;
DROP INDEX IF EXISTS idx_listings_user_status;
DROP INDEX IF EXISTS idx_payments_user_status;
DROP INDEX IF EXISTS idx_contacts_user_created;
DROP INDEX IF EXISTS idx_listings_category_created;
DROP INDEX IF EXISTS idx_users_phone;
DROP INDEX IF EXISTS idx_sms_verifications_phone;