const pool = require('./backend/db');

async function updateCampaignStatus() {
  try {
    const result = await pool.query(
      "UPDATE campaigns SET status = 'stop' WHERE tracking_link = $1 RETURNING id, name, status, tracking_link",
      ['t_tecm6ukkzuzohvhm']
    );

    if (result.rows.length === 0) {
      console.log('Campaign not found');
    } else {
      console.log('Campaign updated:', result.rows[0]);
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    pool.end();
  }
}

updateCampaignStatus();
