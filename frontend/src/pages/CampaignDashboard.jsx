import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import "./CampaignDashboard.css";

function CampaignDashboard() {
  const navigate = useNavigate();
  const { getAuthHeaders } = useAuth();

  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/campaigns", {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        // Accept both legacy array response and new { success, data } shape
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
      setLoading(false);
    }
  };

  // no forms on this page — this view is campaigns-only

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
        // Refresh the campaigns list
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

  return (
    <div className="campaign-dashboard-container">
      <div className="campaign-dashboard-card">
        <div className="dashboard-header">
          <div className="header-content">
            <div>
              <h2>Dashboard</h2>
              <p>Manage your forms and campaigns</p>
            </div>
            {activeTab === "campaigns" && (
              <button
                onClick={() => navigate("/admin/create-campaign")}
                className="create-campaign-btn"
                style={{
                  background: 'white',
                  color: '#667eea',
                  border: '2px solid #667eea',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = '#667eea';
                  e.target.style.color = 'white';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'white';
                  e.target.style.color = '#667eea';
                }}
              >
                + Add Campaign
              </button>
            )}
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="campaigns-section">
          <div className="section-header">
            <h3>Your Campaigns</h3>
          </div>

          {loading ? (
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
      </div>
    </div>
  );
}

export default CampaignDashboard;
