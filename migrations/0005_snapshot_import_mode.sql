CREATE TABLE migration_runtime_state (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  import_mode INTEGER NOT NULL DEFAULT 0 CHECK (import_mode IN (0, 1))
);

INSERT INTO migration_runtime_state (id, import_mode) VALUES (1, 0);

DROP TRIGGER validate_vote_before_insert;
DROP TRIGGER update_vote_totals_after_insert;
DROP TRIGGER update_poll_stats_after_insert;
DROP TRIGGER update_poll_stats_after_delete;
DROP TRIGGER update_vote_stats_after_insert;
DROP TRIGGER update_vote_stats_after_delete;
DROP TRIGGER validate_simulated_vote_before_insert;
DROP TRIGGER update_simulated_vote_totals_after_insert;

CREATE TRIGGER validate_vote_before_insert
BEFORE INSERT ON votes
WHEN NEW.is_simulated = 0
  AND (SELECT import_mode FROM migration_runtime_state WHERE id = 1) = 0
BEGIN
  SELECT RAISE(ABORT, 'poll_not_found')
  WHERE NOT EXISTS (SELECT 1 FROM polls WHERE id = NEW.poll_id);

  SELECT RAISE(ABORT, 'poll_closed')
  WHERE EXISTS (SELECT 1 FROM polls WHERE id = NEW.poll_id AND is_active = 0);

  SELECT RAISE(ABORT, 'poll_expired')
  WHERE EXISTS (
    SELECT 1
    FROM polls
    WHERE id = NEW.poll_id
      AND ends_at IS NOT NULL
      AND julianday(ends_at) <= julianday('now')
  );

  SELECT RAISE(ABORT, 'option_not_in_poll')
  WHERE NOT EXISTS (
    SELECT 1 FROM poll_options WHERE id = NEW.option_id AND poll_id = NEW.poll_id
  );

  SELECT RAISE(ABORT, 'vote_limit_reached')
  WHERE EXISTS (
    SELECT 1
    FROM polls
    WHERE id = NEW.poll_id
      AND max_votes_per_ip IS NOT NULL
      AND (
        SELECT COUNT(*)
        FROM votes
        WHERE poll_id = NEW.poll_id
          AND ip_address = NEW.ip_address
          AND is_simulated = 0
      ) >= max_votes_per_ip
  );
END;

CREATE TRIGGER update_vote_totals_after_insert
AFTER INSERT ON votes
WHEN (SELECT import_mode FROM migration_runtime_state WHERE id = 1) = 0
BEGIN
  UPDATE poll_options
  SET vote_count = vote_count + 1
  WHERE id = NEW.option_id;

  UPDATE polls
  SET updated_at = NEW.created_at
  WHERE id = NEW.poll_id;
END;

CREATE TRIGGER update_poll_stats_after_insert
AFTER INSERT ON polls
WHEN (SELECT import_mode FROM migration_runtime_state WHERE id = 1) = 0
BEGIN
  UPDATE platform_stats SET polls_count = polls_count + 1 WHERE id = 1;
END;

CREATE TRIGGER update_poll_stats_after_delete
AFTER DELETE ON polls
WHEN (SELECT import_mode FROM migration_runtime_state WHERE id = 1) = 0
BEGIN
  UPDATE platform_stats SET polls_count = MAX(0, polls_count - 1) WHERE id = 1;
END;

CREATE TRIGGER update_vote_stats_after_insert
AFTER INSERT ON votes
WHEN (SELECT import_mode FROM migration_runtime_state WHERE id = 1) = 0
BEGIN
  UPDATE platform_stats SET votes_count = votes_count + 1 WHERE id = 1;
END;

CREATE TRIGGER update_vote_stats_after_delete
AFTER DELETE ON votes
WHEN (SELECT import_mode FROM migration_runtime_state WHERE id = 1) = 0
BEGIN
  UPDATE platform_stats SET votes_count = MAX(0, votes_count - 1) WHERE id = 1;
END;

CREATE TRIGGER validate_simulated_vote_before_insert
BEFORE INSERT ON votes
WHEN NEW.is_simulated = 1
  AND (SELECT import_mode FROM migration_runtime_state WHERE id = 1) = 0
BEGIN
  SELECT RAISE(ABORT, 'simulated_vote_not_eligible')
  WHERE NOT EXISTS (
    SELECT 1
    FROM poll_options po
    JOIN polls p ON p.id = po.poll_id
    WHERE po.id = NEW.option_id
      AND po.poll_id = NEW.poll_id
      AND po.simulated_enabled = 1
      AND COALESCE(po.simulated_target_votes, 0) > po.simulated_votes_added
      AND p.is_active = 1
      AND (p.ends_at IS NULL OR julianday(p.ends_at) > julianday(NEW.created_at))
  );
END;

CREATE TRIGGER update_simulated_vote_totals_after_insert
AFTER INSERT ON votes
WHEN NEW.is_simulated = 1
  AND (SELECT import_mode FROM migration_runtime_state WHERE id = 1) = 0
BEGIN
  UPDATE poll_options
  SET simulated_votes_added = simulated_votes_added + 1
  WHERE id = NEW.option_id;
END;
