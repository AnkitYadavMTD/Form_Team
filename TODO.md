# Hosting Plan for Team Form Builder

## Steps to Host Smoothly and Free

1. **Set up GitHub Repository**

   - Create a new GitHub repository for the project.
   - Push the entire project (backend/ and frontend/ folders) to the repository.

2. **Deploy Backend to Render**

   - Sign up for Render (free tier available).
   - Connect the GitHub repository to Render.
   - Set the root directory to `backend/` during import.
   - Add environment variables in Render dashboard:
     - `DATABASE_URL`: Your Neon PostgreSQL connection string.
     - `ADMIN_TOKEN`: A secure token for admin authentication (e.g., generate a random string).
   - Deploy the backend. Render will use the render.yaml config.

3. **Set up Database on Neon**

   - Ensure your Neon PostgreSQL database is active (free tier available).
   - Run the migrations.sql script on your Neon database to create tables (use Neon console or a tool like pgAdmin).
   - Note the connection string is already in db.js, but use the env var in production.

4. **Deploy Frontend to Vercel**

   - Sign up for Vercel (free tier available).
   - Connect the GitHub repository to Vercel.
   - Set the root directory to `frontend/` during import.
   - Set the build command to `npm run build`.
   - Set the output directory to `dist`.
   - Add environment variables if needed (none required for basic setup).
   - Deploy the frontend. Vercel will use the vercel.json config for API proxying.

5. **Update Frontend API Redirects**

   - After backend deployment, get the Render backend URL (e.g., https://your-backend.onrender.com).
   - Update vercel.json in the frontend folder:
     - Change the destination from `https://your-backend-render-url.onrender.com/api/$1` to your new backend URL.
   - Commit and push the change to trigger a new Vercel build.

6. **Test the Deployment**
   - Visit the Vercel frontend URL.
   - Test creating a form (admin routes).
   - Test submitting a public form.
   - Verify API calls are proxied correctly to the Render backend.

## Notes

- All services (Render, Vercel, Neon) offer generous free tiers suitable for small projects.
- Ensure the DATABASE_URL in Render matches your Neon connection string exactly.
- For production, use a strong ADMIN_TOKEN and consider adding more security (e.g., JWT).
- If you encounter issues, check logs in Render/Vercel dashboards.
