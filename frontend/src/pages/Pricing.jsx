import { useNavigate } from "react-router-dom";
import "./Home.css"; // Reuse the same CSS for consistency

function Pricing() {
  const navigate = useNavigate();

  const handleBuyNow = (plan) => {
    navigate(`/signup?plan=${plan.toLowerCase()}`);
  };

  return (
    <div className="home">
      {/* Pricing Section */}
      <section className="pricing">
        <div className="container">
          <h2 className="section-title">Choose Your Plan</h2>
          <p className="pricing-subtitle">
            Select the perfect plan for your team's form building needs
          </p>
          <div className="pricing-grid">
            <div className="pricing-card">
              <div className="pricing-header">
                <h3>BRONZE</h3>
                <div className="price">
                  <span className="currency">₹</span>
                  <span className="amount">499</span>
                  <span className="period">/30 Days</span>
                </div>
                <div className="original-price">₹2,499.00</div>
              </div>
              <ul className="features-list">
                <li>Create Unlimited Form</li>
                <li>User Control Management</li>
                <li>6 Form Template</li>
                <li>Collected Data Reports</li>
                <li>Unlimited Response</li>
                <li>Extra 499rs For Custom Domain</li>
              </ul>
              <button
                className="btn btn-primary pricing-btn"
                onClick={() => handleBuyNow("bronze")}
              >
                BUY NOW
              </button>
            </div>

            <div className="pricing-card popular">
              <div className="popular-badge">Most Popular</div>
              <div className="pricing-header">
                <h3>SILVER</h3>
                <div className="price">
                  <span className="currency">₹</span>
                  <span className="amount">1499</span>
                  <span className="period">/90 Days</span>
                </div>
                <div className="original-price">₹6,249.00</div>
              </div>
              <ul className="features-list">
                <li>Create Unlimited Form</li>
                <li>User Control Management</li>
                <li>6 Form Template</li>
                <li>Collected Data Reports</li>
                <li>Unlimited Response</li>
                <li>Extra 499rs For Custom Domain</li>
              </ul>
              <button
                className="btn btn-primary pricing-btn"
                onClick={() => handleBuyNow("silver")}
              >
                BUY NOW
              </button>
            </div>

            <div className="pricing-card">
              <div className="pricing-header">
                <h3>GOLD</h3>
                <div className="price">
                  <span className="currency">₹</span>
                  <span className="amount">2999</span>
                  <span className="period">/150 Days</span>
                </div>
                <div className="original-price">₹12,499.00</div>
              </div>
              <ul className="features-list">
                <li>Create Unlimited Form</li>
                <li>User Control Management</li>
                <li>6 Form Template</li>
                <li>Collected Data Reports</li>
                <li>Unlimited Response</li>
                <li>Extra 499rs For Custom Domain</li>
              </ul>
              <button
                className="btn btn-primary pricing-btn"
                onClick={() => handleBuyNow("gold")}
              >
                BUY NOW
              </button>
            </div>

            <div className="pricing-card">
              <div className="pricing-header">
                <h3>PLATINUM</h3>
                <div className="price">
                  <span className="currency">₹</span>
                  <span className="amount">4999</span>
                  <span className="period">/365 Days</span>
                </div>
                <div className="original-price">₹29,999.00</div>
              </div>
              <ul className="features-list">
                <li>Create Unlimited Form</li>
                <li>User Control Management</li>
                <li>6 Form Template</li>
                <li>Collected Data Reports</li>
                <li>Unlimited Response</li>
                <li>Extra 499rs For Custom Domain</li>
              </ul>
              <button
                className="btn btn-primary pricing-btn"
                onClick={() => handleBuyNow("platinum")}
              >
                BUY NOW
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Pricing;
