const axios = require('axios');

const baseUrl = 'http://localhost:3001';

console.log('🔗 Testing Tracking Link Redirect\n');

const testRedirect = async () => {
  try {
    // Get a campaign to test
    const campaignsRes = await axios.get(`${baseUrl}/test-db`);
    console.log('✅ Server is running\n');

    // Test a few tracking links
    const testLinks = ['laWYbqq8', 'w3qTgiMc', 'lOG2tiwe'];

    for (const link of testLinks) {
      console.log(`Testing redirect for: ${link}`);
      try {
        const response = await axios.get(
          `${baseUrl}/track/${link}`,
          { maxRedirects: 0 }
        );
        console.log(`  Status: ${response.status}`);
      } catch (err) {
        if (err.response?.status === 302 || err.response?.status === 301) {
          console.log(`  ✅ Redirects to: ${err.response.headers.location}`);
        } else if (err.response?.status === 404) {
          console.log(`  ❌ Campaign not found`);
        } else {
          console.log(`  Status: ${err.response?.status || 'Error'}`);
        }
      }
    }

    console.log('\n✅ Redirect tests completed!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

testRedirect();
