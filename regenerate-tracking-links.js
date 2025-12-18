const pool = require('./backend/db');

// Generate unique short tracking link (base62)
function generateTrackingLink() {
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function regenerateTrackingLinks() {
  try {
    console.log('🔄 Regenerating tracking links for campaigns...');
    
    // Get all campaigns without tracking links
    const campaigns = await pool.query(
      "SELECT id FROM campaigns WHERE tracking_link IS NULL"
    );
    
    console.log(`Found ${campaigns.rows.length} campaigns without tracking links`);
    
    for (const campaign of campaigns.rows) {
      let trackingLink;
      let isUnique = false;
      while (!isUnique) {
        trackingLink = generateTrackingLink();
        const existing = await pool.query(
          "SELECT id FROM campaigns WHERE tracking_link = $1",
          [trackingLink]
        );
        if (existing.rows.length === 0) {
          isUnique = true;
        }
      }
      
      await pool.query(
        "UPDATE campaigns SET tracking_link = $1 WHERE id = $2",
        [trackingLink, campaign.id]
      );
      console.log(`✅ Campaign ${campaign.id}: ${trackingLink}`);
    }
    
    console.log('✅ All tracking links generated!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

regenerateTrackingLinks();
