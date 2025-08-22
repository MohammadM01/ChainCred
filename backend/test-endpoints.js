const http = require('http');

/**
 * Simple script to test backend endpoints
 */

const BASE_URL = 'http://localhost:3000';

function testEndpoint(path, description) {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}${path}`;
    console.log(`\n🔍 Testing: ${description}`);
    console.log(`   URL: ${url}`);
    
    http.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`   Status: ${res.statusCode}`);
        console.log(`   Headers:`, res.headers);
        
        if (res.statusCode === 200) {
          console.log(`   ✅ Success`);
          try {
            const jsonData = JSON.parse(data);
            console.log(`   Response:`, JSON.stringify(jsonData, null, 2));
          } catch (e) {
            console.log(`   Response: ${data.substring(0, 200)}...`);
          }
        } else {
          console.log(`   ❌ Failed with status ${res.statusCode}`);
          try {
            const jsonData = JSON.parse(data);
            console.log(`   Error:`, JSON.stringify(jsonData, null, 2));
          } catch (e) {
            console.log(`   Response: ${data.substring(0, 200)}...`);
          }
        }
        resolve();
      });
    }).on('error', (err) => {
      console.log(`   ❌ Connection error: ${err.message}`);
      reject(err);
    });
  });
}

async function runTests() {
  console.log('🚀 Starting backend endpoint tests...\n');
  
  try {
    // Test 1: Health check
    await testEndpoint('/', 'Health check');
    
    // Test 2: Test files endpoint
    await testEndpoint('/test/files', 'Test files endpoint');
    
    // Test 3: Try to access a specific file that exists
    await testEndpoint('/files/585fa5341fcf17ad08bd5605296625ed160649412df320b4fcd6c3d5d1d166d9.pdf', 'Access existing PDF file');
    
    // Test 4: Try to access a specific file that doesn't exist
    await testEndpoint('/files/nonexistent.pdf', 'Access non-existent file');
    
    // Test 5: Test certificate lookup endpoint
    await testEndpoint('/certificate/585fa5341fcf17ad08bd5605296625ed160649412df320b4fcd6c3d5d1d166d9', 'Certificate lookup');
    
    console.log('\n✅ All tests completed!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }
}

// Run tests
runTests();
