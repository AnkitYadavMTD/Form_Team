import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import "./CreateCampaign.css";

const categories = [
  "Finance",
  "Insurance",
  "Health & Beauty",
  "E-commerce",
  "Education",
  "Technology",
  "Travel",
  "Gaming",
  "Real Estate",
  "Other"
];

const currencies = ["USD", "EUR", "GBP", "INR", "CAD", "AUD"];

function CreateCampaign() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);

  // Step 1: Basic Details
  const [campaignName, setCampaignName] = useState("");
  const [advertiser, setAdvertiser] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("draft");

  // Step 2: Payout & Conversion
  const [payoutType, setPayoutType] = useState("CPA");
  const [payoutAmount, setPayoutAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [conversionEvent, setConversionEvent] = useState("");
  const [salePercentage, setSalePercentage] = useState("");

  // Step 3: Tracking Setup
  const [offerUrl, setOfferUrl] = useState("");
  const [postbackUrl, setPostbackUrl] = useState("");

  const { getAuthHeaders } = useAuth();
  const navigate = useNavigate();
  const { id: campaignId } = useParams();

  // Fetch campaign data if editing
  useEffect(() => {
    if (campaignId) {
      setIsEditMode(true);
      fetchCampaignData(campaignId);
    }
  }, [campaignId]);

  const fetchCampaignData = async (id) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/campaigns/${id}`, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const result = await response.json();
        // Extract campaign from nested data structure
        const campaign = result.data || result;
        console.log("Loaded campaign:", campaign);
        setCampaignName(campaign.name || "");
        setAdvertiser(campaign.advertiser || "");
        setCategory(campaign.category || "");
        setStatus(campaign.status || "draft");
        setPayoutType(campaign.payout_type || "CPA");
        setPayoutAmount(campaign.payout_amount?.toString() || "");
        setCurrency(campaign.currency || "USD");
        setConversionEvent(campaign.conversion_event || "");
        setSalePercentage(campaign.sale_percentage?.toString() || "");
        setOfferUrl(campaign.offer_url || "");
        setPostbackUrl(campaign.postback_url || "");
        setCurrentStep(1);
        console.log("Form state updated");
      } else {
        const errorData = await response.json();
        console.error("Failed to load campaign:", errorData);
        setMessage("Failed to load campaign");
        setMessageType("error");
      }
    } catch (err) {
      console.error("Error loading campaign:", err);
      setMessage("Error loading campaign");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const totalSteps = 4;

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return campaignName.trim() && advertiser.trim() && category;
      case 2:
        return payoutType && payoutAmount && conversionEvent;
      case 3:
        return offerUrl.trim();
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
      setMessage("");
    } else {
      setMessage("Please fill in all required fields");
      setMessageType("error");
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
    setMessage("");
  };

  const handleSaveDraft = async () => {
    await handleSubmit("draft");
  };

  const handlePublish = async () => {
    // Determine final status: 'active' for new campaigns, user-selected status for edits
    const finalStatus = isEditMode ? status : "active";
    await handleSubmit(finalStatus);
  };

  const handleSubmit = async (finalStatus = "draft") => {
    setLoading(true);
    setMessage("");
    setMessageType("");

    const campaignData = {
      name: campaignName,
      advertiser,
      category,
      status: finalStatus,
      payout_type: payoutType,
      payout_amount: parseFloat(payoutAmount),
      currency,
      conversion_event: conversionEvent,
      sale_percentage: payoutType === "CPS" ? parseFloat(salePercentage) : null,
      offer_url: offerUrl,
      tracking_parameters: {
        clickid: "{clickid}",
        affid: "{affid}",
        sub1: "{sub1}",
        sub2: "{sub2}",
        sub3: "{sub3}"
      },
      postback_url: postbackUrl,
    };

    try {
      const method = isEditMode ? "PUT" : "POST";
      const url = isEditMode ? `/api/campaigns/${campaignId}` : "/api/campaigns";
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(campaignData),
      });

      if (response.ok) {
        const data = await response.json();
        const created = data && data.success ? data.data : data;
        const createdId = created?.id || created?.campaign_id || null;
        setMessage(
          isEditMode
            ? "Campaign updated successfully!"
            : isDraft
            ? `Campaign saved as draft! Campaign ID: ${createdId ?? 'N/A'}`
            : `Campaign published successfully! Campaign ID: ${createdId ?? 'N/A'}`
        );
        setMessageType("success");

        setTimeout(() => {
          navigate("/admin/dashboard");
        }, 2000);
      } else {
        const error = await response.json();
        setMessage(`Error: ${error.error || error.message || 'Failed to save campaign'}`);
        setMessageType("error");
      }
    } catch (err) {
      setMessage("Error creating campaign");
      setMessageType("error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => {
    return (
      <div className="step-indicator">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i + 1}
            className={`step ${currentStep > i + 1 ? "completed" : currentStep === i + 1 ? "active" : ""}`}
          >
            <div className="step-number">{i + 1}</div>
            <div className="step-label">
              {i === 0 && "Basic Details"}
              {i === 1 && "Payout & Conversion"}
              {i === 2 && "Tracking Setup"}
              {i === 3 && "Review & Publish"}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderStep1 = () => (
    <div className="step-content">
      <h3>Basic Details</h3>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="campaignName">Campaign Name *</label>
          <input
            id="campaignName"
            type="text"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            placeholder="Enter campaign name"
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="advertiser">Advertiser *</label>
          <input
            id="advertiser"
            type="text"
            value={advertiser}
            onChange={(e) => setAdvertiser(e.target.value)}
            placeholder="Enter advertiser name"
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Category *</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className="form-input"
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="status">Campaign Status</label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="form-input"
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="stop">Stop</option>
            <option value="expire">Expire</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="step-content">
      <h3>Payout & Conversion</h3>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="payoutType">Payout Type *</label>
          <select
            id="payoutType"
            value={payoutType}
            onChange={(e) => setPayoutType(e.target.value)}
            required
            className="form-input"
          >
            <option value="CPA">CPA (Cost Per Action)</option>
            <option value="CPL">CPL (Cost Per Lead)</option>
            <option value="CPS">CPS (Cost Per Sale)</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="payoutAmount">Payout Amount *</label>
          <input
            id="payoutAmount"
            type="number"
            step="0.01"
            value={payoutAmount}
            onChange={(e) => setPayoutAmount(e.target.value)}
            placeholder="0.00"
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="currency">Currency</label>
          <select
            id="currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="form-input"
          >
            {currencies.map((curr) => (
              <option key={curr} value={curr}>
                {curr}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="conversionEvent">Conversion Event *</label>
          <input
            id="conversionEvent"
            type="text"
            value={conversionEvent}
            onChange={(e) => setConversionEvent(e.target.value)}
            placeholder="e.g., Lead, Install, Sale"
            required
            className="form-input"
          />
        </div>

        {payoutType === "CPS" && (
          <div className="form-group">
            <label htmlFor="salePercentage">Sale Amount %</label>
            <input
              id="salePercentage"
              type="number"
              step="0.01"
              value={salePercentage}
              onChange={(e) => setSalePercentage(e.target.value)}
              placeholder="e.g., 8.5"
              className="form-input"
            />
          </div>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="step-content">
      <h3>Tracking Setup</h3>
      <div className="form-grid">
        <div className="form-group full-width">
          <label htmlFor="offerUrl">Offer URL / Landing Page URL *</label>
          <input
            id="offerUrl"
            type="url"
            value={offerUrl}
            onChange={(e) => setOfferUrl(e.target.value)}
            placeholder="https://example.com/offer"
            required
            className="form-input"
          />
        </div>

        <div className="form-group full-width">
          <label>Tracking Parameters Preview</label>
          <div className="tracking-preview">
            <p>Your tracking URL will be:</p>
            <code>
              {offerUrl || "https://example.com/offer"}?clickid={"{clickid}"}&affid={"{affid}"}&sub1={"{sub1}"}
            </code>
            <button
              type="button"
              className="copy-btn"
              onClick={() => navigator.clipboard.writeText(
                `${offerUrl}?clickid={clickid}&affid={affid}&sub1={sub1}&sub2={sub2}&sub3={sub3}`
              )}
            >
              📋 Copy Template
            </button>
          </div>
        </div>

        <div className="form-group full-width">
          <label htmlFor="postbackUrl">Postback URL</label>
          <input
            id="postbackUrl"
            type="url"
            value={postbackUrl}
            onChange={(e) => setPostbackUrl(e.target.value)}
            placeholder="https://yourdomain.com/postback"
            className="form-input"
          />
          <small className="form-help">
            Used to receive conversion notifications from the advertiser
          </small>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="step-content">
      <h3>Review & Publish</h3>
      <div className="review-sections">
        <div className="review-section">
          <h4>Campaign Basics</h4>
          <div className="review-item">
            <strong>Name:</strong> {campaignName}
          </div>
          <div className="review-item">
            <strong>Advertiser:</strong> {advertiser}
          </div>
          <div className="review-item">
            <strong>Category:</strong> {category}
          </div>
          <div className="review-item">
            <strong>Status:</strong> {status}
          </div>
        </div>

        <div className="review-section">
          <h4>Payout & Conversion</h4>
          <div className="review-item">
            <strong>Payout Type:</strong> {payoutType}
          </div>
          <div className="review-item">
            <strong>Payout Amount:</strong> {payoutAmount} {currency}
          </div>
          <div className="review-item">
            <strong>Conversion Event:</strong> {conversionEvent}
          </div>
          {payoutType === "CPS" && (
            <div className="review-item">
              <strong>Sale Percentage:</strong> {salePercentage}%
            </div>
          )}
        </div>

        <div className="review-section">
          <h4>Tracking Setup</h4>
          <div className="review-item">
            <strong>Offer URL:</strong> {offerUrl}
          </div>
          <div className="review-item">
            <strong>Postback URL:</strong> {postbackUrl || "Not set"}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="create-campaign-container">
      <div className="create-campaign-card">
        <div className="form-header">
          <h2>{isEditMode ? "Edit Campaign" : "Create New Campaign"}</h2>
          <p>
            {isEditMode
              ? "Update your campaign details"
              : "Set up your affiliate marketing campaign in a few simple steps"}
          </p>
        </div>

        {renderStepIndicator()}

        <div className="campaign-form">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}

          <div className="form-actions">
            {currentStep > 1 && (
              <button
                type="button"
                className="back-btn"
                onClick={handleBack}
                disabled={loading}
              >
                Back
              </button>
            )}

            {currentStep < totalSteps ? (
              <button
                type="button"
                className="next-btn"
                onClick={handleNext}
                disabled={loading}
              >
                Save & Continue
              </button>
            ) : (
              <div className="final-actions">
                <button
                  type="button"
                  className="draft-btn"
                  onClick={handleSaveDraft}
                  disabled={loading}
                >
                  {loading ? "Saving..." : isEditMode ? "Save Changes" : "Save as Draft"}
                </button>
                <button
                  type="button"
                  className="publish-btn"
                  onClick={handlePublish}
                  disabled={loading}
                >
                  {loading ? (isEditMode ? "Updating..." : "Publishing...") : isEditMode ? "Update Campaign" : "Publish Campaign"}
                </button>
              </div>
            )}
          </div>
        </div>

        {message && (
          <div className={`message ${messageType}`}>
            {messageType === "success" ? "✅" : "❌"} {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default CreateCampaign;
