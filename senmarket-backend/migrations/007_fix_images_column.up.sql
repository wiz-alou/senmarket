-- 007_fix_images_column.up.sql
-- Fix images column type for proper JSON handling

-- Drop existing column and recreate with proper type
ALTER TABLE listings DROP COLUMN IF EXISTS images;
ALTER TABLE listings ADD COLUMN images text[] DEFAULT '{}';

-- Create index for images
CREATE INDEX idx_listings_images ON listings USING gin(images) WHERE array_length(images, 1) > 0;
