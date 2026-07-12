CREATE TRIGGER validate_vote_before_insert
BEFORE INSERT ON votes
WHEN NEW.is_simulated = 0
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
BEGIN
  UPDATE poll_options
  SET vote_count = vote_count + 1
  WHERE id = NEW.option_id;

  UPDATE polls
  SET updated_at = NEW.created_at
  WHERE id = NEW.poll_id;
END;
