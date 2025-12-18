import { useSearchParams } from "react-router-dom";
import "./CampaignStop.css";

function CampaignStop() {
  const [searchParams] = useSearchParams();
  const reason = searchParams.get("reason") || "unknown";

  const getMessage = () => {
    switch (reason) {
      case "stop":
        return {
          title: "Link Stopped",
          message: "Link is stopped contact provider for more details",
          icon: "🛑",
        };
      case "expire":
        return {
          title: "Link Expired",
          message: "Link is stopped contact provider for more details",
          icon: "⏰",
        };
      case "not_found":
        return {
          title: "Campaign Not Found",
          message: "The campaign you're looking for does not exist.",
          icon: "❓",
        };
      case "invalid":
        return {
          title: "Invalid Link",
          message: "The tracking link is invalid.",
          icon: "⚠️",
        };
      default:
        return {
          title: "Campaign Unavailable",
          message: "Please connect with your provider for more information.",
          icon: "🔗",
        };
    }
  };

  const info = getMessage();

  return (
    <div className="campaign-stopped-container">
      <div className="stopped-card">
        <div className="icon">{info.icon}</div>
        <h1>{info.title}</h1>
        <p>{info.message}</p>
        <div className="provider-notice">
          <strong>Please connect with your provider to continue.</strong>
        </div>
      </div>
    </div>
  );
}

export default CampaignStop;
