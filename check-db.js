const pool = require('./backend/db');

async function checkDatabase() {
  try {
    console.log('Checking campaigns table...');
    const result = await pool.query("SELECT * FROM campaigns LIMIT 1");
    console.log('✅ Campaigns table exists!');
    console.log('Query successful');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkDatabase();
