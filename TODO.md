# User Approval System Implementation

## Database Schema Changes

- [ ] Update admins table to include approval_status column (pending, approved, rejected)
- [ ] Add approved_by and approved_at columns
- [ ] Add rejection_reason column for admin notes

## Backend Changes

- [ ] Modify /api/auth/register endpoint to set is_verified=false and approval_status='pending'
- [ ] Add /api/admin/users endpoint to fetch pending users
- [ ] Add /api/admin/users/:id/approve endpoint for admin approval
- [ ] Add /api/admin/users/:id/reject endpoint for admin rejection
- [ ] Update /api/auth/login to check approval_status
- [ ] Add admin middleware for user management endpoints

## Frontend Changes

- [ ] Update AuthContext to handle approval status
- [ ] Modify SignUp.jsx to show pending status after registration
- [ ] Update SignIn.jsx to show approval pending message for unapproved users
- [ ] Add User Approval section to AdminDashboard.jsx
- [ ] Create approval/rejection UI components
- [ ] Update routing to prevent unapproved users from accessing dashboard

## Testing

- [ ] Test signup flow with pending status
- [ ] Test admin approval/rejection
- [ ] Test login restrictions for pending users
- [ ] Test approved user access to dashboard
