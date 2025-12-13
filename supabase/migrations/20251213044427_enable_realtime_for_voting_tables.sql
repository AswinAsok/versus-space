/*
  # Enable Realtime for voting tables

  Ensures vote and option changes are broadcast to clients via Supabase Realtime.
*/

-- Include voting tables in the Realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE polls;
ALTER PUBLICATION supabase_realtime ADD TABLE poll_options;
ALTER PUBLICATION supabase_realtime ADD TABLE votes;
ALTER PUBLICATION supabase_realtime ADD TABLE user_sessions;

-- Provide full replica identity so updates emit old/new rows when needed
ALTER TABLE poll_options REPLICA IDENTITY FULL;
ALTER TABLE polls REPLICA IDENTITY FULL;
ALTER TABLE votes REPLICA IDENTITY FULL;
ALTER TABLE user_sessions REPLICA IDENTITY FULL;
