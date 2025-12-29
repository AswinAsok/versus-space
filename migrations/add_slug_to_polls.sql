-- Add slug column to polls table
ALTER TABLE polls ADD COLUMN IF NOT EXISTS slug TEXT;

-- Create unique index on slug
CREATE UNIQUE INDEX IF NOT EXISTS polls_slug_unique ON polls(slug);

-- Backfill existing polls with slugs based on their titles
UPDATE polls
SET slug =
  LOWER(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        REGEXP_REPLACE(title, '[^a-zA-Z0-9\s-]', '', 'g'),
        '\s+', '-', 'g'
      ),
      '-+', '-', 'g'
    )
  ) || '-' || SUBSTRING(id::text, 1, 8)
WHERE slug IS NULL;

-- Make slug NOT NULL after backfill
ALTER TABLE polls ALTER COLUMN slug SET NOT NULL;
