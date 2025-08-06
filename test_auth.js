// Simple test script to verify authentication endpoints
const fetch = require('node-fetch');

const baseURL = 'http://localhost:5000/api';

async function testAdminLogin() {
  try {
    console.log('Testing admin login...');
    const response = await fetch(`${baseURL}/auth/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mobile: '9876543210', // Test admin mobile
        password: 'admin123'   // Test admin password
      }),
    });

    const data = await response.json();
    console.log('Admin login response:', data);
    
    // Check cookies
    const cookies = response.headers.get('set-cookie');
    console.log('Cookies set:', cookies);
    
    return data;
  } catch (error) {
    console.error('Admin login test failed:', error);
  }
}

async function testTokenVerification() {
  try {
    console.log('\nTesting token verification...');
    const response = await fetch(`${baseURL}/auth/verify-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    console.log('Token verification response:', data);
    
    return data;
  } catch (error) {
    console.error('Token verification test failed:', error);
  }
}

async function runTests() {
  console.log('Starting authentication tests...\n');
  
  await testAdminLogin();
  await testTokenVerification();
  
  console.log('\nTests completed.');
}

runTests();
