-- Migration: Make all existing votes "real" (not simulated)
-- Run this in the Supabase SQL Editor

-- Update all votes to be marked as real (is_simulated = false)
UPDATE votes
SET is_simulated = false
WHERE is_simulated = true OR is_simulated IS NULL;

-- Verify the update
SELECT
  COUNT(*) as total_votes,
  COUNT(*) FILTER (WHERE is_simulated = false) as real_votes,
  COUNT(*) FILTER (WHERE is_simulated = true) as simulated_votes
FROM votes;
