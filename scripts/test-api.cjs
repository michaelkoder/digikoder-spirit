#!/usr/bin/env node

/**
 * Test script for API endpoints
 * Usage: node scripts/test-api.cjs [baseUrl]
 * Default baseUrl: http://localhost:3001
 */

const http = require('http');
const https = require('https');

const baseUrl = process.argv[2] || 'http://localhost:3001';
const isHttps = baseUrl.startsWith('https');
const client = isHttps ? https : http;

const ADMIN_EMAIL = 'admin';
const ADMIN_PASSWORD = 'admin'; // Change this for testing

let authToken = null;

async function makeRequest(method, path, body = null, requireAuth = false) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (requireAuth && authToken) {
      options.headers['Authorization'] = `Bearer ${authToken}`;
    }

    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log(`\n🧪 Testing API at ${baseUrl}\n`);

  try {
    // Test 1: Login
    console.log('1️⃣  Testing POST /api/login');
    const loginRes = await makeRequest('POST', '/api/login', {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });
    console.log(`   Status: ${loginRes.status}`);
    if (loginRes.status === 200) {
      authToken = loginRes.data.token;
      console.log(`   ✅ Login successful, token: ${authToken.slice(0, 20)}...`);
    } else {
      console.log(`   ❌ Login failed: ${loginRes.data.error}`);
    }

    // Test 2: Get user profile
    console.log('\n2️⃣  Testing GET /api/me');
    const meRes = await makeRequest('GET', '/api/me', null, true);
    console.log(`   Status: ${meRes.status}`);
    if (meRes.status === 200) {
      console.log(`   ✅ Profile: ${meRes.data.email} (role: ${meRes.data.role})`);
    } else {
      console.log(`   ❌ Failed: ${meRes.data.error}`);
    }

    // Test 3: Get contents
    console.log('\n3️⃣  Testing GET /api/contents');
    const contentsRes = await makeRequest('GET', '/api/contents');
    console.log(`   Status: ${contentsRes.status}`);
    if (contentsRes.status === 200) {
      console.log(`   ✅ Found ${contentsRes.data.length} contents`);
    } else {
      console.log(`   ❌ Failed: ${contentsRes.data.error}`);
    }

    // Test 4: Validate URL
    console.log('\n4️⃣  Testing POST /api/validate-url');
    const validateRes = await makeRequest('POST', '/api/validate-url', {
      url: 'https://www.youtube.com/watch?v=nO3QrOifFOQ',
    });
    console.log(`   Status: ${validateRes.status}`);
    if (validateRes.status === 200) {
      console.log(`   ✅ Video alive: ${validateRes.data.alive}`);
    } else {
      console.log(`   ❌ Failed: ${validateRes.data.error}`);
    }

    // Test 5: Logout
    console.log('\n5️⃣  Testing POST /api/logout');
    const logoutRes = await makeRequest('POST', '/api/logout', {});
    console.log(`   Status: ${logoutRes.status}`);
    if (logoutRes.status === 200) {
      authToken = null;
      console.log(`   ✅ Logout successful`);
    } else {
      console.log(`   ❌ Failed: ${logoutRes.data.error}`);
    }

    console.log('\n✅ All tests completed!\n');
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}\n`);
    process.exit(1);
  }
}

runTests();
