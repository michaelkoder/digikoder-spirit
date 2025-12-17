const http = require('http');

// Test login
const loginData = JSON.stringify({ email: 'admin@digikoder.local', password: 'admin123' });
const loginOptions = {
  hostname: 'localhost',
  port: 3005,
  path: '/api/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': loginData.length
  }
};

const loginReq = http.request(loginOptions, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const { token } = JSON.parse(data);
    console.log('✅ Login OK, token:', token.substring(0, 20) + '...');
    
    // Test create category
    const catData = JSON.stringify({ id: 'meditation', label: 'Meditation', icon: 'Sparkles' });
    const catOptions = {
      hostname: 'localhost',
      port: 3005,
      path: '/api/categories',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Length': catData.length
      }
    };
    
    const catReq = http.request(catOptions, (res2) => {
      let catResult = '';
      res2.on('data', (chunk) => { catResult += chunk; });
      res2.on('end', () => {
        console.log('\n📝 Create category result:', JSON.parse(catResult));
        
        // List categories
        http.get('http://localhost:3005/api/categories', (res3) => {
          let list = '';
          res3.on('data', (chunk) => { list += chunk; });
          res3.on('end', () => {
            console.log('\n📋 Categories list:', JSON.parse(list));
            process.exit(0);
          });
        });
      });
    });
    
    catReq.write(catData);
    catReq.end();
  });
});

loginReq.write(loginData);
loginReq.end();
