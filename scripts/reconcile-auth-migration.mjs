#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const path = process.argv[process.argv.indexOf('--input') + 1];
if (!path || path.startsWith('--')) {
  console.error(
    'Usage: node scripts/reconcile-auth-migration.mjs --input <reconciliation-snapshot.json>'
  );
  process.exit(2);
}
const data = JSON.parse(await readFile(path, 'utf8'));
const source = data.source?.users;
const targetUsers = data.target?.users;
const accounts = data.target?.accounts;
const app = data.application;
if (![source, targetUsers, accounts, app?.profiles, app?.polls].every(Array.isArray)) {
  throw new Error(
    'Expected source.users, target.users/accounts, and application.profiles/polls arrays'
  );
}

const failures = [];
const opaque = (value) => createHash('sha256').update(String(value)).digest('hex').slice(0, 12);
const unique = (rows, key, label) => {
  const seen = new Set();
  for (const row of rows) {
    const value = key(row);
    if (seen.has(value)) failures.push(`${label} duplicate:${opaque(value)}`);
    seen.add(value);
  }
  return seen;
};
const sourceIds = unique(source, (row) => row.id, 'source id');
unique(source, (row) => String(row.email).trim().toLowerCase(), 'source email');
const targetIds = unique(targetUsers, (row) => row.id, 'target id');
unique(targetUsers, (row) => String(row.email).trim().toLowerCase(), 'target email');

const exceptionIds = new Set(data.source?.exceptions ?? []);
const isVerified = (value) => value === true || value === 1 || value === '1';
const expectedTargetIds = new Set([...sourceIds].filter((id) => !exceptionIds.has(id)));
for (const row of source) {
  if (expectedTargetIds.has(row.id) && !targetIds.has(row.id))
    failures.push(`missing target user:${opaque(row.id)}`);
  const target = targetUsers.find((item) => item.id === row.id);
  const expectedEmail = String(row.email).trim().toLowerCase();
  if (target && target.email !== expectedEmail) {
    failures.push(`email normalization mismatch:${opaque(row.id)}`);
  }
  if (target && isVerified(target.emailVerified) !== Boolean(row.email_confirmed_at)) {
    failures.push(`verification mismatch:${opaque(row.id)}`);
  }
}
for (const id of exceptionIds)
  if (!sourceIds.has(id)) failures.push(`unknown exception:${opaque(id)}`);
for (const id of targetIds)
  if (!expectedTargetIds.has(id)) failures.push(`extra target user:${opaque(id)}`);
if (targetUsers.length !== expectedTargetIds.size) failures.push('target user count mismatch');

const credentialAccounts = accounts.filter((row) => row.providerId === 'credential');
const credentialIds = unique(credentialAccounts, (row) => row.userId, 'credential user');
unique(accounts, (row) => row.id, 'account id');
const expectedCredentialIds = new Set();
for (const row of source) {
  const expectsCredential =
    typeof row.encrypted_password === 'string' &&
    /^\$2[aby]\$\d\d\$/.test(row.encrypted_password) &&
    row.migration_disposition !== 'password_setup' &&
    expectedTargetIds.has(row.id);
  if (expectsCredential) expectedCredentialIds.add(row.id);
  if (expectsCredential !== credentialIds.has(row.id))
    failures.push(`credential mismatch:${opaque(row.id)}`);
}
for (const id of credentialIds) {
  if (!targetIds.has(id)) failures.push(`orphan credential:${opaque(id)}`);
  if (!expectedCredentialIds.has(id)) failures.push(`extra credential:${opaque(id)}`);
}
if (credentialAccounts.length !== expectedCredentialIds.size)
  failures.push('credential account count mismatch');
for (const row of app.profiles)
  if (!targetIds.has(row.user_id)) failures.push(`orphan profile:${opaque(row.user_id)}`);
for (const row of app.polls)
  if (row.creator_id && !targetIds.has(row.creator_id))
    failures.push(`orphan poll creator:${opaque(row.creator_id)}`);
for (const [label, rows] of [
  ['vote', app.votes ?? []],
  ['application session', app.userSessions ?? []],
  ['webhook event', app.webhookEvents ?? []],
]) {
  if (!Array.isArray(rows)) throw new Error(`application ${label} records must be an array`);
  for (const row of rows) {
    if (row.user_id && sourceIds.has(row.user_id) && !targetIds.has(row.user_id)) {
      failures.push(`${label} registered user missing:${opaque(row.user_id)}`);
    }
  }
}

const snapshot = {
  sourceUsers: source.length,
  exceptions: exceptionIds.size,
  targetUsers: targetUsers.length,
  credentialAccounts: credentialIds.size,
  profiles: app.profiles.length,
  polls: app.polls.length,
  failures: failures.length,
};
console.log(JSON.stringify(snapshot));
if (failures.length) {
  for (const failure of failures) console.error(failure);
  process.exit(1);
}
