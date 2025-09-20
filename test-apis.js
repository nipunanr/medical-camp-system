// Test script for API endpoints
const baseUrl = 'http://localhost:3001';

async function testAPI(endpoint, method = 'GET', data = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (data) {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(`${baseUrl}${endpoint}`, options);
    const result = await response.json();
    
    console.log(`\n=== ${method} ${endpoint} ===`);
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(result, null, 2));
    
    return { status: response.status, data: result };
  } catch (error) {
    console.error(`Error testing ${endpoint}:`, error.message);
    return { error: error.message };
  }
}

async function runTests() {
  console.log('🧪 Testing Medical Camp System APIs\n');
  
  // Test Settings API
  console.log('📁 Testing Settings API...');
  await testAPI('/api/settings');
  await testAPI('/api/settings', 'PUT', {
    key: 'test_setting',
    value: 'test_value',
    category: 'test',
    updatedBy: 'test_user'
  });
  
  // Test Medicine Issues API
  console.log('\n💊 Testing Medicine Issues API...');
  await testAPI('/api/medicine-issues');
  
  // Test Test Results API
  console.log('\n🔬 Testing Test Results API...');
  await testAPI('/api/test-results');
  
  // Test Reports API
  console.log('\n📊 Testing Reports API...');
  await testAPI('/api/reports?type=overview');
  
  console.log('\n✅ API testing completed!');
}

runTests().catch(console.error);