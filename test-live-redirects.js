const axios = require('axios');

const BACKEND_URL = 'https://form-team.onrender.com';
const FRONTEND_URL = 'https://form-team-u8em.vercel.app';

async function testLiveRedirects() {
  console.log('🧪 Testing Live Campaign Status Redirects\n');
  console.log('='.repeat(60) + '\n');

  try {
    // Test 1: Invalid tracking link
    console.log('❌ Test 1: Invalid tracking link\n');
    try {
      const invalidResponse = await axios.get(`${BACKEND_URL}/track/`, {
        maxRedirects: 0,
        validateStatus: function (status) {
          return status >= 200 && status < 400;
        }
      });

      if (invalidResponse.status === 302 && invalidResponse.headers.location === `${FRONTEND_URL}/campaign-stop?reason=invalid`) {
        console.log('✅ PASS: Invalid link redirects to campaign-stop with reason=invalid\n');
      } else {
        console.log(`❌ FAIL: Expected redirect to ${FRONTEND_URL}/campaign-stop?reason=invalid, got ${invalidResponse.headers.location}\n`);
      }
    } catch (error) {
      console.log('❌ FAIL: Error testing invalid link redirect\n', error.message);
    }

    // Test 2: Non-existent tracking link
    console.log('🔍 Test 2: Non-existent tracking link\n');
    try {
      const notFoundResponse = await axios.get(`${BACKEND_URL}/track/nonexistent123`, {
        maxRedirects: 0,
        validateStatus: function (status) {
          return status >= 200 && status < 400;
        }
      });

      if (notFoundResponse.status === 302 && notFoundResponse.headers.location === `${FRONTEND_URL}/campaign-stop?reason=not_found`) {
        console.log('✅ PASS: Non-existent link redirects to campaign-stop with reason=not_found\n');
      } else {
        console.log(`❌ FAIL: Expected redirect to ${FRONTEND_URL}/campaign-stop?reason=not_found, got ${notFoundResponse.headers.location}\n`);
      }
    } catch (error) {
      console.log('❌ FAIL: Error testing non-existent link redirect\n', error.message);
    }

    // Test 3: Test with a known stopped campaign (if available)
    console.log('🔴 Test 3: Stopped campaign (using demo tracking link)\n');
    try {
      // Using the tracking link from the user's original message: t_tecm6ukkzuzohvhm
      const stopResponse = await axios.get(`${BACKEND_URL}/track/t_tecm6ukkzuzohvhm`, {
        maxRedirects: 0,
        validateStatus: function (status) {
          return status >= 200 && status < 400;
        }
      });

      if (stopResponse.status === 302 && stopResponse.headers.location === `${FRONTEND_URL}/campaign-stop?reason=stop`) {
        console.log('✅ PASS: Stopped campaign redirects to campaign-stop with reason=stop\n');
      } else {
        console.log(`❌ FAIL: Expected redirect to ${FRONTEND_URL}/campaign-stop?reason=stop, got ${stopResponse.headers.location}\n`);
      }
    } catch (error) {
      console.log('❌ FAIL: Error testing stopped campaign redirect\n', error.message);
    }

    console.log('✅ Live redirect tests completed!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

testLiveRedirects();
