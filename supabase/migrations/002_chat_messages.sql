-- Create messages table for chat
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  sender TEXT NOT NULL, -- 'kid' or 'dad'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable real-time
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- For now, allow all operations (we'll add auth later)
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read messages" ON messages
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert messages" ON messages
  FOR INSERT WITH CHECK (true);
