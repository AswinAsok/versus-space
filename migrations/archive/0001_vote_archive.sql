PRAGMA foreign_keys = ON;

CREATE TABLE vote_archives (
  id TEXT PRIMARY KEY NOT NULL,
  format TEXT NOT NULL CHECK (format = 'gzip-ndjson'),
  source_rows INTEGER NOT NULL CHECK (source_rows >= 0),
  canonical_sha256 TEXT NOT NULL,
  compressed_sha256 TEXT NOT NULL UNIQUE,
  compressed_bytes INTEGER NOT NULL CHECK (compressed_bytes > 0),
  chunk_bytes INTEGER NOT NULL CHECK (chunk_bytes = 32768),
  chunk_count INTEGER NOT NULL CHECK (chunk_count > 0),
  source_generated_at TEXT NOT NULL
);

CREATE TABLE vote_archive_chunks (
  archive_id TEXT NOT NULL,
  chunk_index INTEGER NOT NULL CHECK (chunk_index >= 0),
  payload BLOB NOT NULL CHECK (length(payload) > 0 AND length(payload) <= 32768),
  PRIMARY KEY (archive_id, chunk_index),
  FOREIGN KEY (archive_id) REFERENCES vote_archives(id) ON DELETE CASCADE
);
