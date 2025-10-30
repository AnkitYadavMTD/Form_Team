-- Create forms table
CREATE TABLE IF NOT EXISTS forms (
    id VARCHAR(10) PRIMARY KEY,
    admin_id INTEGER REFERENCES admins(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    redirect_url TEXT NOT NULL,
    fields JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create submissions table
CREATE TABLE IF NOT EXISTS submissions (
    id SERIAL PRIMARY KEY,
    form_id VARCHAR(10) REFERENCES forms(id) ON DELETE CASCADE,
    data JSONB NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Alter existing tables if they exist with old schema
-- Note: Run these commands manually if tables already exist
-- ALTER TABLE forms ALTER COLUMN id TYPE VARCHAR(10);
-- ALTER TABLE submissions ALTER COLUMN form_id TYPE VARCHAR(10);
