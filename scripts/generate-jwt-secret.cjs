#!/usr/bin/env node

/**
 * Generate a secure JWT secret
 * Usage: node scripts/generate-jwt-secret.cjs
 */

const crypto = require('crypto');

const secret = crypto.randomBytes(32).toString('hex');

console.log('\n🔐 Generated JWT Secret (32 bytes / 256 bits):\n');
console.log(secret);
console.log('\n📋 Add to .env.production and Vercel:\n');
console.log(`JWT_SECRET=${secret}\n`);
