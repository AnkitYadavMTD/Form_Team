import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();
  const { logout, getAuthHeaders } = useAuth();

  const [forms, setForms] = useState([]);
  const [selectedForm, setSelectedForm] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [viewMode, setViewMode] = useState("table"); // 'grid' or 'table'

  useEffect(() => {
    fetchForms();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const fetchForms = async () => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  const fetchSubmissions = async (formId) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/forms/${formId}/submissions`, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data);
        setSelectedForm(forms.find((f) => f.id === parseInt(formId)));
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
        <h2>Admin Dashboard</h2>
        <p>Manage your forms and view submissions</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="dashboard-content">
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

          {loading ? (
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

        {selectedForm && (
          <div className="submissions-section">
            <div className="submissions-card">
              <div className="submissions-header">
                <h3>Submissions for "{selectedForm.title}"</h3>
              </div>

              {submissions.length === 0 ? (
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
                        {selectedForm.fields &&
                          selectedForm.fields.map((field) => (
                            <th key={field.id}>{field.label}</th>
                          ))}
                        <th>Submitted At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.map((sub) => (
                        <tr key={sub.id}>
                          {selectedForm.fields &&
                            selectedForm.fields.map((field) => {
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
                          <td>{new Date(sub.submitted_at).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
