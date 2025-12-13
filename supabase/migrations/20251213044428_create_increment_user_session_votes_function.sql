/*
  # Reliable user session vote increment RPC

  Provides a single RPC to atomically upsert a user_session row and increment
  the total_votes counter. This replaces the missing `increment` RPC that was
  causing 404 responses from the frontend.
*/

CREATE OR REPLACE FUNCTION increment_user_session_votes(
  p_user_id text,
  p_poll_id uuid
)
RETURNS user_sessions AS $$
DECLARE
  session_row user_sessions;
BEGIN
  INSERT INTO user_sessions (user_id, poll_id, total_votes, last_vote_at)
  VALUES (p_user_id, p_poll_id, 1, now())
  ON CONFLICT (user_id, poll_id) DO UPDATE
    SET total_votes = user_sessions.total_votes + 1,
        last_vote_at = now()
  RETURNING * INTO session_row;

  RETURN session_row;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION increment_user_session_votes(text, uuid) TO anon, authenticated;
