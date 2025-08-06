#!/usr/bin/env node

/**
 * Local Admin Login Test Script
 * Tests the admin authentication flow locally
 */

const BASE_URL = 'http://localhost:5000/api';

// Test credentials
const ADMIN_CREDENTIALS = [
  { mobile: '9999999999', password: 'admin123' },
  { mobile: '8888888888', password: 'iasdesk2025' }
];

async function testAdminLogin(mobile, password) {
  console.log(`\n🔐 Testing admin login: ${mobile}`);
  
  try {
    // Step 1: Admin Login
    const loginResponse = await fetch(`${BASE_URL}/auth/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mobile, password }),
    });

    const loginData = await loginResponse.json();
    
    if (!loginData.success) {
      console.log('❌ Login failed:', loginData.message);
      return false;
    }

    console.log('✅ Login successful!');
    console.log('👤 User:', loginData.data.user.name);
    console.log('🎫 Token received:', loginData.data.token ? 'Yes' : 'No');
    console.log('🔑 Admin privileges:', loginData.data.user.isAdmin);
    console.log('📋 Role:', loginData.data.user.role);

    const token = loginData.data.token;

    // Step 2: Verify Admin Token
    console.log('\n🔍 Verifying admin token...');
    
    const verifyResponse = await fetch(`${BASE_URL}/auth/verify-admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const verifyData = await verifyResponse.json();
    
    if (verifyData.success) {
      console.log('✅ Token verification successful!');
      console.log('👤 Verified user:', verifyData.data.user.name);
      console.log('🔑 Admin status:', verifyData.data.isAdmin);
      return true;
    } else {
      console.log('❌ Token verification failed:', verifyData.message);
      return false;
    }

  } catch (error) {
    console.log('❌ Network error:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting Admin Authentication Tests');
  console.log('=' .repeat(50));

  // Check if server is running
  try {
    const healthCheck = await fetch(`${BASE_URL}/auth/verify-admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    console.log('✅ Backend server is responding');
  } catch (error) {
    console.log('❌ Backend server is not running!');
    console.log('💡 Please start the backend server with: npm start');
    return;
  }

  let successCount = 0;
  
  for (const cred of ADMIN_CREDENTIALS) {
    const success = await testAdminLogin(cred.mobile, cred.password);
    if (success) successCount++;
  }

  console.log('\n' + '=' .repeat(50));
  console.log(`📊 Test Results: ${successCount}/${ADMIN_CREDENTIALS.length} passed`);
  
  if (successCount === ADMIN_CREDENTIALS.length) {
    console.log('🎉 All admin authentication tests passed!');
    console.log('✅ You can now test the frontend admin login');
  } else {
    console.log('⚠️  Some tests failed. Check the backend logs.');
  }
}

// Run the tests
runTests().catch(console.error);
