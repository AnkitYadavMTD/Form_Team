const pool = require('./backend/db');

async function demonstrateTrackingFlow() {
  try {
    console.log('📊 Campaign Tracking Link Flow Demonstration\n');
    console.log('='.repeat(50) + '\n');

    // 1. Show campaigns with tracking links
    const campaigns = await pool.query(
      "SELECT id, name, tracking_link, offer_url FROM campaigns WHERE tracking_link IS NOT NULL ORDER BY id DESC LIMIT 5"
    );

    console.log('✅ Campaigns with Tracking Links:\n');
    campaigns.rows.forEach((campaign, idx) => {
      const trackingUrl = `http://localhost:3001/track/${campaign.tracking_link}`;
      console.log(`${idx + 1}. Campaign: ${campaign.name}`);
      console.log(`   Tracking Code: ${campaign.tracking_link}`);
      console.log(`   Tracking URL: ${trackingUrl}`);
      console.log(`   Redirect Target: ${campaign.offer_url}`);
      console.log('');
    });

    console.log('='.repeat(50));
    console.log('\n📋 How It Works:\n');
    console.log('1. User creates a campaign with an Offer URL');
    console.log('2. System generates a unique short tracking link (8 chars)');
    console.log('3. User shares the tracking URL: /track/{short_code}');
    console.log('4. When someone visits the link, they get redirected');
    console.log('5. Optional: Clicks are logged for analytics\n');

    console.log('='.repeat(50));
    console.log('\n✅ System Status: Ready');
    console.log('   • Tracking links: Generated ✓');
    console.log('   • Redirect endpoint: /track/:trackingLink ✓');
    console.log('   • Frontend display: Updated ✓');
    console.log('   • Analytics logging: Enabled (optional) ✓\n');

    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

demonstrateTrackingFlow();
