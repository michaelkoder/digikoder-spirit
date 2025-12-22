#!/usr/bin/env node

/**
 * Pre-deployment health check
 * Usage: node scripts/pre-deploy-check.cjs
 */

const fs = require('fs');
const path = require('path');

const checks = [];

function check(name, condition, details) {
  checks.push({
    name,
    passed: !!condition,
    details,
  });
  const icon = condition ? '✅' : '❌';
  console.log(`${icon} ${name}`);
  if (details && !condition) {
    console.log(`   ℹ️  ${details}`);
  }
}

function fileExists(filePath) {
  return fs.existsSync(path.join(__dirname, '..', filePath));
}

function fileContains(filePath, searchString) {
  try {
    const content = fs.readFileSync(path.join(__dirname, '..', filePath), 'utf8');
    return content.includes(searchString);
  } catch {
    return false;
  }
}

console.log('\n🏥 Pre-Deployment Health Check\n');

// Configuration files
console.log('📁 Configuration Files:');
check('vite.config.ts exists', fileExists('vite.config.ts'));
check('vercel.json exists', fileExists('vercel.json'));
check('package.json exists', fileExists('package.json'));
check('.env.example exists', fileExists('.env.example'));
check('.env.production exists', fileExists('.env.production'));
check('.gitignore exists', fileExists('.gitignore'));

// Build files
console.log('\n🔨 Build Configuration:');
check(
  'vite.config.ts has proxy',
  fileContains('vite.config.ts', "'/spirit/api'"),
  'Proxy not configured for local development'
);
check(
  'vite.config.ts has port 5173',
  fileContains('vite.config.ts', '5173'),
  'Frontend port might be wrong'
);
check(
  'package.json has build script',
  fileContains('package.json', '"build"'),
  'Build script missing'
);

// API Configuration
console.log('\n🔌 API Configuration:');
check(
  'vercel.json has rewrites',
  fileContains('vercel.json', '/spirit/api'),
  'API routes not configured for Vercel'
);
check(
  'server/index.cjs uses port 3001',
  fileExists('server/index.cjs') && fileContains('server/index.cjs', '3001'),
  'Backend port might be wrong'
);
check(
  'API files exist',
  fileExists('api/login.js') &&
    fileExists('api/me.js') &&
    fileExists('api/logout.js') &&
    fileExists('api/validate-url.js'),
  'Some API files are missing'
);

// Frontend configuration
console.log('\n⚛️  Frontend Configuration:');
check(
  'index.tsx uses environment variables',
  fileExists('index.tsx') && fileContains('index.tsx', 'VITE_API_BASE_URL'),
  'API_BASE is hardcoded instead of using environment'
);
check(
  'index.tsx has fallback to /spirit',
  fileExists('index.tsx') && fileContains('index.tsx', "'/spirit'"),
  'No fallback for API_BASE'
);

// Security
console.log('\n🔒 Security:');
check(
  '.gitignore has .env files',
  fileContains('.gitignore', '.env'),
  'Environment files might be committed'
);
check(
  '.env.local exists (development)',
  fileExists('.env.local'),
  'Create .env.local from .env.example'
);
check(
  '.env.production has NODE_ENV',
  fileContains('.env.production', 'NODE_ENV=production'),
  'Production environment not properly set'
);

// Summary
console.log('\n' + '='.repeat(50));
const passed = checks.filter((c) => c.passed).length;
const total = checks.length;
const percentage = Math.round((passed / total) * 100);

console.log(`\n📊 Results: ${passed}/${total} checks passed (${percentage}%)\n`);

if (passed === total) {
  console.log('✅ All checks passed! Ready for deployment.\n');
  process.exit(0);
} else {
  const failed = checks.filter((c) => !c.passed);
  console.log('❌ Failed checks:');
  failed.forEach((c) => {
    console.log(`   - ${c.name}`);
    if (c.details) console.log(`     ${c.details}`);
  });
  console.log(
    '\n⚠️  Please fix the failed checks before deploying.\n'
  );
  process.exit(1);
}
