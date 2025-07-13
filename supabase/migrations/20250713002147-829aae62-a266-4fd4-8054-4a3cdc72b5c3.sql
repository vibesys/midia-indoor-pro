
-- Add duration column to playlist_items table
ALTER TABLE public.playlist_items 
ADD COLUMN duration TEXT;

-- Update existing records with default duration values
UPDATE public.playlist_items
SET duration = '10s'
WHERE item_type = 'image' AND duration IS NULL;

UPDATE public.playlist_items
SET duration = '30s'
WHERE item_type = 'video' AND duration IS NULL;

UPDATE public.playlist_items
SET duration = '15s'
WHERE item_type = 'link' AND duration IS NULL;
