-- 007_fix_images_column.down.sql
DROP INDEX IF EXISTS idx_listings_images;
ALTER TABLE listings DROP COLUMN IF EXISTS images;
ALTER TABLE listings ADD COLUMN images JSONB DEFAULT '[]'::jsonb;
