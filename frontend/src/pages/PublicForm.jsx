import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import LoadingMessage from "../components/LoadingMessage";
import "./PublicForm.css";

// Validation functions
const validatePAN = (pan) => {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(pan);
};

const validatePhone = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

function PublicForm() {
  const { id } = useParams();
  const [formData, setFormData] = useState(null);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldValidation, setFieldValidation] = useState({});

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
    const newResponses = { ...responses, [field]: value };
    setResponses(newResponses);

    // Real-time validation
    let isValid = true;
    let errorMessage = "";

    if (field === "pan" && value) {
      isValid = validatePAN(value);
      errorMessage = isValid
        ? ""
        : "Invalid PAN format (5 letters, 4 numbers, 1 letter)";
    } else if (field === "number" && value) {
      isValid = validatePhone(value);
      errorMessage = isValid
        ? ""
        : "Invalid phone number (10 digits starting with 6-9)";
    } else if (field === "email" && value) {
      isValid = validateEmail(value);
      errorMessage = isValid ? "" : "Invalid email format";
    }

    setFieldValidation((prev) => ({
      ...prev,
      [field]: { isValid, errorMessage },
    }));
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
          <LoadingMessage message="Loading form..." />
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
            {/* Personal Information Section
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
                    className={`form-input ${responses.name ? "valid" : ""}`}
                    value={responses.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter your full name"
                    required
                    aria-describedby="name-error"
                    aria-invalid={
                      fieldValidation.name && !fieldValidation.name.isValid
                    }
                  />
                  {responses.name && (
                    <span className="validation-icon valid">✅</span>
                  )}
                  {fieldValidation.name && !fieldValidation.name.isValid && (
                    <div id="name-error" className="field-error" role="alert">
                      <span className="error-icon">⚠️</span>
                      {fieldValidation.name.errorMessage}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span className="label-icon">📞</span>
                    Phone Number <span className="required">*</span>
                  </label>
                  <input
                    type="tel"
                    className={`form-input ${
                      fieldValidation.number && fieldValidation.number.isValid
                        ? "valid"
                        : ""
                    } ${
                      fieldValidation.number && !fieldValidation.number.isValid
                        ? "invalid"
                        : ""
                    }`}
                    value={responses.number}
                    onChange={(e) =>
                      handleInputChange("number", e.target.value)
                    }
                    placeholder="Enter your phone number"
                    required
                    aria-describedby="number-error"
                    aria-invalid={
                      fieldValidation.number && !fieldValidation.number.isValid
                    }
                  />
                  {fieldValidation.number && fieldValidation.number.isValid && (
                    <span className="validation-icon valid">✅</span>
                  )}
                  {fieldValidation.number &&
                    !fieldValidation.number.isValid && (
                      <span className="validation-icon invalid">❌</span>
                    )}
                  {fieldValidation.number &&
                    !fieldValidation.number.isValid && (
                      <div
                        id="number-error"
                        className="field-error"
                        role="alert"
                      >
                        <span className="error-icon">⚠️</span>
                        {fieldValidation.number.errorMessage}
                      </div>
                    )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">🆔</span>
                  PAN Number <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className={`form-input ${
                    fieldValidation.pan && fieldValidation.pan.isValid
                      ? "valid"
                      : ""
                  } ${
                    fieldValidation.pan && !fieldValidation.pan.isValid
                      ? "invalid"
                      : ""
                  }`}
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
                  aria-describedby="pan-error"
                  aria-invalid={
                    fieldValidation.pan && !fieldValidation.pan.isValid
                  }
                />
                {fieldValidation.pan && fieldValidation.pan.isValid && (
                  <span className="validation-icon valid">✅</span>
                )}
                {fieldValidation.pan && !fieldValidation.pan.isValid && (
                  <span className="validation-icon invalid">❌</span>
                )}
                {fieldValidation.pan && !fieldValidation.pan.isValid && (
                  <div id="pan-error" className="field-error" role="alert">
                    <span className="error-icon">⚠️</span>
                    {fieldValidation.pan.errorMessage}
                  </div>
                )}
              </div>
            </div> */}

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
                            className={`form-input form-textarea ${
                              responses[fieldKey] ? "valid" : ""
                            }`}
                            value={responses[fieldKey] || ""}
                            onChange={(e) =>
                              handleInputChange(fieldKey, e.target.value)
                            }
                            placeholder={`Enter ${field.label.toLowerCase()}`}
                            required={field.required}
                            rows="4"
                            aria-describedby={`${fieldKey}-error`}
                            aria-invalid={
                              fieldValidation[fieldKey] &&
                              !fieldValidation[fieldKey].isValid
                            }
                          />
                        ) : (
                          <input
                            type={field.type || "text"}
                            className={`form-input ${
                              fieldValidation[fieldKey] &&
                              fieldValidation[fieldKey].isValid
                                ? "valid"
                                : ""
                            } ${
                              fieldValidation[fieldKey] &&
                              !fieldValidation[fieldKey].isValid
                                ? "invalid"
                                : ""
                            }`}
                            value={responses[fieldKey] || ""}
                            onChange={(e) =>
                              handleInputChange(fieldKey, e.target.value)
                            }
                            placeholder={`Enter ${field.label.toLowerCase()}`}
                            required={field.required}
                            aria-describedby={`${fieldKey}-error`}
                            aria-invalid={
                              fieldValidation[fieldKey] &&
                              !fieldValidation[fieldKey].isValid
                            }
                          />
                        )}
                        {fieldValidation[fieldKey] ? (
                          fieldValidation[fieldKey].isValid ? (
                            <span className="validation-icon valid">✅</span>
                          ) : (
                            <>
                              <span className="validation-icon invalid">
                                ❌
                              </span>
                              <div
                                id={`${fieldKey}-error`}
                                className="field-error"
                                role="alert"
                              >
                                <span className="error-icon">⚠️</span>
                                {fieldValidation[fieldKey].errorMessage}
                              </div>
                            </>
                          )
                        ) : (
                          responses[fieldKey] && (
                            <span className="validation-icon valid">✅</span>
                          )
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
