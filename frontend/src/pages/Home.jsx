import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import "./Home.css";

function Home() {
  const { isAuthenticated, admin } = useAuth();
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
                {admin?.role !== "superadmin" && (
                  <a href="/admin" className="btn btn-primary">
                    Create Form
                  </a>
                )}
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
      <section id="pricing" className="bg-gray-50 py-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Choose Your Plan
          </h2>
          <p className="text-gray-500 mb-12">
            Select the perfect plan for your team's form building needs
          </p>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Bronze */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col hover:shadow-md transition">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-800">BRONZE</h3>
                <div className="flex items-end justify-center mt-2">
                  <span className="text-2xl font-bold text-gray-900">₹499</span>
                  <span className="text-sm text-gray-500 ml-1">/30 Days</span>
                </div>
                <div className="text-sm text-gray-400 line-through mt-1">
                  ₹2,499.00
                </div>
              </div>

              <ul className="text-sm text-gray-600 space-y-2 mb-6 text-left">
                <li>Create Unlimited Form</li>
                <li>User Control Management</li>
                <li>6 Form Template</li>
                <li>Collected Data Reports</li>
                <li>Unlimited Response</li>
                <li>Extra ₹499 for Custom Domain</li>
              </ul>

              <button
                className="mt-auto bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:opacity-90 transition"
                onClick={() => handleBuyNow("bronze")}
              >
                BUY NOW
              </button>
            </div>

            {/* Silver (Most Popular) */}
            <div className="relative bg-white border border-gray-200 rounded-2xl p-6 shadow-md ring-2 ring-blue-400 flex flex-col hover:shadow-lg transition">
              <span className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
                Most Popular
              </span>

              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-800">SILVER</h3>
                <div className="flex items-end justify-center mt-2">
                  <span className="text-2xl font-bold text-gray-900">
                    ₹1499
                  </span>
                  <span className="text-sm text-gray-500 ml-1">/90 Days</span>
                </div>
                <div className="text-sm text-gray-400 line-through mt-1">
                  ₹6,249.00
                </div>
              </div>

              <ul className="text-sm text-gray-600 space-y-2 mb-6 text-left">
                <li>Create Unlimited Form</li>
                <li>User Control Management</li>
                <li>6 Form Template</li>
                <li>Collected Data Reports</li>
                <li>Unlimited Response</li>
                <li>Extra ₹499 for Custom Domain</li>
              </ul>

              <button
                className="mt-auto bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:opacity-90 transition"
                onClick={() => handleBuyNow("silver")}
              >
                BUY NOW
              </button>
            </div>

            {/* Gold */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col hover:shadow-md transition">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-800">GOLD</h3>
                <div className="flex items-end justify-center mt-2">
                  <span className="text-2xl font-bold text-gray-900">
                    ₹2999
                  </span>
                  <span className="text-sm text-gray-500 ml-1">/150 Days</span>
                </div>
                <div className="text-sm text-gray-400 line-through mt-1">
                  ₹12,499.00
                </div>
              </div>

              <ul className="text-sm text-gray-600 space-y-2 mb-6 text-left">
                <li>Create Unlimited Form</li>
                <li>User Control Management</li>
                <li>6 Form Template</li>
                <li>Collected Data Reports</li>
                <li>Unlimited Response</li>
                <li>Extra ₹499 for Custom Domain</li>
              </ul>

              <button
                className="mt-auto bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:opacity-90 transition"
                onClick={() => handleBuyNow("gold")}
              >
                BUY NOW
              </button>
            </div>

            {/* Platinum */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col hover:shadow-md transition">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-800">PLATINUM</h3>
                <div className="flex items-end justify-center mt-2">
                  <span className="text-2xl font-bold text-gray-900">
                    ₹4999
                  </span>
                  <span className="text-sm text-gray-500 ml-1">/365 Days</span>
                </div>
                <div className="text-sm text-gray-400 line-through mt-1">
                  ₹29,999.00
                </div>
              </div>

              <ul className="text-sm text-gray-600 space-y-2 mb-6 text-left">
                <li>Create Unlimited Form</li>
                <li>User Control Management</li>
                <li>6 Form Template</li>
                <li>Collected Data Reports</li>
                <li>Unlimited Response</li>
                <li>Extra ₹499 for Custom Domain</li>
              </ul>

              <button
                className="mt-auto bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:opacity-90 transition"
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
            admin?.role !== "superadmin" && (
              <a href="/admin" className="btn btn-primary btn-large">
                Start Building Forms
              </a>
            )
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
