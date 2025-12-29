-- Create RPC function to get vote counts grouped by date
-- This is much more efficient than fetching millions of rows

CREATE OR REPLACE FUNCTION get_vote_counts_by_date(
  p_poll_ids UUID[],
  p_start_date TIMESTAMPTZ
)
RETURNS TABLE (
  vote_date DATE,
  vote_count BIGINT
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    DATE(created_at) as vote_date,
    COUNT(*) as vote_count
  FROM votes
  WHERE poll_id = ANY(p_poll_ids)
    AND created_at >= p_start_date
  GROUP BY DATE(created_at)
  ORDER BY vote_date ASC;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_vote_counts_by_date(UUID[], TIMESTAMPTZ) TO authenticated;
GRANT EXECUTE ON FUNCTION get_vote_counts_by_date(UUID[], TIMESTAMPTZ) TO anon;
