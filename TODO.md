# TODO: Implement Team Form Builder Requirements

## Backend Updates
- [x] Update migrations.sql with database schema for forms and submissions tables
- [x] Update server.js with routes:
  - POST /api/forms: Create new form (admin only)
  - GET /api/forms: Get all forms (admin only)
  - GET /api/forms/:id: Get form by ID (public)
  - POST /api/forms/:id/submit: Submit form data (public)
  - GET /api/forms/:id/submissions: Get submissions for a form (admin only)
  - GET /api/forms/:id/export: Export submissions as Excel (admin only)
- [x] Add authentication for admin routes (simple password/token)
- [x] Install 'xlsx' package for Excel export
- [x] Update export route in server.js to generate Excel file

## Frontend Updates
- [x] Update AdminCreateForm.jsx:
  - Fix fields to Name (text), Number (text), PAN (text)
  - Add custom redirect URL field
  - Connect to backend API for form creation
- [x] Update PublicForm.jsx:
  - Fetch form data from backend
  - Handle form submission and redirect to custom URL
- [x] Add AdminDashboard component/page:
  - List all forms
  - View submissions per form
  - Export button per form
- [x] Update App.jsx with routing for admin dashboard
- [x] Add admin authentication on frontend (password/token)

## Testing and Deployment
- [x] Test form creation, submission, and redirect
- [x] Test admin dashboard and export
- [x] Deploy backend to Render
- [x] Deploy frontend to Vercel

## Deployment Fixes
- [x] Check frontend/vite.config.js for any deployment issues
- [x] Update backend/db.js to use process.env for database connection string
- [x] Update backend/server.js to use process.env for admin token
- [x] Suggest adding environment variables in Vercel dashboard for backend
- [x] Recommend running migrations.sql manually on the database
- [x] Test local builds and redeploy after fixes
- [x] Fix git submodule issue for Netlify deployment
