const axios = require('axios');
const jwt = require('jsonwebtoken');

const baseUrl = 'http://localhost:3001';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const testToken = jwt.sign(
  { adminId: 1, email: 'test@example.com', adminRole: 'admin' },
  JWT_SECRET,
  { expiresIn: '24h' }
);

console.log('🔐 Testing Campaign Tracking Links\n');

const runTests = async () => {
  try {
    // 1. Create a new campaign with tracking link
    console.log('1️⃣ Creating campaign with tracking link...');
    const createRes = await axios.post(
      `${baseUrl}/api/campaigns`,
      {
        name: 'Tracking Test Campaign',
        advertiser: 'Test Advertiser',
        category: 'Technology',
        payout_type: 'CPA',
        payout_amount: 50,
        conversion_event: 'Purchase',
        offer_url: 'https://example.com/offer',
      },
      { headers: { 'Authorization': `Bearer ${testToken}` } }
    );

    const campaign = createRes.data.data || createRes.data;
    if (!campaign || !campaign.id) {
      console.log('Full response:', createRes.data);
      throw new Error('No campaign data returned');
    }
    console.log(`✅ Campaign created with ID: ${campaign.id}`);
    console.log(`   Tracking Link: ${campaign.tracking_link}\n`);

    // 2. Get tracking link via endpoint
    console.log('2️⃣ Fetching tracking link via API...');
    const linkRes = await axios.get(
      `${baseUrl}/api/campaigns/${campaign.id}/tracking-link`,
      { headers: { 'Authorization': `Bearer ${testToken}` } }
    );
    console.log(`✅ Retrieved tracking link: ${linkRes.data.data.tracking_link}\n`);

    // 3. Regenerate tracking link
    console.log('3️⃣ Regenerating tracking link...');
    const regenRes = await axios.post(
      `${baseUrl}/api/campaigns/${campaign.id}/regenerate-tracking-link`,
      {},
      { headers: { 'Authorization': `Bearer ${testToken}` } }
    );
    console.log(`✅ New tracking link: ${regenRes.data.data.tracking_link}\n`);

    // 4. Fetch all campaigns and verify tracking links exist
    console.log('4️⃣ Fetching all campaigns...');
    const allRes = await axios.get(
      `${baseUrl}/api/campaigns`,
      { headers: { 'Authorization': `Bearer ${testToken}` } }
    );
    
    const campaignsWithLinks = allRes.data.data.filter(c => c.tracking_link);
    console.log(`✅ ${campaignsWithLinks.length} campaigns with tracking links`);
    campaignsWithLinks.forEach(c => {
      console.log(`   - ${c.name}: ${c.tracking_link}`);
    });

    console.log('\n✅ All tracking link tests passed!');
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
};

runTests();
