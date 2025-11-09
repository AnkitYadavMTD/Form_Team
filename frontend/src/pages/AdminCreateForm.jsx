import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import "./AdminCreateForm.css";

const formTemplates = {
  personal: {
    name: "Personal Information",
    fields: [
      { label: "Full Name", type: "text", required: true, icon: "👤" },
      { label: "Phone Number", type: "text", required: true, icon: "📞" },
      { label: "PAN Number", type: "text", required: true, icon: "🆔" },
    ],
  },
  contact: {
    name: "Contact Form",
    fields: [
      { label: "Name", type: "text", required: true, icon: "👤" },
      { label: "Email", type: "email", required: true, icon: "📧" },
      { label: "Message", type: "textarea", required: false, icon: "📝" },
    ],
  },
  event: {
    name: "Event Registration",
    fields: [
      { label: "Name", type: "text", required: true, icon: "👤" },
      { label: "Email", type: "email", required: true, icon: "📧" },
      { label: "Phone", type: "text", required: true, icon: "📞" },
      { label: "Event Date", type: "date", required: true, icon: "📅" },
    ],
  },
  survey: {
    name: "Basic Survey",
    fields: [
      { label: "Question 1", type: "text", required: true, icon: "❓" },
      { label: "Question 2", type: "text", required: true, icon: "❓" },
      { label: "Question 3", type: "textarea", required: false, icon: "📝" },
    ],
  },
  job: {
    name: "Job Application",
    fields: [
      { label: "Full Name", type: "text", required: true, icon: "👤" },
      { label: "Email", type: "email", required: true, icon: "📧" },
      { label: "Phone", type: "text", required: true, icon: "📞" },
      {
        label: "Position Applied For",
        type: "text",
        required: true,
        icon: "💼",
      },
      {
        label: "Experience (years)",
        type: "number",
        required: false,
        icon: "📈",
      },
    ],
  },
  feedback: {
    name: "Customer Feedback",
    fields: [
      { label: "Name", type: "text", required: true, icon: "👤" },
      { label: "Email", type: "email", required: true, icon: "📧" },
      { label: "Rating (1-5)", type: "number", required: true, icon: "⭐" },
      { label: "Comments", type: "textarea", required: false, icon: "💬" },
    ],
  },
  newsletter: {
    name: "Newsletter Signup",
    fields: [
      { label: "Name", type: "text", required: true, icon: "👤" },
      { label: "Email", type: "email", required: true, icon: "📧" },
    ],
  },
  support: {
    name: "Support Request",
    fields: [
      { label: "Name", type: "text", required: true, icon: "👤" },
      { label: "Email", type: "email", required: true, icon: "📧" },
      { label: "Issue Type", type: "text", required: true, icon: "🔧" },
      { label: "Description", type: "textarea", required: true, icon: "📝" },
    ],
  },
  quote: {
    name: "Quote Request",
    fields: [
      { label: "Name", type: "text", required: true, icon: "👤" },
      { label: "Email", type: "email", required: true, icon: "📧" },
      { label: "Company", type: "text", required: false, icon: "🏢" },
      { label: "Service Needed", type: "textarea", required: true, icon: "🛠️" },
      { label: "Budget Range", type: "text", required: false, icon: "💰" },
    ],
  },
};

function AdminCreateForm() {
  const [formTitle, setFormTitle] = useState("");
  const [enableRedirect, setEnableRedirect] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [customFields, setCustomFields] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [showAddFieldModal, setShowAddFieldModal] = useState(false);
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldType, setNewFieldType] = useState("text");
  const [newFieldRequired, setNewFieldRequired] = useState(false);

  const handleTemplateSelect = (templateKey) => {
    setSelectedTemplate(templateKey);
    if (templateKey && formTemplates[templateKey]) {
      const templateFields = formTemplates[templateKey].fields.map((field) => ({
        ...field,
        id: Date.now() + Math.random(),
      }));
      setCustomFields(templateFields);
    } else {
      setCustomFields([]);
    }
  };

  const handleAddField = () => {
    setShowAddFieldModal(true);
  };

  const handleSaveField = () => {
    if (newFieldLabel.trim()) {
      const fieldData = {
        id: Date.now(),
        label: newFieldLabel.trim(),
        type: newFieldType,
        required: newFieldRequired,
        icon: getFieldIcon(newFieldType),
      };

      setCustomFields([...customFields, fieldData]);

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

  const handleDeleteField = (fieldId) => {
    setCustomFields(customFields.filter((field) => field.id !== fieldId));
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

  const { getAuthHeaders } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setMessageType("");

    if (customFields.length === 0) {
      setMessage("Error: At least one field is required to create a form.");
      setMessageType("error");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/forms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          title: formTitle,
          redirect_url: enableRedirect ? redirectUrl : "",
          fields: customFields,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(`Form created successfully! Form ID: ${data.id}`);
        setMessageType("success");
        setFormTitle("");
        setEnableRedirect(false);
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

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={enableRedirect}
                onChange={(e) => setEnableRedirect(e.target.checked)}
              />
              <span className="checkmark"></span>
              Enable redirect after form submission
            </label>
          </div>
          {enableRedirect && (
            <div className="form-group">
              <label htmlFor="redirectUrl">Redirect URL</label>
              <input
                id="redirectUrl"
                type="url"
                value={redirectUrl}
                onChange={(e) => setRedirectUrl(e.target.value)}
                placeholder="https://example.com/thank-you"
                required={enableRedirect}
                className="form-input"
              />
              <small className="form-help">
                Users will be redirected here after form submission
              </small>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="templateSelect">Choose Template (Optional)</label>
            <select
              id="templateSelect"
              value={selectedTemplate}
              onChange={(e) => handleTemplateSelect(e.target.value)}
              className="form-input"
            >
              <option value="">Start with blank form</option>
              {Object.entries(formTemplates).map(([key, template]) => (
                <option key={key} value={key}>
                  {template.name}
                </option>
              ))}
            </select>
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

                  <div className="field-actions">
                    <button
                      type="button"
                      className="delete-field-btn"
                      onClick={() => handleDeleteField(field.id)}
                      title="Delete field"
                    >
                      🗑️
                    </button>
                  </div>
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
                  {editingFieldId ? "Update Field" : "Add Field"}
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
