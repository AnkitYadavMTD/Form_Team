import Modal from "./Modal";
import "../pages/AdminDashboard.css";

function UserModal({
  user,
  onClose,
  onApprove,
  onReject,
  showActions = false,
}) {
  if (!user) return null;

  const footer = showActions ? (
    <div className="modal-actions">
      <button
        onClick={() => onApprove(user)}
        className="action-btn btn-success"
      >
        Approve User
      </button>
      <button onClick={() => onReject(user)} className="action-btn btn-danger">
        Reject User
      </button>
    </div>
  ) : null;

  return (
    <Modal isOpen={true} onClose={onClose} title="User Details" footer={footer}>
      <div className="user-details">
        <div className="detail-row">
          <span className="detail-label">ID:</span>
          <span className="detail-value">{user.id}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Company Name:</span>
          <span className="detail-value">{user.name}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Your Name:</span>
          <span className="detail-value">{user.full_name}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Email:</span>
          <span className="detail-value">{user.email}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Mobile:</span>
          <span className="detail-value">{user.mobile_number}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">City:</span>
          <span className="detail-value">{user.city}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Plan:</span>
          <span className="detail-value">{user.plan}</span>
        </div>
        {user.approval_status && (
          <div className="detail-row">
            <span className="detail-label">Status:</span>
            <span className="detail-value">{user.approval_status}</span>
          </div>
        )}
        {user.role && (
          <div className="detail-row">
            <span className="detail-label">Role:</span>
            <span className="detail-value">{user.role || "admin"}</span>
          </div>
        )}
        <div className="detail-row">
          <span className="detail-label">Registered At:</span>
          <span className="detail-value">
            {new Date(user.created_at).toLocaleString()}
          </span>
        </div>
      </div>
    </Modal>
  );
}

export default UserModal;
