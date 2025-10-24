const express = require('express');
const pool = require('./db');
const XLSX = require('xlsx');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Middleware for admin authentication
const adminAuth = (req, res, next) => {
  const token = req.headers.authorization;
  const adminToken = process.env.ADMIN_TOKEN || 'admin-token-123'; // Use env var for production
  if (token !== adminToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Create new form (admin only)
app.post('/api/forms', adminAuth, async (req, res) => {
  const { title, redirect_url } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO forms (title, redirect_url) VALUES ($1, $2) RETURNING *',
      [title, redirect_url]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create form' });
  }
});

// Get all forms (admin only)
app.get('/api/forms', adminAuth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM forms ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch forms' });
  }
});

// Get form by ID (public)
app.get('/api/forms/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM forms WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Form not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch form' });
  }
});

// Submit form data (public)
app.post('/api/forms/:id/submit', async (req, res) => {
  const { id } = req.params;
  const { name, number, pan } = req.body;
  try {
    // Check if form exists
    const formResult = await pool.query('SELECT redirect_url FROM forms WHERE id = $1', [id]);
    if (formResult.rows.length === 0) {
      return res.status(404).json({ error: 'Form not found' });
    }

    // Insert submission
    await pool.query(
      'INSERT INTO submissions (form_id, name, number, pan) VALUES ($1, $2, $3, $4)',
      [id, name, number, pan]
    );

    // Redirect to custom URL
    res.json({ redirect_url: formResult.rows[0].redirect_url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit form' });
  }
});

// Get submissions for a form (admin only)
app.get('/api/forms/:id/submissions', adminAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM submissions WHERE form_id = $1 ORDER BY submitted_at DESC',
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// Export submissions as Excel (admin only)
app.get('/api/forms/:id/export', adminAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT name, number, pan, submitted_at FROM submissions WHERE form_id = $1 ORDER BY submitted_at DESC',
      [id]
    );
    const submissions = result.rows;

    // Create a new workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(submissions);

    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Submissions');

    // Generate buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // Set headers for file download
    res.setHeader('Content-Disposition', 'attachment; filename="submissions.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to export submissions' });
  }
});

// Example route to test DB connection
app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ message: 'Database connected', time: result.rows[0].now });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
