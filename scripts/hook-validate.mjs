// Fast local validation for Kiro PostFileSave hooks.
// Reads the hook event JSON from stdin, finds the saved file, then runs
// typecheck, ESLint on that file, and the Vitest tests related to it.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';

function readStdin() {
  try {
    return readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

function findFilePath(value) {
  if (typeof value === 'string') return /\.(ts|tsx)$/.test(value) ? value : undefined;
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findFilePath(item);
      if (found) return found;
    }
  } else if (value && typeof value === 'object') {
    for (const item of Object.values(value)) {
      const found = findFilePath(item);
      if (found) return found;
    }
  }
  return undefined;
}

let event = {};
try {
  event = JSON.parse(readStdin() || '{}');
} catch {
  event = {};
}

const raw = findFilePath(event);
const file = raw && existsSync(resolve(raw)) ? relative(process.cwd(), resolve(raw)) : undefined;

function run(cmd, args) {
  execFileSync(cmd, args, { stdio: 'inherit' });
}

try {
  run('npx', ['tsc', '-b', '--noEmit']);
  if (file) {
    run('npx', ['eslint', file]);
    run('npx', ['vitest', 'related', '--run', '--passWithNoTests', file]);
  } else {
    run('npx', ['eslint', '.']);
    run('npx', ['vitest', 'run']);
  }
} catch {
  process.exit(1);
}
