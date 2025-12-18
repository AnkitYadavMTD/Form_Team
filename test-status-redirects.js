const axios = require('axios');
const jwt = require('jsonwebtoken');
const pool = require('./backend/db');

const baseUrl = 'http://localhost:3001';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Create a test token manually
const testToken = jwt.sign(
  {
    adminId: 1,
    email: 'test@example.com',
    adminRole: 'admin',
  },
  JWT_SECRET,
  { expiresIn: '24h' }
);

async function testStatusRedirects() {
  try {
    console.log('🧪 Testing Campaign Status Redirects\n');
    console.log('='.repeat(60) + '\n');

    // Create a test campaign
    console.log('📝 Creating test campaign...\n');

    const campaignData = {
      name: 'Status Test Campaign',
      advertiser: 'Test Corp',
      category: 'Testing',
      status: 'active',
      payout_type: 'CPA',
      payout_amount: 50.00,
      currency: 'USD',
      conversion_event: 'Purchase',
      offer_url: 'https://example.com/offer',
    };

    const createResponse = await axios.post(
      `${baseUrl}/api/campaigns`,
      campaignData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${testToken}`,
        },
      }
    );

    const campaignId = createResponse.data.data.id;
    const trackingLink = createResponse.data.data.tracking_link;

    console.log(`✅ Campaign created with ID: ${campaignId}`);
    console.log(`📊 Tracking Link: ${trackingLink}\n`);

    // Test 1: Active campaign should redirect to offer URL
    console.log('🟢 Test 1: Active campaign redirect\n');
    try {
      const activeResponse = await axios.get(`${baseUrl}/track/${trackingLink}`, {
        maxRedirects: 0,
        validateStatus: function (status) {
          return status >= 200 && status < 400;
        }
      });

      if (activeResponse.status === 302 && activeResponse.headers.location === 'https://example.com/offer') {
        console.log('✅ PASS: Active campaign redirects to offer URL\n');
      } else {
        console.log(`❌ FAIL: Expected redirect to offer URL, got status ${activeResponse.status}\n`);
      }
    } catch (error) {
      console.log('❌ FAIL: Error testing active campaign redirect\n');
    }

    // Test 2: Stop campaign
    console.log('🔴 Test 2: Stopped campaign redirect\n');

    await axios.put(
      `${baseUrl}/api/campaigns/${campaignId}`,
      { status: 'Stop' },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${testToken}`,
        },
      }
    );

    try {
      const stopResponse = await axios.get(`${baseUrl}/track/${trackingLink}`, {
        maxRedirects: 0,
        validateStatus: function (status) {
          return status >= 200 && status < 400;
        }
      });

      if (stopResponse.status === 302 && stopResponse.headers.location.includes('/campaign-stop?reason=stop')) {
        console.log('✅ PASS: Stopped campaign redirects to campaign-stop page\n');
      } else {
        console.log(`❌ FAIL: Expected redirect to campaign-stop, got ${stopResponse.headers.location}\n`);
      }
    } catch (error) {
      console.log('❌ FAIL: Error testing stopped campaign redirect\n');
    }

    // Test 3: Expire campaign
    console.log('⏰ Test 3: Expired campaign redirect\n');

    await axios.put(
      `${baseUrl}/api/campaigns/${campaignId}`,
      { status: 'Expire' },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${testToken}`,
        },
      }
    );

    try {
      const expireResponse = await axios.get(`${baseUrl}/track/${trackingLink}`, {
        maxRedirects: 0,
        validateStatus: function (status) {
          return status >= 200 && status < 400;
        }
      });

      if (expireResponse.status === 302 && expireResponse.headers.location.includes('/campaign-stop?reason=expire')) {
        console.log('✅ PASS: Expired campaign redirects to campaign-stop page\n');
      } else {
        console.log(`❌ FAIL: Expected redirect to campaign-stop, got ${expireResponse.headers.location}\n`);
      }
    } catch (error) {
      console.log('❌ FAIL: Error testing expired campaign redirect\n');
    }

    // Clean up: Delete test campaign
    console.log('🧹 Cleaning up test campaign...\n');
    await axios.delete(`${baseUrl}/api/campaigns/${campaignId}`, {
      headers: {
        'Authorization': `Bearer ${testToken}`,
      },
    });

    console.log('✅ Test completed successfully!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

testStatusRedirects();
