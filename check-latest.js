const pool = require('./backend/db');

async function checkLatestCampaign() {
  try {
    const result = await pool.query(
      "SELECT id, name, tracking_link FROM campaigns ORDER BY id DESC LIMIT 1"
    );
    console.log('Latest campaign:', result.rows[0]);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkLatestCampaign();
