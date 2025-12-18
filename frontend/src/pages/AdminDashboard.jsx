import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import "./AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();
  const { logout, getAuthHeaders } = useAuth();

  const [activeTab, setActiveTab] = useState("forms");
  const [forms, setForms] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [selectedForm, setSelectedForm] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formsLoading, setFormsLoading] = useState(false);
  const [campaignsLoading, setCampaignsLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [viewMode, setViewMode] = useState("table"); // 'grid' or 'table'
  const [showModal, setShowModal] = useState(false);
  const [modalSubmissions, setModalSubmissions] = useState([]);
  const [modalForm, setModalForm] = useState(null);

  // Fetch both forms and campaigns once on component mount
  useEffect(() => {
    fetchForms();
    fetchCampaigns();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const fetchForms = async () => {
    setFormsLoading(true);
    try {
      const response = await fetch("/api/forms", {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setForms(data);
      } else {
        setError("Failed to fetch forms");
      }
    } catch (err) {
      setError("Error fetching forms");
      console.error(err);
    } finally {
      setFormsLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    setCampaignsLoading(true);
    try {
      const response = await fetch("/api/campaigns", {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        const campaignsList = Array.isArray(data)
          ? data
          : data && data.success && Array.isArray(data.data)
          ? data.data
          : [];
        setCampaigns(campaignsList);
      } else {
        setError("Failed to fetch campaigns");
      }
    } catch (err) {
      setError("Error fetching campaigns");
      console.error(err);
    } finally {
      setCampaignsLoading(false);
    }
  };

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const deleteCampaign = async (campaignId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this campaign? This action cannot be undone."
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        await fetchCampaigns();
        setError("");
      } else {
        setError("Failed to delete campaign");
      }
    } catch (err) {
      setError("Error deleting campaign");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Tracking link copied to clipboard!', {
      position: 'bottom-right',
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const getTrackingUrl = (trackingLink) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/track/${trackingLink}`;
  };

  const fetchSubmissions = async (formId) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/forms/${formId}/submissions`, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setModalSubmissions(data);
        setModalForm(forms.find((f) => f.id === formId));
        setShowModal(true);
      } else {
        setError("Failed to fetch submissions");
      }
    } catch (err) {
      setError("Error fetching submissions");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const exportSubmissions = async (formId) => {
    try {
      const response = await fetch(`/api/forms/${formId}/export`, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        // Create a blob from the response and download it
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "submissions.xlsx";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        setError("Failed to export submissions");
      }
    } catch (err) {
      setError("Error exporting submissions");
      console.error(err);
    }
  };

  const copyPublicLink = async (formId) => {
    const publicUrl = `${window.location.origin}/form/${formId}`;
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopiedId(formId);
      setTimeout(() => setCopiedId(null), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error("Failed to copy link:", err);
      setError("Failed to copy link to clipboard");
    }
  };

  const deleteForm = async (formId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this form? This action cannot be undone."
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/forms/${formId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        // Refresh the forms list
        await fetchForms();
        setError("");
      } else {
        setError("Failed to delete form");
      }
    } catch (err) {
      setError("Error deleting form");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-content">
          <div>
            <h2>Admin Dashboard</h2>
            <p>Manage your forms and campaigns</p>
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Tab Navigation */}
      <div className="dashboard-tabs" style={{ paddingLeft: '30px' }}>
        <button
          onClick={() => setActiveTab("forms")}
          className={`tab-btn ${activeTab === "forms" ? "active" : ""}`}
        >
          All Forms
        </button>
        <button
          onClick={() => setActiveTab("campaigns")}
          className={`tab-btn ${activeTab === "campaigns" ? "active" : ""}`}
        >
          All Campaigns
        </button>
      </div>

      <div className="dashboard-content">
        {/* Forms Tab */}
        {activeTab === "forms" && (
        <div className="forms-section">
          <div className="section-header">
            <div className="section-header-content">
              <h3>All Forms</h3>
              <div className="view-toggle">
                <button
                  onClick={() => setViewMode("table")}
                  className={`view-btn ${viewMode === "table" ? "active" : ""}`}
                  title="Table View"
                >
                  ⊟
                </button>
              </div>
            </div>
          </div>

          {formsLoading ? (
            <div className="loading-message">Loading forms...</div>
          ) : viewMode === "grid" ? (
            <div className="forms-grid">
              {forms.map((form) => (
                <div key={form.id} className="form-card">
                  <h4 className="form-title">{form.title}</h4>

                  <div className="form-info">
                    <div className="info-item">
                      <span className="info-label">ID:</span>
                      <span className="info-value">{form.id}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Redirect:</span>
                      <span className="info-value">{form.redirect_url}</span>
                    </div>
                  </div>

                  <div className="public-link">
                    {window.location.origin}/form/{form.id}
                  </div>

                  <div className="form-actions">
                    <button
                      onClick={() => fetchSubmissions(form.id)}
                      className="action-btn btn-primary"
                    >
                      👁️ View Submissions
                    </button>
                    <button
                      onClick={() => exportSubmissions(form.id)}
                      className="action-btn btn-success"
                    >
                      📊 Export Excel
                    </button>
                    <button
                      onClick={() => copyPublicLink(form.id)}
                      className={`action-btn ${
                        copiedId === form.id ? "btn-copied" : "btn-info"
                      }`}
                    >
                      {copiedId === form.id ? (
                        <>
                          <span className="loading-spinner"></span>
                          Copied!
                        </>
                      ) : (
                        <>🔗 Copy Link</>
                      )}
                    </button>
                    <button
                      onClick={() => deleteForm(form.id)}
                      className="action-btn btn-danger"
                    >
                      🗑️ Delete Form
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="forms-table-container">
              <table className="forms-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Redirect URL</th>
                    <th>Public Link</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {forms.map((form) => (
                    <tr key={form.id}>
                      <td>{form.id}</td>
                      <td>{form.title}</td>
                      <td className="url-cell">{form.redirect_url}</td>
                      <td className="url-cell">
                        {window.location.origin}/form/{form.id}
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            onClick={() => fetchSubmissions(form.id)}
                            className="action-btn btn-primary btn-small"
                            title="View Submissions"
                          >
                            👁️
                          </button>
                          <button
                            onClick={() => exportSubmissions(form.id)}
                            className="action-btn btn-success btn-small"
                            title="Export Excel"
                          >
                            📊
                          </button>
                          <button
                            onClick={() => copyPublicLink(form.id)}
                            className={`action-btn btn-small ${
                              copiedId === form.id ? "btn-copied" : "btn-info"
                            }`}
                            title={
                              copiedId === form.id ? "Copied!" : "Copy Link"
                            }
                          >
                            {copiedId === form.id ? "✓" : "🔗"}
                          </button>
                          <button
                            onClick={() => deleteForm(form.id)}
                            className="action-btn btn-danger btn-small"
                            title="Delete Form"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        )}

        {/* Persistent table removed to avoid duplication with tabs */}

        {/* Campaigns Tab */}
        {activeTab === "campaigns" && (
        <div className="campaigns-section">
          <div className="section-header">
            <h3>Your Campaigns</h3>
          </div>

          {campaignsLoading ? (
            <div className="loading-message">Loading campaigns...</div>
          ) : (Array.isArray(campaigns) && campaigns.length === 0) ? (
            <div className="no-campaigns">
              <div>No campaigns found</div>
              <small>Create your first campaign to get started</small>
            </div>
          ) : (
            <div className="campaigns-table-container">
              <table className="campaigns-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Advertiser</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Payout</th>
                    <th>Conversion</th>
                    <th>Tracking Link</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(Array.isArray(campaigns) ? campaigns : []).map((campaign) => (
                    <tr key={campaign.id}>
                      <td>{campaign.name}</td>
                      <td>{campaign.advertiser}</td>
                      <td>{campaign.category}</td>
                      <td>
                        <span className={`status-badge ${campaign.status}`}>
                          {campaign.status}
                        </span>
                      </td>
                      <td>
                        {formatCurrency(campaign.payout_amount, campaign.currency)}
                        <br />
                        <small style={{ color: '#666' }}>
                          {campaign.payout_type}
                        </small>
                      </td>
                      <td>{campaign.conversion_event}</td>
                      <td>
                        {campaign.tracking_link ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <code style={{ fontSize: '13px', color: '#667eea', fontWeight: '600', letterSpacing: '0.5px' }}>
                              {campaign.tracking_link}
                            </code>
                            <button
                              onClick={() => copyToClipboard(getTrackingUrl(campaign.tracking_link))}
                              className="action-btn btn-small"
                              title="Copy tracking URL"
                              style={{ minWidth: 'auto', padding: '4px 8px' }}
                            >
                              📋
                            </button>
                          </div>
                        ) : (
                          <span style={{ color: '#999' }}>—</span>
                        )}
                      </td>
                      <td>{formatDate(campaign.created_at)}</td>
                      <td>
                        <div className="table-actions">
                          <button
                            onClick={() => navigate(`/admin/campaigns/${campaign.id}/edit`)}
                            className="action-btn btn-info btn-small"
                            title="Edit Campaign"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => deleteCampaign(campaign.id)}
                            className="action-btn btn-danger btn-small"
                            title="Delete Campaign"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        )}

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Submissions for "{modalForm?.title}"</h3>
                <button
                  className="modal-close-btn"
                  onClick={() => setShowModal(false)}
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                {modalSubmissions.length === 0 ? (
                  <div className="no-submissions">
                    <div>No submissions yet</div>
                    <small>
                      Share the public link to start collecting responses
                    </small>
                  </div>
                ) : (
                  <div className="submissions-table-container">
                    <table className="submissions-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Number</th>
                          <th>PAN</th>
                          {modalForm?.fields &&
                            modalForm.fields.map((field) => (
                              <th key={field.id}>{field.label}</th>
                            ))}
                          <th>Submitted At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {modalSubmissions.map((sub) => (
                          <tr key={sub.id}>
                            <td>{sub.data.name || ""}</td>
                            <td>{sub.data.number || ""}</td>
                            <td>{sub.data.pan || ""}</td>
                            {modalForm?.fields &&
                              modalForm.fields.map((field) => {
                                const fieldKey = field.label
                                  .toLowerCase()
                                  .replace(/\s+/g, "_");
                                return (
                                  <td key={field.id}>
                                    {sub.data[fieldKey] ||
                                      sub.data[field.label] ||
                                      ""}
                                  </td>
                                );
                              })}
                            <td>
                              {new Date(sub.submitted_at).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
