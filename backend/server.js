const express = require("express");
const pool = require("./db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { exportSubmissionsToExcel } = require("./exportUtils");

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"; // Use env var for production

app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.json({ message: "Team Form Builder API is running" });
});

// Middleware for admin authentication
const adminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.adminId = decoded.adminId;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

// Generate unique form ID
function generateFormId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Create new form (admin only)
app.post("/api/forms", adminAuth, async (req, res) => {
  const { title, redirect_url, fields } = req.body;
  try {
    let formId;
    let isUnique = false;

    // Generate unique ID
    while (!isUnique) {
      formId = generateFormId();
      const existing = await pool.query("SELECT id FROM forms WHERE id = $1", [
        formId,
      ]);
      if (existing.rows.length === 0) {
        isUnique = true;
      }
    }

    const result = await pool.query(
      "INSERT INTO forms (id, admin_id, title, redirect_url, fields) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [formId, req.adminId, title, redirect_url, JSON.stringify(fields || [])]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create form" });
  }
});

// Get all forms (admin only)
app.get("/api/forms", adminAuth, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM forms WHERE admin_id = $1 ORDER BY created_at DESC",
      [req.adminId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch forms" });
  }
});

// Get form by ID (public)
app.get("/api/forms/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM forms WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Form not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch form" });
  }
});

// Submit form data (public)
app.post("/api/forms/:id/submit", async (req, res) => {
  const { id } = req.params;
  const submissionData = req.body;
  try {
    // Check if form exists
    const formResult = await pool.query(
      "SELECT redirect_url FROM forms WHERE id = $1",
      [id]
    );
    if (formResult.rows.length === 0) {
      return res.status(404).json({ error: "Form not found" });
    }

    // Insert submission
    await pool.query(
      "INSERT INTO submissions (form_id, data) VALUES ($1, $2)",
      [id, submissionData]
    );

    // Redirect to custom URL
    res.json({ redirect_url: formResult.rows[0].redirect_url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit form" });
  }
});

// Get submissions for a form (admin only)
app.get("/api/forms/:id/submissions", adminAuth, async (req, res) => {
  const { id } = req.params;
  try {
    // First check if the form belongs to the authenticated admin
    const formCheck = await pool.query(
      "SELECT id FROM forms WHERE id = $1 AND admin_id = $2",
      [id, req.adminId]
    );

    if (formCheck.rows.length === 0) {
      return res.status(404).json({ error: "Form not found or access denied" });
    }

    const result = await pool.query(
      "SELECT id, form_id, data, submitted_at FROM submissions WHERE form_id = $1 ORDER BY submitted_at DESC",
      [id]
    );

    // Process the data to ensure it's properly formatted
    const submissions = result.rows.map((row) => ({
      ...row,
      data: (() => {
        let parsedData = {};

        try {
          if (typeof row.data === "object" && row.data !== null) {
            // Already JSON object
            parsedData = row.data;
          } else if (typeof row.data === "string") {
            // Try to parse JSON string
            parsedData = JSON.parse(row.data);
          } else {
            parsedData = {};
          }
        } catch (err) {
          console.warn("Failed to parse submission data:", row.data);
          parsedData = {};
        }

        return parsedData;
      })(),
    }));

    res.json(submissions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch submissions" });
  }
});

// Export submissions as Excel (admin only)
app.get("/api/forms/:id/export", adminAuth, async (req, res) => {
  const { id } = req.params;

  try {
    // Verify form ownership
    const formCheck = await pool.query(
      "SELECT id, title FROM forms WHERE id = $1 AND admin_id = $2",
      [id, req.adminId]
    );

    if (formCheck.rows.length === 0) {
      return res.status(404).json({ error: "Form not found or access denied" });
    }

    // Fetch submissions
    const result = await pool.query(
      "SELECT id, data, submitted_at FROM submissions WHERE form_id = $1 ORDER BY submitted_at DESC",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No submissions found" });
    }

    // Use the utility function to export submissions
    const buffer = exportSubmissionsToExcel(
      result.rows,
      formCheck.rows[0].title
    );

    // Send Excel file
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${
        formCheck.rows[0].title || "form"
      }_submissions.xlsx"`
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.send(buffer);
  } catch (err) {
    console.error("Export error:", err);
    res.status(500).json({ error: "Failed to export submissions" });
  }
});

// Delete form (admin only)
app.delete("/api/forms/:id", adminAuth, async (req, res) => {
  const { id } = req.params;
  try {
    // First check if the form belongs to the authenticated admin
    const formCheck = await pool.query(
      "SELECT id FROM forms WHERE id = $1 AND admin_id = $2",
      [id, req.adminId]
    );

    if (formCheck.rows.length === 0) {
      return res.status(404).json({ error: "Form not found or access denied" });
    }

    const result = await pool.query(
      "DELETE FROM forms WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Form not found" });
    }
    res.json({ message: "Form deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete form" });
  }
});

// Admin registration
app.post("/api/auth/register", async (req, res) => {
  const {
    name,
    fullName,
    mobileNumber,
    email,
    password,
    city,
    plan,
    termsAgreed,
  } = req.body;

  if (
    !name ||
    !fullName ||
    !mobileNumber ||
    !email ||
    !password ||
    !city ||
    !plan ||
    termsAgreed === undefined
  ) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (!termsAgreed) {
    return res
      .status(400)
      .json({ error: "You must agree to the terms and conditions" });
  }

  try {
    // Check if admin already exists
    const existingAdmin = await pool.query(
      "SELECT id FROM admins WHERE email = $1",
      [email]
    );
    if (existingAdmin.rows.length > 0) {
      return res.status(400).json({ error: "Admin already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin
    const result = await pool.query(
      "INSERT INTO admins (name, full_name, mobile_number, email, password, city, plan, terms_agreed) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, name, full_name, mobile_number, email, city, plan, terms_agreed, created_at",
      [
        name,
        fullName,
        mobileNumber,
        email,
        hashedPassword,
        city,
        plan,
        termsAgreed,
      ]
    );

    res.status(201).json({
      message: "Admin registered successfully",
      admin: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to register admin" });
  }
});

// Admin login
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    // Find admin
    const result = await pool.query(
      "SELECT id, email, password FROM admins WHERE email = $1",
      [email]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const admin = result.rows[0];

    // Check password
    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { adminId: admin.id, email: admin.email },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      message: "Login successful",
      token,
      admin: { id: admin.id, email: admin.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to login" });
  }
});

// Example route to test DB connection
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ message: "Database connected", time: result.rows[0].now });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database connection failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
