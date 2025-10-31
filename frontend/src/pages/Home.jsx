import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import "./Home.css";

function Home() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleBuyNow = (plan) => {
    navigate(`/signup?plan=${plan.toLowerCase()}`);
  };

  useEffect(() => {
    if (location.hash === "#pricing") {
      const pricingSection = document.getElementById("pricing");
      if (pricingSection) {
        pricingSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location]);

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Build Forms <span className="highlight">Effortlessly</span>
          </h1>
          <p className="hero-subtitle">
            Create, manage, and share forms with your team. Collect responses
            and export data seamlessly.
          </p>
          <div className="hero-buttons">
            {isAuthenticated ? (
              <>
                <a href="/admin" className="btn btn-primary">
                  Create Form
                </a>
                <a href="/admin/dashboard" className="btn btn-secondary">
                  View Dashboard
                </a>
              </>
            ) : (
              <>
                <a href="/signin" className="btn btn-primary">
                  Sign In
                </a>
                <a href="/signup" className="btn btn-secondary">
                  Sign Up
                </a>
              </>
            )}
          </div>
        </div>
        <div className="hero-image">
          <div className="form-preview">
            <div className="form-card">
              <h3>Sample Form</h3>
              <div className="form-field">
                <label>Name</label>
                <div className="input-placeholder"></div>
              </div>
              <div className="form-field">
                <label>Number</label>
                <div className="input-placeholder"></div>
              </div>
              <div className="form-field">
                <label>PAN</label>
                <div className="input-placeholder"></div>
              </div>
              <div className="submit-btn-placeholder"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Why Choose Team Form Builder?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📝</div>
              <h3>Easy Form Creation</h3>
              <p>
                Create forms in minutes with our intuitive interface. No coding
                required.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔗</div>
              <h3>Share Instantly</h3>
              <p>
                Generate public links and share your forms with anyone,
                anywhere.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Data Export</h3>
              <p>Export responses to Excel and analyze your data with ease.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Custom Redirects</h3>
              <p>
                Redirect users to any URL after form submission for a seamless
                experience.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3>Team Collaboration</h3>
              <p>
                Manage forms as a team with secure admin access and dashboard.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Responsive Design</h3>
              <p>
                Forms work perfectly on all devices - desktop, tablet, and
                mobile.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="pricing">
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

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <h2>Ready to Get Started?</h2>
          <p>
            Join thousands of teams already using Team Form Builder to
            streamline their data collection.
          </p>
          {isAuthenticated ? (
            <a href="/admin" className="btn btn-primary btn-large">
              Start Building Forms
            </a>
          ) : (
            <a href="/signin" className="btn btn-primary btn-large">
              Start Building Forms
            </a>
          )}
        </div>
      </section>
    </div>
  );
}

export default Home;
