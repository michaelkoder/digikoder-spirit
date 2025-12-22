#!/usr/bin/env node

/**
 * Script to generate bcrypt hash for ADMIN_HASH environment variable
 * Usage: node scripts/generate-admin-hash.cjs <password>
 */

const bcrypt = require('bcryptjs');
const readline = require('readline');

const args = process.argv.slice(2);

async function generateHash(password) {
  const hash = await bcrypt.hash(password, 10);
  console.log('\n✅ Bcrypt Hash Generated:\n');
  console.log(hash);
  console.log('\n📋 Copy this value to:');
  console.log('  - Local: .env.local → ADMIN_HASH=...');
  console.log('  - Vercel: Settings → Environment Variables → ADMIN_HASH\n');
  process.exit(0);
}

async function promptPassword() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('Enter admin password: ', async (password) => {
    if (!password) {
      console.error('❌ Password cannot be empty');
      process.exit(1);
    }
    if (password.length < 6) {
      console.error('❌ Password must be at least 6 characters');
      process.exit(1);
    }
    rl.close();
    await generateHash(password);
  });
}

if (args.length > 0) {
  generateHash(args[0]);
} else {
  promptPassword();
}
