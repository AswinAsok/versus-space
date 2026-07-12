CREATE TABLE vote_counts_minute (
  poll_id TEXT NOT NULL,
  minute_start TEXT NOT NULL,
  real_votes INTEGER NOT NULL DEFAULT 0 CHECK (real_votes >= 0),
  simulated_votes INTEGER NOT NULL DEFAULT 0 CHECK (simulated_votes >= 0),
  PRIMARY KEY (poll_id, minute_start),
  FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE
);

CREATE TABLE vote_ip_totals (
  poll_id TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  real_votes INTEGER NOT NULL CHECK (real_votes > 0),
  PRIMARY KEY (poll_id, ip_address),
  FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE
);

-- Keep existing D1 databases correct when this migration is applied before cutover.
INSERT INTO vote_counts_minute (poll_id, minute_start, real_votes, simulated_votes)
SELECT
  poll_id,
  substr(replace(created_at, ' ', 'T'), 1, 16) || ':00.000Z',
  SUM(CASE WHEN is_simulated = 0 THEN 1 ELSE 0 END),
  SUM(CASE WHEN is_simulated = 1 THEN 1 ELSE 0 END)
FROM votes
GROUP BY poll_id, substr(replace(created_at, ' ', 'T'), 1, 16);

INSERT INTO vote_ip_totals (poll_id, ip_address, real_votes)
SELECT poll_id, ip_address, COUNT(*)
FROM votes
WHERE is_simulated = 0 AND ip_address IS NOT NULL
GROUP BY poll_id, ip_address;

DROP TRIGGER validate_vote_before_insert;
DROP TRIGGER update_poll_stats_after_delete;
DROP TRIGGER update_vote_stats_after_delete;

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
    FROM polls p
    WHERE p.id = NEW.poll_id
      AND p.max_votes_per_ip IS NOT NULL
      AND COALESCE((
        SELECT real_votes
        FROM vote_ip_totals
        WHERE poll_id = NEW.poll_id AND ip_address = NEW.ip_address
      ), 0) >= p.max_votes_per_ip
  );
END;

CREATE TRIGGER update_vote_aggregates_after_insert
AFTER INSERT ON votes
WHEN (SELECT import_mode FROM migration_runtime_state WHERE id = 1) = 0
BEGIN
  INSERT INTO vote_counts_minute (poll_id, minute_start, real_votes, simulated_votes)
  VALUES (
    NEW.poll_id,
    substr(replace(NEW.created_at, ' ', 'T'), 1, 16) || ':00.000Z',
    CASE WHEN NEW.is_simulated = 0 THEN 1 ELSE 0 END,
    CASE WHEN NEW.is_simulated = 1 THEN 1 ELSE 0 END
  )
  ON CONFLICT (poll_id, minute_start) DO UPDATE SET
    real_votes = real_votes + excluded.real_votes,
    simulated_votes = simulated_votes + excluded.simulated_votes;

  INSERT INTO vote_ip_totals (poll_id, ip_address, real_votes)
  SELECT NEW.poll_id, NEW.ip_address, 1
  WHERE NEW.is_simulated = 0 AND NEW.ip_address IS NOT NULL
  ON CONFLICT (poll_id, ip_address) DO UPDATE SET
    real_votes = real_votes + 1;
END;

-- Raw live votes cascade after this trigger. Subtract the aggregate once so
-- archived and live votes have identical poll-deletion semantics.
CREATE TRIGGER update_poll_stats_before_delete
BEFORE DELETE ON polls
WHEN (SELECT import_mode FROM migration_runtime_state WHERE id = 1) = 0
BEGIN
  UPDATE platform_stats
  SET polls_count = MAX(0, polls_count - 1),
      votes_count = MAX(
        0,
        votes_count - COALESCE((
          SELECT SUM(real_votes + simulated_votes)
          FROM vote_counts_minute
          WHERE poll_id = OLD.id
        ), 0)
      )
  WHERE id = 1;
END;
