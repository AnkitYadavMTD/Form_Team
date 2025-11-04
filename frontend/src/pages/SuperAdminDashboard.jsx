import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import UserModal from "../components/UserModal";
import DataTable from "../components/DataTable";
import useModal from "../hooks/useModal";
import useApi from "../hooks/useApi";
import "../pages/AdminDashboard.css";

function SuperAdminDashboard() {
  const navigate = useNavigate();
  const { logout, getAuthHeaders, admin } = useAuth();
  const { loading, error, setError, apiCall } = useApi();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const [activeTab, setActiveTab] = useState("pending"); // 'pending', 'all', 'rejected', 'create'
  const [pendingUsers, setPendingUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [rejectedUsers, setRejectedUsers] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const {
    showModal: showUserModal,
    selectedItem: selectedUser,
    openModal: openUserModal,
    closeModal: closeUserModal,
  } = useModal();

  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedUserForReset, setSelectedUserForReset] = useState(null);
  const [newUser, setNewUser] = useState({
    name: "",
    fullName: "",
    mobileNumber: "",
    email: "",
    password: "",
    city: "",
    plan: "",
    role: "admin",
  });
  const [resetPassword, setResetPassword] = useState("");

  useEffect(() => {
    // Fetch counts for all tabs on mount
    fetchAllUsers(); // This will also update counts for pending and rejected
  }, []);

  useEffect(() => {
    if (activeTab === "pending" && pendingUsers.length === 0) {
      fetchPendingUsers();
    } else if (activeTab === "all" && allUsers.length === 0) {
      fetchAllUsers();
    } else if (activeTab === "rejected" && rejectedUsers.length === 0) {
      fetchRejectedUsers();
    }
  }, [activeTab]);

  const fetchPendingUsers = async () => {
    try {
      const data = await apiCall("/api/admin/pending-users", {
        noCancel: true,
      });
      setPendingUsers(data || []);
    } catch (err) {
      // Error handled by useApi hook
      setPendingUsers([]);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const data = await apiCall("/api/admin/users", { noCancel: true });
      setAllUsers(data || []);
    } catch (err) {
      // Error handled by useApi hook
      setAllUsers([]);
    }
  };

  const fetchRejectedUsers = async () => {
    try {
      const data = await apiCall("/api/admin/rejected-users", {
        noCancel: true,
      });
      setRejectedUsers(data || []);
    } catch (err) {
      // Error handled by useApi hook
      setRejectedUsers([]);
    }
  };

  const approveUser = async (user) => {
    const userId = user.id;
    try {
      await apiCall(`/api/admin/approve-user/${userId}`, {
        method: "POST",
      });
      await fetchPendingUsers(); // refresh the pending users list
      alert("✅ User approved successfully!");
    } catch (err) {
      // Error handled by useApi hook
    }
  };

  const rejectUser = async (user) => {
    const userId = user.id;
    let reason;
    do {
      reason = prompt("Enter rejection reason:");
      if (reason === null) return; // User canceled
      reason = reason.trim();
    } while (!reason);

    try {
      await apiCall(`/api/admin/reject-user/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      await fetchPendingUsers();
      alert("✅ User rejected successfully!");
    } catch (err) {
      // Error handled by useApi hook
    }
  };

  const approveRejectedUser = async (user) => {
    const userId = user.id;
    try {
      await apiCall(`/api/admin/approve-rejected-user/${userId}`, {
        method: "POST",
      });
      await fetchRejectedUsers(); // refresh the rejected users list
      alert("✅ User approved successfully!");
    } catch (err) {
      // Error handled by useApi hook
    }
  };

  const rejectApprovedUser = async (user) => {
    const userId = user.id;
    let reason;
    do {
      reason = prompt("Enter rejection reason:");
      if (reason === null) return; // User canceled
      reason = reason.trim();
    } while (!reason);

    try {
      await apiCall(`/api/admin/reject-approved-user/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      await fetchAllUsers();
      alert("✅ User rejected successfully!");
    } catch (err) {
      // Error handled by useApi hook
    }
  };

  const deleteUser = async (user) => {
    const userId = user.id;
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user? This action cannot be undone."
    );
    if (!confirmDelete) {
      return;
    }

    try {
      await apiCall(`/api/admin/delete-user/${userId}`, {
        method: "DELETE",
      });
      await fetchAllUsers();
      alert("✅ User deleted successfully!");
    } catch (err) {
      // Error handled by useApi hook
    }
  };

  const resetUserPassword = async (userId) => {
    if (!resetPassword || resetPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    try {
      await apiCall(`/api/admin/reset-password/${userId}`, {
        method: "POST",
        body: JSON.stringify({ newPassword: resetPassword }),
      });
      setShowResetModal(false);
      setResetPassword("");
      alert("Password reset successfully");
    } catch (err) {
      // Error handled by useApi hook
    }
  };

  const viewUserDetails = (user) => {
    openUserModal(user);
  };

  const openResetModal = (user) => {
    setSelectedUserForReset(user);
    setShowResetModal(true);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (
      !newUser.name ||
      !newUser.fullName ||
      !newUser.mobileNumber ||
      !newUser.email ||
      !newUser.password ||
      !newUser.city ||
      !newUser.plan
    ) {
      setError("All fields are required");
      return;
    }

    if (newUser.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    try {
      await apiCall("/api/admin/create-user", {
        method: "POST",
        body: JSON.stringify(newUser),
      });

      // Clear form
      setNewUser({
        name: "",
        fullName: "",
        mobileNumber: "",
        email: "",
        password: "",
        city: "",
        plan: "",
        role: "admin",
      });

      // Refresh all users list
      await fetchAllUsers();

      alert("✅ User created successfully!");
    } catch (err) {
      // Error handled by useApi hook
    }
  };

  const tabs = (
    <div className="dashboard-tabs">
      <button
        onClick={() => setActiveTab("pending")}
        className={`tab-btn ${activeTab === "pending" ? "active" : ""}`}
      >
        Pending Users ({pendingUsers.length})
      </button>
      <button
        onClick={() => setActiveTab("all")}
        className={`tab-btn ${activeTab === "all" ? "active" : ""}`}
      >
        All Users
      </button>
      <button
        onClick={() => setActiveTab("rejected")}
        className={`tab-btn ${activeTab === "rejected" ? "active" : ""}`}
      >
        Rejected Users ({rejectedUsers.length})
      </button>
      <button
        onClick={() => setActiveTab("create")}
        className={`tab-btn ${activeTab === "create" ? "active" : ""}`}
      >
        Create User
      </button>
    </div>
  );

  return (
    <div className="super-admin dashboard-container">
      <div className="dashboard-header">
        <div className="header-content">
          <div>
            <h2>Super Admin Dashboard</h2>
            <p>Manage all users and approvals</p>
          </div>
          {/* <button onClick={handleLogout} className="logout-btn">
            Logout
          </button> */}
        </div>
      </div>
      {tabs}
      {error && <div className="error-message">{error}</div>}

      <div className="dashboard-content">
        {activeTab === "pending" && (
          <div className="users-section">
            <div className="section-header">
              <h3>Pending Users</h3>
            </div>

            <DataTable
              columns={[
                { key: "id", label: "ID" },
                { key: "name", label: "Company Name" },
                { key: "full_name", label: "Your Name" },
                { key: "email", label: "Email" },
                { key: "mobile_number", label: "Mobile" },
                { key: "city", label: "City" },
                { key: "plan", label: "Plan" },
                { key: "approval_status", label: "Status" },
                {
                  key: "role",
                  label: "Role",
                  render: (user) => user.role || "admin",
                },
              ]}
              data={pendingUsers}
              actions={[
                {
                  onClick: viewUserDetails,
                  className: "btn-info",
                  icon: "👁️",
                  title: "View Details",
                },
                {
                  onClick: approveUser,
                  className: "btn-success",
                  icon: "✓",
                  title: "Approve User",
                },
                {
                  onClick: rejectUser,
                  className: "btn-danger",
                  icon: "✗",
                  title: "Reject User",
                },
              ]}
              loading={loading}
              emptyMessage="No pending users"
            />
          </div>
        )}

        {activeTab === "all" && (
          <div className="users-section">
            <div className="section-header">
              <h3>All Users</h3>
            </div>

            <DataTable
              columns={[
                { key: "id", label: "ID" },
                { key: "name", label: "Company Name" },
                { key: "full_name", label: "Your Name" },
                { key: "email", label: "Email" },
                { key: "mobile_number", label: "Mobile" },
                { key: "city", label: "City" },
                { key: "plan", label: "Plan" },
                { key: "approval_status", label: "Status" },
                {
                  key: "role",
                  label: "Role",
                  render: (user) => user.role || "admin",
                },
              ]}
              data={allUsers}
              actions={[
                {
                  onClick: viewUserDetails,
                  className: "btn-info",
                  icon: "👁️",
                  title: "View Details",
                },
                {
                  onClick: openResetModal,
                  className: "btn-warning",
                  icon: "🔑",
                  title: "Reset Password",
                },
                {
                  condition: (user) => user.approval_status === "approved",
                  onClick: rejectApprovedUser,
                  className: "btn-danger",
                  icon: "✗",
                  title: "Reject User",
                },
                {
                  condition: (user) => user.approval_status === "approved",
                  onClick: deleteUser,
                  className: "btn-danger",
                  icon: "🗑️",
                  title: "Delete User",
                },
              ]}
              loading={loading}
              emptyMessage="No users found"
            />
          </div>
        )}

        {activeTab === "rejected" && (
          <div className="users-section">
            <div className="section-header">
              <h3>Rejected Users</h3>
            </div>

            <DataTable
              columns={[
                { key: "id", label: "ID" },
                { key: "name", label: "Company Name" },
                { key: "full_name", label: "Your Name" },
                { key: "email", label: "Email" },
                { key: "mobile_number", label: "Mobile" },
                { key: "city", label: "City" },
                { key: "plan", label: "Plan" },
                { key: "approval_status", label: "Status" },
                {
                  key: "role",
                  label: "Role",
                  render: (user) => user.role || "admin",
                },
              ]}
              data={rejectedUsers}
              actions={[
                {
                  onClick: viewUserDetails,
                  className: "btn-info",
                  icon: "👁️",
                  title: "View Details",
                },
                {
                  onClick: approveRejectedUser,
                  className: "btn-success",
                  icon: "✓",
                  title: "Approve User",
                },
                {
                  onClick: openResetModal,
                  className: "btn-warning",
                  icon: "🔑",
                  title: "Reset Password",
                },
                {
                  onClick: deleteUser,
                  className: "btn-danger",
                  icon: "🗑️",
                  title: "Delete User",
                },
              ]}
              loading={loading}
              emptyMessage="No rejected users"
            />
          </div>
        )}

        {activeTab === "create" && (
          <div className="create-user-section">
            <div className="section-header">
              <h3>Create New User</h3>
            </div>

            <form className="create-user-form" onSubmit={handleCreateUser}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Company Name *</label>
                  <input
                    type="text"
                    id="name"
                    value={newUser.name}
                    onChange={(e) =>
                      setNewUser({ ...newUser, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="fullName">Your Name *</label>
                  <input
                    type="text"
                    id="fullName"
                    value={newUser.fullName}
                    onChange={(e) =>
                      setNewUser({ ...newUser, fullName: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="mobileNumber">Mobile Number *</label>
                  <input
                    type="tel"
                    id="mobileNumber"
                    value={newUser.mobileNumber}
                    onChange={(e) =>
                      setNewUser({ ...newUser, mobileNumber: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="password">Password *</label>
                  <input
                    type="password"
                    id="password"
                    value={newUser.password}
                    onChange={(e) =>
                      setNewUser({ ...newUser, password: e.target.value })
                    }
                    required
                    minLength="6"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="city">City *</label>
                  <input
                    type="text"
                    id="city"
                    value={newUser.city}
                    onChange={(e) =>
                      setNewUser({ ...newUser, city: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="plan">Plan *</label>
                  <select
                    id="plan"
                    value={newUser.plan}
                    onChange={(e) =>
                      setNewUser({ ...newUser, plan: e.target.value })
                    }
                    required
                  >
                    <option value="">Select Plan</option>
                    <option value="basic">Basic</option>
                    <option value="premium">Premium</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="role">Role</label>
                  <select
                    id="role"
                    value={newUser.role}
                    onChange={(e) =>
                      setNewUser({ ...newUser, role: e.target.value })
                    }
                  >
                    <option value="admin">Admin</option>
                    <option value="superadmin">Super Admin</option>
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create User"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() =>
                    setNewUser({
                      name: "",
                      fullName: "",
                      mobileNumber: "",
                      email: "",
                      password: "",
                      city: "",
                      plan: "",
                      role: "admin",
                    })
                  }
                >
                  Clear Form
                </button>
              </div>
            </form>
          </div>
        )}

        {showUserModal && selectedUser && (
          <UserModal
            user={selectedUser}
            onClose={closeUserModal}
            onApprove={activeTab === "pending" ? approveUser : null}
            onReject={activeTab === "pending" ? rejectUser : null}
            showActions={activeTab === "pending"}
          />
        )}

        {showResetModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Reset Password</h3>
                <button
                  className="modal-close-btn"
                  onClick={() => setShowResetModal(false)}
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                <p>
                  Reset password for:{" "}
                  <strong>{selectedUserForReset?.email}</strong>
                </p>
                <div className="form-group">
                  <label htmlFor="resetPassword">New Password *</label>
                  <input
                    type="password"
                    id="resetPassword"
                    value={resetPassword}
                    onChange={(e) => setResetPassword(e.target.value)}
                    placeholder="Enter new password (min 6 characters)"
                    minLength="6"
                    required
                  />
                </div>
                <div className="form-actions">
                  <button
                    className="btn btn-warning"
                    onClick={() => resetUserPassword(selectedUserForReset.id)}
                    disabled={loading}
                  >
                    {loading ? "Resetting..." : "Reset Password"}
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowResetModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SuperAdminDashboard;
