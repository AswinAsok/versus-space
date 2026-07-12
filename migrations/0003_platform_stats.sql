CREATE TABLE platform_stats (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  polls_count INTEGER NOT NULL,
  votes_count INTEGER NOT NULL
);

INSERT INTO platform_stats (id, polls_count, votes_count)
SELECT 1, (SELECT COUNT(*) FROM polls), (SELECT COUNT(*) FROM votes);

CREATE TRIGGER update_poll_stats_after_insert
AFTER INSERT ON polls
BEGIN
  UPDATE platform_stats SET polls_count = polls_count + 1 WHERE id = 1;
END;

CREATE TRIGGER update_poll_stats_after_delete
AFTER DELETE ON polls
BEGIN
  UPDATE platform_stats SET polls_count = MAX(0, polls_count - 1) WHERE id = 1;
END;

CREATE TRIGGER update_vote_stats_after_insert
AFTER INSERT ON votes
BEGIN
  UPDATE platform_stats SET votes_count = votes_count + 1 WHERE id = 1;
END;

CREATE TRIGGER update_vote_stats_after_delete
AFTER DELETE ON votes
BEGIN
  UPDATE platform_stats SET votes_count = MAX(0, votes_count - 1) WHERE id = 1;
END;
