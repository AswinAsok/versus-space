-- Create RPC function to get vote counts grouped by date and poll
-- This is much more efficient than fetching millions of rows
-- Accepts timezone offset in minutes to convert UTC to local time

DROP FUNCTION IF EXISTS get_votes_over_time(UUID[], TIMESTAMPTZ, BOOLEAN);

CREATE OR REPLACE FUNCTION get_votes_over_time(
  p_poll_ids UUID[],
  p_start_date TIMESTAMPTZ,
  p_group_by_hour BOOLEAN DEFAULT FALSE,
  p_tz_offset_minutes INTEGER DEFAULT 0
)
RETURNS TABLE (
  poll_id UUID,
  time_bucket TEXT,
  vote_count BIGINT
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    v.poll_id,
    CASE
      WHEN p_group_by_hour THEN TO_CHAR(v.created_at + (p_tz_offset_minutes || ' minutes')::INTERVAL, 'YYYY-MM-DD-HH24')
      ELSE TO_CHAR(v.created_at + (p_tz_offset_minutes || ' minutes')::INTERVAL, 'YYYY-MM-DD')
    END as time_bucket,
    COUNT(*) as vote_count
  FROM votes v
  WHERE v.poll_id = ANY(p_poll_ids)
    AND v.created_at >= p_start_date
  GROUP BY v.poll_id, time_bucket
  ORDER BY time_bucket ASC;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_votes_over_time(UUID[], TIMESTAMPTZ, BOOLEAN, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_votes_over_time(UUID[], TIMESTAMPTZ, BOOLEAN, INTEGER) TO anon;
