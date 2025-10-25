import { useState } from "react";
import "./AdminCreateForm.css";

function AdminCreateForm() {
  const [formTitle, setFormTitle] = useState("");
  const [redirectUrl, setRedirectUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [customFields, setCustomFields] = useState([]);
  const [showAddFieldModal, setShowAddFieldModal] = useState(false);
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldType, setNewFieldType] = useState("text");
  const [newFieldRequired, setNewFieldRequired] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("");

  // Define 6 form templates
  const formTemplates = {
    contact: {
      name: "Contact Form",
      fields: [
        { id: 1, label: "Email", type: "email", required: false, icon: "📧" },
        { id: 2, label: "Subject", type: "text", required: false, icon: "📄" },
        {
          id: 3,
          label: "Message",
          type: "textarea",
          required: false,
          icon: "📝",
        },
      ],
    },
    registration: {
      name: "Registration Form",
      fields: [
        { id: 1, label: "Email", type: "email", required: false, icon: "📧" },
        { id: 2, label: "Phone", type: "text", required: false, icon: "📞" },
        {
          id: 3,
          label: "Date of Birth",
          type: "date",
          required: false,
          icon: "📅",
        },
        {
          id: 4,
          label: "Address",
          type: "textarea",
          required: false,
          icon: "🏠",
        },
      ],
    },
    survey: {
      name: "Survey Form",
      fields: [
        {
          id: 1,
          label: "Age Group",
          type: "text",
          required: false,
          icon: "👤",
        },
        {
          id: 2,
          label: "Feedback",
          type: "textarea",
          required: false,
          icon: "📝",
        },
        {
          id: 3,
          label: "Rating (1-5)",
          type: "number",
          required: false,
          icon: "⭐",
        },
      ],
    },
    feedback: {
      name: "Feedback Form",
      fields: [
        {
          id: 1,
          label: "Overall Experience",
          type: "text",
          required: false,
          icon: "😊",
        },
        {
          id: 2,
          label: "Suggestions",
          type: "textarea",
          required: false,
          icon: "💡",
        },
        {
          id: 3,
          label: "Would Recommend",
          type: "text",
          required: false,
          icon: "👍",
        },
      ],
    },
    event: {
      name: "Event Registration",
      fields: [
        { id: 1, label: "Email", type: "email", required: false, icon: "📧" },
        { id: 2, label: "Phone", type: "text", required: false, icon: "📞" },
        {
          id: 3,
          label: "Organization",
          type: "text",
          required: false,
          icon: "🏢",
        },
        {
          id: 4,
          label: "Special Requirements",
          type: "textarea",
          required: false,
          icon: "📋",
        },
      ],
    },
    job: {
      name: "Job Application",
      fields: [
        { id: 1, label: "Email", type: "email", required: false, icon: "📧" },
        { id: 2, label: "Phone", type: "text", required: false, icon: "📞" },
        {
          id: 3,
          label: "Experience (years)",
          type: "number",
          required: false,
          icon: "💼",
        },
        {
          id: 4,
          label: "Resume Link",
          type: "text",
          required: false,
          icon: "📎",
        },
        {
          id: 5,
          label: "Cover Letter",
          type: "textarea",
          required: false,
          icon: "📝",
        },
      ],
    },
  };

  const handleAddField = () => {
    setShowAddFieldModal(true);
  };

  const handleSaveField = () => {
    if (newFieldLabel.trim()) {
      const newField = {
        id: Date.now(),
        label: newFieldLabel.trim(),
        type: newFieldType,
        required: newFieldRequired,
        icon: getFieldIcon(newFieldType),
      };
      setCustomFields([...customFields, newField]);
      setNewFieldLabel("");
      setNewFieldType("text");
      setNewFieldRequired(false);
      setShowAddFieldModal(false);
    }
  };

  const handleCancelField = () => {
    setNewFieldLabel("");
    setNewFieldType("text");
    setNewFieldRequired(false);
    setShowAddFieldModal(false);
  };

  const handleTemplateSelect = (templateKey) => {
    setSelectedTemplate(templateKey);
    if (templateKey && formTemplates[templateKey]) {
      setCustomFields(formTemplates[templateKey].fields);
    } else {
      setCustomFields([]);
    }
  };

  const toggleFieldRequired = (fieldId) => {
    setCustomFields(
      customFields.map((field) =>
        field.id === fieldId ? { ...field, required: !field.required } : field
      )
    );
  };

  const getFieldIcon = (type) => {
    switch (type) {
      case "email":
        return "📧";
      case "number":
        return "🔢";
      case "date":
        return "📅";
      case "textarea":
        return "📝";
      default:
        return "📄";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setMessageType("");

    try {
      const response = await fetch("/api/forms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "admin-token-123", // Simple token for demo
        },
        body: JSON.stringify({
          title: formTitle,
          redirect_url: redirectUrl,
          fields: customFields,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(`Form created successfully! Form ID: ${data.id}`);
        setMessageType("success");
        setFormTitle("");
        setRedirectUrl("");
        setCustomFields([]);
        setSelectedTemplate("");
      } else {
        const error = await response.json();
        setMessage(`Error: ${error.error}`);
        setMessageType("error");
      }
    } catch (err) {
      setMessage("Error creating form");
      setMessageType("error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-form-container">
      <div className="create-form-card">
        <div className="form-header">
          <h2>Create New Form</h2>
          <p>Build a form to collect user information with custom redirect</p>
        </div>

        <form onSubmit={handleSubmit} className="create-form">
          <div className="form-group">
            <label htmlFor="formTitle">Form Title</label>
            <input
              id="formTitle"
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="Enter form title"
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="redirectUrl">Redirect URL</label>
            <input
              id="redirectUrl"
              type="url"
              value={redirectUrl}
              onChange={(e) => setRedirectUrl(e.target.value)}
              placeholder="https://example.com/thank-you"
              required
              className="form-input"
            />
            <small className="form-help">
              Users will be redirected here after form submission
            </small>
          </div>

          <div className="form-group">
            <label>Choose a Template (Optional)</label>
            <div className="template-buttons">
              {Object.entries(formTemplates).map(([key, template]) => (
                <button
                  key={key}
                  type="button"
                  className={`template-btn ${
                    selectedTemplate === key ? "active" : ""
                  }`}
                  onClick={() => handleTemplateSelect(key)}
                >
                  {template.name}
                </button>
              ))}
              <button
                type="button"
                className={`template-btn ${
                  selectedTemplate === "" ? "active" : ""
                }`}
                onClick={() => handleTemplateSelect("")}
              >
                Custom (No Template)
              </button>
            </div>
            <small className="form-help">
              Select a template to pre-populate fields, or choose Custom to
              start from scratch
            </small>
          </div>

          <div className="form-fields-info">
            <div className="fields-header">
              <h3>Form Fields</h3>
              <button
                type="button"
                className="add-field-btn"
                onClick={handleAddField}
              >
                <span className="btn-icon">+</span>
                Add Field
              </button>
            </div>
            <div className="fields-preview">
              {customFields.map((field) => (
                <div key={field.id} className="field-item">
                  <button
                    type="button"
                    className={`required-toggle ${
                      field.required ? "active" : ""
                    }`}
                    onClick={() => toggleFieldRequired(field.id)}
                    title={field.required ? "Make optional" : "Make required"}
                  >
                    {field.required ? "🔴" : "⚪"}
                  </button>
                  <span className="field-icon">{field.icon}</span>
                  <span className="field-label">{field.label}</span>
                  {field.required && (
                    <span className="field-required">Required</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? (
              <>
                <span className="spinner"></span>
                Creating Form...
              </>
            ) : (
              <>
                <span className="btn-icon">✨</span>
                Create Form
              </>
            )}
          </button>
        </form>

        {showAddFieldModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Add New Field</h3>
                <button
                  type="button"
                  className="close-btn"
                  onClick={handleCancelField}
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="fieldLabel">Field Label</label>
                  <input
                    id="fieldLabel"
                    type="text"
                    value={newFieldLabel}
                    onChange={(e) => setNewFieldLabel(e.target.value)}
                    placeholder="Enter field name"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="fieldType">Field Type</label>
                  <select
                    id="fieldType"
                    value={newFieldType}
                    onChange={(e) => setNewFieldType(e.target.value)}
                    className="form-input"
                  >
                    <option value="text">Text</option>
                    <option value="email">Email</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                    <option value="textarea">Textarea</option>
                  </select>
                </div>
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={newFieldRequired}
                      onChange={(e) => setNewFieldRequired(e.target.checked)}
                    />
                    <span className="checkmark"></span>
                    Required field
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={handleCancelField}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="save-btn"
                  onClick={handleSaveField}
                >
                  Add Field
                </button>
              </div>
            </div>
          </div>
        )}

        {message && (
          <div className={`message ${messageType}`}>
            {messageType === "success" ? "✅" : "❌"} {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminCreateForm;
