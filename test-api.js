const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');

// Test configuration
const API_BASE_URL = 'http://localhost:3000';
const TEST_AUDIO_PATH = path.join(__dirname, 'test-audio.mp3');

async function testAPI() {
  console.log('🧪 Testing Music Analysis API...\n');

  // Test 1: Health Check
  console.log('1. Testing Health Check...');
  try {
    const healthResponse = await fetch(`${API_BASE_URL}/api/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health Check:', healthData);
  } catch (error) {
    console.log('❌ Health Check Failed:', error.message);
  }

  // Test 2: Audio Analysis (if test file exists)
  console.log('\n2. Testing Audio Analysis...');
  if (fs.existsSync(TEST_AUDIO_PATH)) {
    try {
      const form = new FormData();
      form.append('audio', fs.createReadStream(TEST_AUDIO_PATH));

      const analysisResponse = await fetch(`${API_BASE_URL}/api/analyze`, {
        method: 'POST',
        body: form
      });

      const analysisData = await analysisResponse.json();
      console.log('✅ Audio Analysis:', JSON.stringify(analysisData, null, 2));
    } catch (error) {
      console.log('❌ Audio Analysis Failed:', error.message);
    }
  } else {
    console.log('⚠️  Test audio file not found. Create a test-audio.mp3 file to test audio analysis.');
  }

  // Test 3: Error handling
  console.log('\n3. Testing Error Handling...');
  try {
    const errorResponse = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });

    const errorData = await errorResponse.json();
    console.log('✅ Error Handling:', errorData);
  } catch (error) {
    console.log('❌ Error Handling Test Failed:', error.message);
  }

  console.log('\n🎉 API Testing Complete!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  testAPI().catch(console.error);
}

module.exports = { testAPI };
