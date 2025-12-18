const axios = require('axios');
const jwt = require('jsonwebtoken');

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

console.log('🔐 Generated Test Token:', testToken);
console.log('');

// Create campaign
const createCampaign = async () => {
  try {
    console.log('📝 Creating test campaign...\n');
    
    const campaignData = {
      name: 'Black Friday 2024',
      advertiser: 'TechStore Inc',
      category: 'Technology',
      status: 'active',
      payout_type: 'CPA',
      payout_amount: 75.50,
      currency: 'USD',
      conversion_event: 'Purchase',
      sale_percentage: 10,
      offer_url: 'https://techstore.com/offers/black-friday',
      postback_url: 'https://api.example.com/postback',
      tracking_parameters: {
        utm_source: 'affiliate',
        utm_medium: 'cpa',
        utm_campaign: 'black_friday_2024',
      },
    };

    const response = await axios.post(
      `${baseUrl}/api/campaigns`,
      campaignData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${testToken}`,
        },
      }
    );

    console.log('✅ Campaign created successfully!');
    console.log('\n📊 Campaign Details:');
    console.log(JSON.stringify(response.data, null, 2));
    
    return response.data.data?.id;
  } catch (error) {
    console.error('❌ Failed to create campaign:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
    process.exit(1);
  }
};

// Get all campaigns
const getAllCampaigns = async () => {
  try {
    console.log('\n📋 Fetching all campaigns...\n');
    
    const response = await axios.get(
      `${baseUrl}/api/campaigns`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${testToken}`,
        },
      }
    );

    console.log('✅ Campaigns fetched successfully!');
    console.log('\n📊 Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data.data && response.data.data.length > 0) {
      return response.data.data[0].id;
    }
  } catch (error) {
    console.error('❌ Failed to fetch campaigns:', error.response?.data || error.message);
  }
};

// Get campaign by ID
const getCampaignById = async (campaignId) => {
  try {
    console.log(`\n🔍 Fetching campaign ${campaignId}...\n`);
    
    const response = await axios.get(
      `${baseUrl}/api/campaigns/${campaignId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${testToken}`,
        },
      }
    );

    console.log('✅ Campaign fetched successfully!');
    console.log('\n📊 Response:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Failed to fetch campaign:', error.response?.data || error.message);
  }
};

// Update campaign
const updateCampaign = async (campaignId) => {
  try {
    console.log(`\n✏️ Updating campaign ${campaignId}...\n`);
    
    const updateData = {
      name: 'Black Friday 2024 - Updated',
      payout_amount: 85.00,
      status: 'active',
    };

    const response = await axios.put(
      `${baseUrl}/api/campaigns/${campaignId}`,
      updateData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${testToken}`,
        },
      }
    );

    console.log('✅ Campaign updated successfully!');
    console.log('\n📊 Response:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Failed to update campaign:', error.response?.data || error.message);
  }
};

// Delete campaign
const deleteCampaign = async (campaignId) => {
  try {
    console.log(`\n🗑️ Deleting campaign ${campaignId}...\n`);
    
    const response = await axios.delete(
      `${baseUrl}/api/campaigns/${campaignId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${testToken}`,
        },
      }
    );

    console.log('✅ Campaign deleted successfully!');
    console.log('\n📊 Response:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Failed to delete campaign:', error.response?.data || error.message);
  }
};

// Run tests
const runTests = async () => {
  try {
    // Create campaign
    const campaignId = await createCampaign().then(() => 
      getAllCampaigns().then(id => id)
    );

    if (campaignId) {
      // Get campaign by ID
      await getCampaignById(campaignId);

      // Update campaign
      await updateCampaign(campaignId);

      // Delete campaign
      await deleteCampaign(campaignId);
    }

    console.log('\n✅ All tests completed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

runTests();
