const pool = require('./backend/db');

async function checkCampaignStatus() {
  try {
    const result = await pool.query(
      "SELECT id, name, status, tracking_link, offer_url FROM campaigns WHERE tracking_link = $1",
      ['t_tecm6ukkzuzohvhm']
    );

    if (result.rows.length === 0) {
      console.log('Campaign not found');
    } else {
      console.log('Campaign found:', result.rows[0]);
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    pool.end();
  }
}

checkCampaignStatus();
