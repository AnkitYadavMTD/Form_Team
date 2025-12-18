const pool = require('./backend/db');

async function checkCampaigns() {
  try {
    const result = await pool.query(
      "SELECT id, name, tracking_link, offer_url FROM campaigns ORDER BY id DESC LIMIT 5"
    );
    console.log('Recent campaigns:');
    result.rows.forEach(c => {
      console.log(`  ID: ${c.id}, Link: ${c.tracking_link}, Offer: ${c.offer_url}`);
    });
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkCampaigns();
