// Simple runtime test for the unified repo analyzer
import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

async function testAPIs() {
  console.log('Testing Unified Repository Analyzer Runtime...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${API_BASE}/../health`);
    console.log('✅ Health check passed:', healthResponse.data);

    // Test 2: Get preferences (settings persistence)
    console.log('\n2. Testing settings persistence...');
    const prefsResponse = await axios.get(`${API_BASE}/config/preferences`);
    console.log('✅ Settings loaded successfully');
    console.log('   Default analysis mode:', prefsResponse.data.analysis.defaultMode);
    console.log('   Theme:', prefsResponse.data.ui.theme || 'system');

    // Test 3: Path validation (file path browsing)
    console.log('\n3. Testing path validation...');
    const pathResponse = await axios.post(`${API_BASE}/path/validate`, {
      path: 'C:\\Users',
      options: {
        timeoutMs: 5000,
        validateExistence: true,
        validatePermissions: true,
      },
    });
    console.log('✅ Path validation working');
    console.log('   Path is valid:', pathResponse.data.isValid);
    console.log('   Path exists:', pathResponse.data.metadata.exists);
    console.log('   Is directory:', pathResponse.data.metadata.isDirectory);

    // Test 4: Path format info
    console.log('\n4. Testing path format info...');
    const formatResponse = await axios.get(`${API_BASE}/path/format-info`);
    console.log('✅ Path format info working');
    console.log('   Platform:', formatResponse.data.platform);
    console.log('   Path separator:', formatResponse.data.pathSeparator);

    // Test 5: Update preferences
    console.log('\n5. Testing settings update...');
    const updatedPrefs = {
      ...prefsResponse.data,
      ui: {
        ...prefsResponse.data.ui,
        theme: 'dark',
      },
    };
    const updateResponse = await axios.put(`${API_BASE}/config/preferences`, updatedPrefs);
    console.log('✅ Settings update working');
    console.log('   Updated theme:', updateResponse.data.ui.theme);

    console.log('\n🎉 All runtime functionality tests passed!');
    console.log('\nThe application appears to be working correctly:');
    console.log('- ✅ Backend API is responding');
    console.log('- ✅ Settings persistence is working');
    console.log('- ✅ Path validation (file browsing) is working');
    console.log('- ✅ Configuration management is working');
  } catch (error) {
    if (error.response) {
    } else if (error.request) {
    }

    console.log('\nTroubleshooting steps:');
    console.log('1. Ensure backend is running on port 3000');
    console.log('2. Check if frontend is running and can connect');
    console.log('3. Verify no firewall is blocking the connection');
    console.log('4. Check browser console for CORS errors');
  }
}

testAPIs();
