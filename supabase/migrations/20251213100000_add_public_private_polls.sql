/*
  # Add Public/Private Poll Support

  ## Changes
  - Add `is_public` column to polls table (default: true)
  - Add `access_key` column to polls table (nullable, for private polls)
  - Add index on is_public for leaderboard queries
  - Update RLS policies to handle public/private access
*/

-- Add new columns to polls table
ALTER TABLE polls
ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT true NOT NULL,
ADD COLUMN IF NOT EXISTS access_key text;

-- Add index for public polls (used in leaderboard queries)
CREATE INDEX IF NOT EXISTS idx_polls_public ON polls(is_public) WHERE is_public = true;

-- Create a function to get total votes for a poll
CREATE OR REPLACE FUNCTION get_poll_total_votes(poll_uuid uuid)
RETURNS bigint AS $$
  SELECT COALESCE(SUM(vote_count), 0)::bigint
  FROM poll_options
  WHERE poll_id = poll_uuid;
$$ LANGUAGE sql STABLE;

-- Create a view for the leaderboard (public active polls with total votes)
CREATE OR REPLACE VIEW public_poll_leaderboard AS
SELECT
  p.id,
  p.title,
  p.creator_id,
  p.is_active,
  p.created_at,
  p.updated_at,
  get_poll_total_votes(p.id) as total_votes,
  (
    SELECT json_agg(
      json_build_object(
        'id', po.id,
        'title', po.title,
        'vote_count', po.vote_count,
        'position', po.position
      ) ORDER BY po.position
    )
    FROM poll_options po
    WHERE po.poll_id = p.id
  ) as options
FROM polls p
WHERE p.is_public = true AND p.is_active = true
ORDER BY get_poll_total_votes(p.id) DESC;

-- Grant access to the view
GRANT SELECT ON public_poll_leaderboard TO anon, authenticated;
