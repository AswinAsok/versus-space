CREATE TRIGGER validate_simulated_vote_before_insert
BEFORE INSERT ON votes
WHEN NEW.is_simulated = 1
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
BEGIN
  UPDATE poll_options
  SET simulated_votes_added = simulated_votes_added + 1
  WHERE id = NEW.option_id;
END;
