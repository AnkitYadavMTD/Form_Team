import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./PublicForm.css";

function PublicForm() {
  const { id } = useParams();
  const [formData, setFormData] = useState(null);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await fetch(`/api/forms/${id}`);
        if (response.ok) {
          const data = await response.json();
          setFormData(data);
          // Initialize responses with empty values for all fields
          const initialResponses = {};
          if (data.fields && Array.isArray(data.fields)) {
            data.fields.forEach((field) => {
              initialResponses[field.label.toLowerCase().replace(/\s+/g, "_")] =
                "";
            });
          }
          // Always include the default fields
          initialResponses.name = "";
          initialResponses.number = "";
          initialResponses.pan = "";
          setResponses(initialResponses);
        } else {
          setError("Form not found");
        }
      } catch (err) {
        setError("Error loading form");
        console.error(err);
      }
    };

    fetchForm();
  }, [id]);

  const handleInputChange = (field, value) => {
    setResponses({ ...responses, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/forms/${id}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(responses),
      });

      if (response.ok) {
        const data = await response.json();
        window.location.href = data.redirect_url;
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Submission failed");
      }
    } catch (err) {
      setError("Error submitting form");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (error)
    return (
      <div className="public-form-container">
        <div className="form-card">
          <div className="error-message">
            <h2>🚫 Error</h2>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );

  if (!formData)
    return (
      <div className="public-form-container">
        <div className="form-card">
          <div className="loading-message">
            <div className="loading-spinner"></div>
            <h2>Loading form...</h2>
          </div>
        </div>
      </div>
    );

  return (
    <div className="public-form-container">
      <div className="form-card">
        <div className="form-header">
          <div className="header-icon">📋</div>
          <h2>{formData.title}</h2>
          <p className="form-subtitle">Please fill out all required fields</p>
        </div>

        <div className="form-body">
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="form-grid">
            {/* Personal Information Section */}
            <div className="form-section">
              <h3 className="section-title">
                <span className="section-icon">👤</span>
                Personal Information
              </h3>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    <span className="label-icon">📝</span>
                    Full Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={responses.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span className="label-icon">📞</span>
                    Phone Number <span className="required">*</span>
                  </label>
                  <input
                    type="tel"
                    className="form-input"
                    value={responses.number}
                    onChange={(e) =>
                      handleInputChange("number", e.target.value)
                    }
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">🆔</span>
                  PAN Number <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={responses.pan}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase(); // 🔹 auto uppercase
                    handleInputChange("pan", value);
                  }}
                  placeholder="Enter your PAN number (e.g., ABCDE1234F)"
                  required
                  maxLength={10} // PAN always 10 characters
                  pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
                  title="Please enter a valid PAN number (5 letters, 4 numbers, 1 letter)"
                />
              </div>
            </div>

            {/* Dynamic Fields Section */}
            {formData.fields &&
              Array.isArray(formData.fields) &&
              formData.fields.length > 0 && (
                <div className="form-section">
                  <h3 className="section-title">
                    <span className="section-icon">📋</span>
                    Additional Information
                  </h3>

                  {formData.fields.map((field, index) => {
                    const fieldKey = field.label
                      .toLowerCase()
                      .replace(/\s+/g, "_");
                    // Skip phone number field if it's already in the default fields
                    if (field.label.toLowerCase().includes("phone")) {
                      return null;
                    }
                    return (
                      <div key={index} className="form-group">
                        <label className="form-label">
                          <span className="label-icon">
                            {field.icon || "📝"}
                          </span>
                          {field.label}{" "}
                          {field.required && (
                            <span className="required">*</span>
                          )}
                        </label>
                        {field.type === "textarea" ? (
                          <textarea
                            className="form-input form-textarea"
                            value={responses[fieldKey] || ""}
                            onChange={(e) =>
                              handleInputChange(fieldKey, e.target.value)
                            }
                            placeholder={`Enter ${field.label.toLowerCase()}`}
                            required={field.required}
                            rows="4"
                          />
                        ) : (
                          <input
                            type={field.type || "text"}
                            className="form-input"
                            value={responses[fieldKey] || ""}
                            onChange={(e) =>
                              handleInputChange(fieldKey, e.target.value)
                            }
                            placeholder={`Enter ${field.label.toLowerCase()}`}
                            required={field.required}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

            {/* Submit Section */}
            <div className="form-section submit-section">
              <button type="submit" className="submit-btn" disabled={loading}>
                <span className="btn-icon">{loading ? "⏳" : "🚀"}</span>
                {loading ? "Submitting..." : "Submit Form"}
              </button>
              <p className="privacy-note">
                <span className="privacy-icon">🔒</span>
                Your information is secure and will be handled confidentially.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default PublicForm;
