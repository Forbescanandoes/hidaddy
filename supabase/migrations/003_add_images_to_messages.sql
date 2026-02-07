-- Add image_url column to messages table
ALTER TABLE messages ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create storage bucket for photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-photos', 'chat-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to upload photos (we'll add auth later)
CREATE POLICY "Anyone can upload photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'chat-photos');

-- Allow anyone to read photos
CREATE POLICY "Anyone can read photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'chat-photos');
