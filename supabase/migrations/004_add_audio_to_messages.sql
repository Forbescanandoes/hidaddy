ALTER TABLE messages ADD COLUMN IF NOT EXISTS audio_url TEXT;

INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-audio', 'chat-audio', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can upload audio" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'chat-audio');

CREATE POLICY "Anyone can read audio" ON storage.objects
  FOR SELECT USING (bucket_id = 'chat-audio');
