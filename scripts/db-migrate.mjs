#!/usr/bin/env node

import { spawn } from 'child_process';
import net from 'net';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL is not defined');
  process.exit(1);
}

/**
 * Parse DATABASE_URL
 */
function parseDsn(dsn) {
  try {
    const url = new URL(dsn);
    const driver = url.protocol.replace(':', '');

    if (!['postgres', 'postgresql'].includes(driver)) {
      throw new Error(`Unsupported database driver: ${driver}`);
    }

    return {
      driver,
      host: url.hostname,
      port: Number(url.port) || 5432,
    };
  } catch (err) {
    throw new Error(`Invalid DATABASE_URL: ${err.message}`);
  }
}

/**
 * Wait for TCP connection (DB ready)
 */
function waitForPort(host, port, timeout = 2000) {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();

    socket.setTimeout(timeout);
    socket.once('error', reject);
    socket.once('timeout', () =>
      reject(new Error('Connection timeout'))
    );

    socket.connect(port, host, () => {
      socket.end();
      resolve();
    });
  });
}

/**
 * Retry helper
 */
async function retry(fn, retries = 10, delay = 3000) {
  for (let i = 1; i <= retries; i++) {
    try {
      await fn();
      return;
    } catch (err) {
      if (i === retries) {
        throw err;
      }
      console.log(
        `⚠️  Attempt ${i}/${retries} failed. Retrying in ${delay / 1000}s...`
      );
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

/**
 * Run prisma migrate deploy
 */
function runPrismaMigrate() {
  return new Promise((resolve, reject) => {
    console.log('🔄 Running Prisma migrate deploy...');

    const child = spawn(
      'npx',
      ['prisma', 'migrate', 'deploy'],
      {
        cwd: '/app/api',
        stdio: 'inherit',
        env: process.env,
      }
    );

    child.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Prisma migration completed');
        resolve();
      } else {
        reject(new Error(`Prisma exited with code ${code}`));
      }
    });
  });
}

/**
 * Main
 */
(async () => {
  console.log('🗄️  DB Migration Starting...');

  try {
    const { host, port, driver } = parseDsn(DATABASE_URL);

    console.log(`⏳ Waiting for ${driver} database at ${host}:${port}...`);

    await retry(() => waitForPort(host, port), 10, 3000);

    console.log('✅ Database is reachable');

    await retry(runPrismaMigrate, 5, 3000);

    console.log('🎉 Database migration SUCCESS');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
})();
