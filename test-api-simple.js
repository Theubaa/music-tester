const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Test configuration
const API_BASE_URL = 'http://localhost:3000';

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (error) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}

async function testAPI() {
  console.log('🧪 Testing Music Analysis API...\n');

  // Test 1: Health Check
  console.log('1. Testing Health Check...');
  try {
    const healthResponse = await makeRequest(`${API_BASE_URL}/api/health`);
    console.log('✅ Health Check:', healthResponse.data);
  } catch (error) {
    console.log('❌ Health Check Failed:', error.message);
  }

  // Test 2: Error handling (no file)
  console.log('\n2. Testing Error Handling (No File)...');
  try {
    const errorResponse = await makeRequest(`${API_BASE_URL}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    console.log('✅ Error Handling:', errorResponse.data);
  } catch (error) {
    console.log('❌ Error Handling Test Failed:', error.message);
  }

  // Test 3: Wrong method
  console.log('\n3. Testing Wrong Method...');
  try {
    const methodResponse = await makeRequest(`${API_BASE_URL}/api/analyze`, {
      method: 'GET'
    });
    console.log('✅ Method Check:', methodResponse.data);
  } catch (error) {
    console.log('❌ Method Check Failed:', error.message);
  }

  console.log('\n🎉 API Testing Complete!');
  console.log('\n📝 API Endpoints:');
  console.log(`   Health Check: GET ${API_BASE_URL}/api/health`);
  console.log(`   Audio Analysis: POST ${API_BASE_URL}/api/analyze`);
  console.log('\n📋 Usage Examples:');
  console.log('   curl -X POST http://localhost:3000/api/analyze -F "audio=@your-audio-file.mp3"');
  console.log('   curl http://localhost:3000/api/health');
}

// Run tests if this file is executed directly
if (require.main === module) {
  testAPI().catch(console.error);
}

module.exports = { testAPI };
