#!/usr/bin/env node

import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const scripts = dirname(fileURLToPath(import.meta.url));
const fixtures = join(scripts, 'auth-migration-fixtures');
const temp = await mkdtemp(join(tmpdir(), 'auth-migration-check-'));
const run = (script, args) =>
  spawnSync(process.execPath, [join(scripts, script), ...args], { encoding: 'utf8' });

try {
  const output = join(temp, 'import.sql');
  const transform = run('transform-supabase-auth.mjs', [
    '--input',
    join(fixtures, 'supabase-auth.sanitized.json'),
    '--output',
    output,
  ]);
  if (transform.status !== 0) throw new Error(transform.stderr || 'transform failed');
  const generated = await readFile(output, 'utf8');
  if (!generated.includes('INSERT INTO auth_users')) {
    throw new Error('transform output is incomplete');
  }
  if (
    !generated.includes("'verified@example.test'") ||
    generated.includes('Verified@Example.Test')
  ) {
    throw new Error('transform did not normalize an email address');
  }
  if (/\b(?:BEGIN|COMMIT|ROLLBACK)\b/i.test(generated)) {
    throw new Error('transform output contains a transaction statement unsupported by D1');
  }
  if (transform.stdout.includes('$2b$')) throw new Error('transform logged a credential hash');

  const reconcile = run('reconcile-auth-migration.mjs', [
    '--input',
    join(fixtures, 'reconciliation.sanitized.json'),
  ]);
  if (reconcile.status !== 0) throw new Error(reconcile.stderr || 'reconciliation failed');

  const cleanReconciliation = JSON.parse(
    await readFile(join(fixtures, 'reconciliation.sanitized.json'), 'utf8')
  );
  const extraTarget = structuredClone(cleanReconciliation);
  extraTarget.target.users.push({
    id: '33333333-3333-4333-8333-333333333333',
    email: 'extra@example.test',
    emailVerified: 0,
  });
  const extraTargetPath = join(temp, 'extra-target.json');
  await writeFile(extraTargetPath, JSON.stringify(extraTarget));
  const extraRejected = run('reconcile-auth-migration.mjs', ['--input', extraTargetPath]);
  if (extraRejected.status === 0 || !extraRejected.stderr.includes('extra target user:')) {
    throw new Error('extra target user was not refused');
  }

  const identityMismatch = structuredClone(cleanReconciliation);
  identityMismatch.target.users[0].email = 'wrong@example.test';
  const identityMismatchPath = join(temp, 'identity-mismatch.json');
  await writeFile(identityMismatchPath, JSON.stringify(identityMismatch));
  const identityRejected = run('reconcile-auth-migration.mjs', ['--input', identityMismatchPath]);
  if (
    identityRejected.status === 0 ||
    !identityRejected.stderr.includes('email normalization mismatch:')
  ) {
    throw new Error('target identity mismatch was not refused');
  }

  const duplicate = JSON.parse(
    await readFile(join(fixtures, 'supabase-auth.sanitized.json'), 'utf8')
  );
  duplicate.users.push({ ...duplicate.users[0] });
  const duplicatePath = join(temp, 'duplicate.json');
  await writeFile(duplicatePath, JSON.stringify(duplicate));
  const rejected = run('transform-supabase-auth.mjs', [
    '--input',
    duplicatePath,
    '--output',
    join(temp, 'should-not-exist.sql'),
  ]);
  if (rejected.status === 0 || !rejected.stderr.includes('Duplicate user ID')) {
    throw new Error('duplicate user was not refused');
  }

  console.log('auth migration self-check passed');
} finally {
  await rm(temp, { recursive: true, force: true });
}
