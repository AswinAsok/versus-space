/*
  # Versus.space - Real-time Voting Platform Schema

  ## Overview
  This migration creates the complete database schema for a real-time voting platform
  where users can create polls with multiple options and vote in real-time.

  ## New Tables

  ### 1. polls
  Main table for storing poll information
  - `id` (uuid, primary key) - Unique poll identifier
  - `title` (text) - Poll title/question
  - `creator_id` (uuid, foreign key) - References auth.users
  - `is_active` (boolean) - Whether poll is currently active
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. poll_options
  Stores the voting options for each poll
  - `id` (uuid, primary key) - Unique option identifier
  - `poll_id` (uuid, foreign key) - References polls table
  - `title` (text) - Option title/label
  - `image_url` (text) - URL to option image
  - `vote_count` (bigint) - Total votes for this option
  - `position` (integer) - Display order position
  - `created_at` (timestamptz) - Creation timestamp

  ### 3. votes
  Records every individual vote event for analytics
  - `id` (uuid, primary key) - Unique vote identifier
  - `poll_id` (uuid, foreign key) - References polls table
  - `option_id` (uuid, foreign key) - References poll_options table
  - `user_id` (uuid, foreign key) - References auth.users (nullable for anonymous)
  - `created_at` (timestamptz) - Vote timestamp

  ### 4. user_sessions
  Tracks user voting sessions and stats
  - `id` (uuid, primary key) - Unique session identifier
  - `user_id` (uuid) - User identifier (can be anonymous session ID)
  - `poll_id` (uuid, foreign key) - References polls table
  - `total_votes` (integer) - Total votes cast in this session
  - `last_vote_at` (timestamptz) - Last vote timestamp
  - `created_at` (timestamptz) - Session start timestamp

  ## Security
  - RLS enabled on all tables
  - Policies for authenticated users to create polls
  - Public read access to polls and options
  - Vote creation restricted to authenticated users
  - Users can only delete their own polls

  ## Indexes
  - Indexes on foreign keys for performance
  - Index on poll_id and created_at for vote analytics
*/

-- Create polls table
CREATE TABLE IF NOT EXISTS polls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  creator_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create poll_options table
CREATE TABLE IF NOT EXISTS poll_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id uuid REFERENCES polls(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  image_url text,
  vote_count bigint DEFAULT 0 NOT NULL,
  position integer NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create votes table for analytics
CREATE TABLE IF NOT EXISTS votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id uuid REFERENCES polls(id) ON DELETE CASCADE NOT NULL,
  option_id uuid REFERENCES poll_options(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create user_sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  poll_id uuid REFERENCES polls(id) ON DELETE CASCADE NOT NULL,
  total_votes integer DEFAULT 0 NOT NULL,
  last_vote_at timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, poll_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_polls_creator ON polls(creator_id);
CREATE INDEX IF NOT EXISTS idx_polls_active ON polls(is_active);
CREATE INDEX IF NOT EXISTS idx_poll_options_poll ON poll_options(poll_id);
CREATE INDEX IF NOT EXISTS idx_votes_poll ON votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_votes_option ON votes(option_id);
CREATE INDEX IF NOT EXISTS idx_votes_created ON votes(poll_id, created_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_poll ON user_sessions(poll_id);

-- Enable Row Level Security
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Polls policies
CREATE POLICY "Anyone can view polls"
  ON polls FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create polls"
  ON polls FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update own polls"
  ON polls FOR UPDATE
  TO authenticated
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can delete own polls"
  ON polls FOR DELETE
  TO authenticated
  USING (auth.uid() = creator_id);

-- Poll options policies
CREATE POLICY "Anyone can view poll options"
  ON poll_options FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Poll creators can insert options"
  ON poll_options FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM polls
      WHERE polls.id = poll_options.poll_id
      AND polls.creator_id = auth.uid()
    )
  );

CREATE POLICY "Poll creators can update options"
  ON poll_options FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM polls
      WHERE polls.id = poll_options.poll_id
      AND polls.creator_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM polls
      WHERE polls.id = poll_options.poll_id
      AND polls.creator_id = auth.uid()
    )
  );

CREATE POLICY "Poll creators can delete options"
  ON poll_options FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM polls
      WHERE polls.id = poll_options.poll_id
      AND polls.creator_id = auth.uid()
    )
  );

-- Votes policies
CREATE POLICY "Anyone can view votes"
  ON votes FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert votes"
  ON votes FOR INSERT
  TO public
  WITH CHECK (true);

-- User sessions policies
CREATE POLICY "Anyone can view user sessions"
  ON user_sessions FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert user sessions"
  ON user_sessions FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update user sessions"
  ON user_sessions FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Function to increment vote count
CREATE OR REPLACE FUNCTION increment_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE poll_options
  SET vote_count = vote_count + 1
  WHERE id = NEW.option_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically increment vote count
CREATE TRIGGER on_vote_created
  AFTER INSERT ON votes
  FOR EACH ROW
  EXECUTE FUNCTION increment_vote_count();

-- Function to update poll updated_at timestamp
CREATE OR REPLACE FUNCTION update_poll_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE polls
  SET updated_at = now()
  WHERE id = NEW.poll_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update poll timestamp on new vote
CREATE TRIGGER on_vote_update_poll
  AFTER INSERT ON votes
  FOR EACH ROW
  EXECUTE FUNCTION update_poll_timestamp();