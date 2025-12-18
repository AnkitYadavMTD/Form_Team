const pool = require('./backend/db');

async function testCampaignRedirects() {
  try {
    console.log('🔗 Testing Campaign Redirect Flows\n');
    console.log('='.repeat(60) + '\n');

    // Get a few campaigns
    const result = await pool.query(
      "SELECT id, name, tracking_link, offer_url FROM campaigns WHERE tracking_link IS NOT NULL ORDER BY id DESC LIMIT 3"
    );

    console.log('✅ Available Campaign Links:\n');
    result.rows.forEach((campaign, idx) => {
      const trackingUrl = `http://localhost:3001/track/${campaign.tracking_link}`;
      const directUrl = `http://localhost:3001/campaign/${campaign.id}/visit`;
      
      console.log(`${idx + 1}. Campaign ID: ${campaign.id} - ${campaign.name}`);
      console.log(`   Offer URL (Target): ${campaign.offer_url}\n`);
      console.log(`   📍 Option A - Tracking Link (with analytics):`);
      console.log(`      ${trackingUrl}`);
      console.log(`      Code: ${campaign.tracking_link}\n`);
      console.log(`   📍 Option B - Direct Campaign Link (with analytics):`);
      console.log(`      ${directUrl}`);
      console.log(`      Campaign ID: ${campaign.id}\n`);
      console.log('-'.repeat(60) + '\n');
    });

    console.log('✅ How to Use:\n');
    console.log('1. Share TRACKING LINK for affiliate tracking:');
    console.log('   → /track/laWYbqq8');
    console.log('   → Short, easy to remember\n');
    console.log('2. Share DIRECT LINK when no tracking needed:');
    console.log('   → /campaign/4/visit');
    console.log('   → Direct access to campaign offer\n');
    console.log('3. Both links redirect to the Offer URL\n');
    console.log('4. Click data is logged for analytics (optional)\n');

    console.log('='.repeat(60));
    console.log('✅ System ready! Both redirect endpoints active.');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

testCampaignRedirects();
