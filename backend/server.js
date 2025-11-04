require("dotenv").config();
const express = require("express");
const pool = require("./db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { exportSubmissionsToExcel } = require("./exportUtils");

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"; // Use env var for production

// Email transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for port 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email transporter error:", error);
  } else {
    console.log("✅ Mail transporter ready");
  }
});

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
    req.adminRole = decoded.adminRole || "admin";
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

// Middleware for superadmin authentication
const superadminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.adminId = decoded.adminId;
    req.adminRole = decoded.adminRole || "admin";
    if (req.adminRole !== "superadmin") {
      return res.status(403).json({ error: "Superadmin access required" });
    }
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

// Send OTP for email verification
app.post("/api/auth/send-otp", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    // Check if admin already exists and is verified
    const existingAdmin = await pool.query(
      "SELECT id, is_verified FROM admins WHERE email = $1",
      [email]
    );
    if (existingAdmin.rows.length > 0 && existingAdmin.rows[0].is_verified) {
      return res
        .status(400)
        .json({ error: "Admin already exists and is verified" });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any existing OTP for this email
    await pool.query("DELETE FROM otp_verifications WHERE email = $1", [email]);

    // Insert new OTP
    await pool.query(
      "INSERT INTO otp_verifications (email, otp, expires_at) VALUES ($1, $2, $3)",
      [email, otp, expiresAt]
    );

    // Log OTP for development
    console.log(`OTP for ${email}: ${otp} (expires in 10 minutes)`);

    // For development: Log OTP instead of sending email
    console.log(`OTP for ${email}: ${otp} (expires in 10 minutes)`);

    // Uncomment the following code to enable email sending in production

    // Send email
    const mailOptions = {
      from: '"RT Form" <rtform2025@gmail.com>',
      to: email,
      subject: "RT Form - Email Verification OTP",
      text: `Welcome to RT Form!\n\nYour OTP for email verification is: ${otp}\n\nThis OTP expires in 10 minutes.\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nRT Form Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to RT Form!</h2>
          <p>Your OTP for email verification is:</p>
          <div style="background-color: #f0f0f0; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0;">
            ${otp}
          </div>
          <p>This OTP expires in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <p>Best regards,<br>RT Form Team</p>
        </div>
      `,
    };

    console.log("Attempting to send email with options:", {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
      otp: otp,
    });

    try {
      await transporter.sendMail(mailOptions);
      console.log("Email sent successfully");
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      throw emailError;
    }

    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

// Verify OTP
app.post("/api/auth/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ error: "Email and OTP are required" });
  }

  try {
    const result = await pool.query(
      "SELECT otp, expires_at FROM otp_verifications WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "OTP not found" });
    }

    const { otp: storedOtp, expires_at } = result.rows[0];

    if (new Date() > new Date(expires_at)) {
      return res.status(400).json({ error: "OTP expired" });
    }

    if (otp !== storedOtp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // Delete OTP after verification
    await pool.query("DELETE FROM otp_verifications WHERE email = $1", [email]);

    res.json({ message: "OTP verified successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to verify OTP" });
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
    // Check if admin already exists and is verified
    const existingAdmin = await pool.query(
      "SELECT id, is_verified, approval_status FROM admins WHERE email = $1",
      [email]
    );
    if (
      existingAdmin.rows.length > 0 &&
      existingAdmin.rows[0].is_verified &&
      existingAdmin.rows[0].approval_status === "approved"
    ) {
      return res
        .status(400)
        .json({ error: "Admin already exists and is approved" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create or update admin with pending status
    const result = await pool.query(
      `INSERT INTO admins (name, full_name, mobile_number, email, password, city, plan, terms_agreed, is_verified, approval_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, 'pending')
       ON CONFLICT (email) DO UPDATE SET
         name = EXCLUDED.name,
         full_name = EXCLUDED.full_name,
         mobile_number = EXCLUDED.mobile_number,
         password = EXCLUDED.password,
         city = EXCLUDED.city,
         plan = EXCLUDED.plan,
         terms_agreed = EXCLUDED.terms_agreed,
         is_verified = true,
         approval_status = 'pending'
       RETURNING id, name, full_name, mobile_number, email, city, plan, terms_agreed, approval_status, created_at`,
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
      message:
        "Admin registered successfully. Your account is pending approval.",
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
      "SELECT id, email, password, approval_status, rejection_reason, role FROM admins WHERE email = $1",
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

    // Check approval status
    if (admin.approval_status === "pending") {
      return res.status(403).json({
        error:
          "Your account is pending approval. Please wait for admin approval.",
        status: "pending",
      });
    }

    if (admin.approval_status === "rejected") {
      return res.status(403).json({
        error: `Your account has been rejected. Reason: ${
          admin.rejection_reason || "No reason provided"
        }`,
        status: "rejected",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        adminId: admin.id,
        email: admin.email,
        adminRole: admin.role || "admin",
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      message: "Login successful",
      token,
      admin: { id: admin.id, email: admin.email },
      adminRole: admin.role || "admin",
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

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Get pending users (superadmin only)
app.get("/api/admin/pending-users", superadminAuth, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, full_name, mobile_number, email, city, plan, role, created_at FROM admins WHERE approval_status = 'pending' ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch pending users" });
  }
});

// Get all users (superadmin only)
app.get("/api/admin/users", superadminAuth, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, full_name, mobile_number, email, city, plan, approval_status, rejection_reason, role, created_at FROM admins ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Get rejected users (superadmin only)
app.get("/api/admin/rejected-users", superadminAuth, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, full_name, mobile_number, email, city, plan, approval_status, rejection_reason, role, created_at FROM admins WHERE approval_status = 'rejected' ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch rejected users" });
  }
});

// Approve user (superadmin only)
app.post("/api/admin/approve-user/:id", superadminAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "UPDATE admins SET approval_status = 'approved', approved_by = $2, approved_at = CURRENT_TIMESTAMP WHERE id = $1 AND approval_status = 'pending' RETURNING *",
      [id, req.adminId]
    );

    if (result.rows.length === 0) {
      // Check if user exists and what status it has
      const checkResult = await pool.query(
        "SELECT approval_status FROM admins WHERE id = $1",
        [id]
      );
      if (checkResult.rows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      } else {
        return res.status(400).json({ error: "User is not pending" });
      }
    }

    res.json({ message: "User approved successfully", user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to approve user" });
  }
});

// Reject user (superadmin only)
app.post("/api/admin/reject-user/:id", superadminAuth, async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  if (!reason || reason.trim().length === 0) {
    return res.status(400).json({ error: "Rejection reason is required" });
  }

  try {
    const result = await pool.query(
      "UPDATE admins SET approval_status = 'rejected', rejection_reason = $2 WHERE id = $1 AND approval_status = 'pending' RETURNING *",
      [id, reason.trim()]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "User not found or already processed" });
    }

    res.json({ message: "User rejected successfully", user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to reject user" });
  }
});

// Approve rejected user (superadmin only)
app.post(
  "/api/admin/approve-rejected-user/:id",
  superadminAuth,
  async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query(
        "UPDATE admins SET approval_status = 'approved', approved_by = $2, approved_at = CURRENT_TIMESTAMP WHERE id = $1 AND approval_status = 'rejected' RETURNING *",
        [id, req.adminId]
      );

      if (result.rows.length === 0) {
        return res
          .status(404)
          .json({ error: "User not found or not rejected" });
      }

      res.json({ message: "User approved successfully", user: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to approve user" });
    }
  }
);

// Reject approved user (superadmin only)
app.post(
  "/api/admin/reject-approved-user/:id",
  superadminAuth,
  async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({ error: "Rejection reason is required" });
    }

    try {
      const result = await pool.query(
        "UPDATE admins SET approval_status = 'rejected', rejection_reason = $2 WHERE id = $1 AND approval_status = 'approved' RETURNING *",
        [id, reason.trim()]
      );

      if (result.rows.length === 0) {
        // Check if user exists and what status it has
        const checkResult = await pool.query(
          "SELECT approval_status FROM admins WHERE id = $1",
          [id]
        );
        if (checkResult.rows.length === 0) {
          return res.status(404).json({ error: "User not found" });
        } else {
          return res.status(400).json({ error: "User is not approved" });
        }
      }

      res.json({ message: "User rejected successfully", user: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to reject user" });
    }
  }
);

// Delete user (superadmin only)
app.delete("/api/admin/delete-user/:id", superadminAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM admins WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// Reset user password (superadmin only)
app.post("/api/admin/reset-password/:id", superadminAuth, async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return res
      .status(400)
      .json({ error: "Password must be at least 6 characters long" });
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const result = await pool.query(
      "UPDATE admins SET password = $1 WHERE id = $2 RETURNING id, email",
      [hashedPassword, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to reset password" });
  }
});

// Create user (superadmin only)
app.post("/api/admin/create-user", superadminAuth, async (req, res) => {
  const {
    name,
    fullName,
    mobileNumber,
    email,
    password,
    city,
    plan,
    role = "admin",
  } = req.body;

  if (
    !name ||
    !fullName ||
    !mobileNumber ||
    !email ||
    !password ||
    !city ||
    !plan
  ) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ error: "Password must be at least 6 characters long" });
  }

  if (!["admin", "superadmin"].includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }

  try {
    // Check if admin already exists
    const existingAdmin = await pool.query(
      "SELECT id FROM admins WHERE email = $1",
      [email]
    );
    if (existingAdmin.rows.length > 0) {
      return res
        .status(400)
        .json({ error: "Admin with this email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin with approved status
    const result = await pool.query(
      `INSERT INTO admins (name, full_name, mobile_number, email, password, city, plan, terms_agreed, is_verified, approval_status, role, approved_by, approved_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true, true, 'approved', $8, $9, CURRENT_TIMESTAMP)
       RETURNING id, name, full_name, mobile_number, email, city, plan, role, approval_status, created_at`,
      [
        name,
        fullName,
        mobileNumber,
        email,
        hashedPassword,
        city,
        plan,
        role,
        req.adminId,
      ]
    );

    res.status(201).json({
      message: "User created successfully",
      user: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create user" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
