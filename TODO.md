# TODO: Add OTP Verification to Signup Process

## Backend Changes

- [ ] Add nodemailer dependency to backend/package.json
- [ ] Update backend/migrations.sql to add otp_verifications table and is_verified column to admins
- [ ] Modify backend/server.js to add /api/auth/send-otp and /api/auth/verify-otp endpoints
- [ ] Modify /api/auth/register to set is_verified = true after OTP verification

## Frontend Changes

- [ ] Create frontend/src/pages/Thanks.jsx component
- [ ] Update frontend/src/App.jsx to add /thanks route
- [ ] Update frontend/src/contexts/AuthContext.jsx to add sendOtp and verifyOtp functions
- [ ] Modify frontend/src/pages/SignUp.jsx to include OTP sending and verification steps before submission

## Testing and Deployment

- [ ] Install backend dependencies (npm install)
- [ ] Test OTP sending and verification
- [ ] Test full signup flow with thanks page
