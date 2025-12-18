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
    name VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    mobile_number VARCHAR(20) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    plan VARCHAR(50) DEFAULT 'Free Demo Plan (15 Days)',
    terms_agreed BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    approval_status VARCHAR(20) DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
    role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('admin', 'superadmin')),
    approved_by INTEGER REFERENCES admins(id),
    approved_at TIMESTAMP,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create otp_verifications table
CREATE TABLE IF NOT EXISTS otp_verifications (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES admins(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    advertiser VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'Stop', 'Expire')),
    payout_type VARCHAR(10) NOT NULL CHECK (payout_type IN ('CPA', 'CPL', 'CPS')),
    payout_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    conversion_event VARCHAR(50) NOT NULL,
    sale_percentage DECIMAL(5,2),
    offer_url TEXT NOT NULL,
    tracking_parameters JSONB DEFAULT '{}',
    postback_url TEXT,
    tracking_link VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add tracking_link column to existing campaigns if needed
ALTER TABLE IF EXISTS campaigns ADD COLUMN IF NOT EXISTS tracking_link VARCHAR(255) UNIQUE;

-- Alter existing tables if they exist with old schema
-- Note: Run these commands manually if tables already exist
-- ALTER TABLE forms ALTER COLUMN id TYPE VARCHAR(10);
-- ALTER TABLE submissions ALTER COLUMN form_id TYPE VARCHAR(10);
