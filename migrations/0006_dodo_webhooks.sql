CREATE TABLE dodo_webhook_events (
  id TEXT PRIMARY KEY NOT NULL,
  event_type TEXT NOT NULL,
  payment_id TEXT,
  user_id TEXT,
  processed_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES user_profiles(user_id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX idx_dodo_webhook_payment
ON dodo_webhook_events(payment_id)
WHERE payment_id IS NOT NULL;
