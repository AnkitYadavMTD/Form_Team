import './Home.css';

function Home() {
  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Build Forms <span className="highlight">Effortlessly</span>
          </h1>
          <p className="hero-subtitle">
            Create, manage, and share forms with your team. Collect responses and export data seamlessly.
          </p>
          <div className="hero-buttons">
            <a href="/admin" className="btn btn-primary">
              Create Form
            </a>
            <a href="/admin/dashboard" className="btn btn-secondary">
              View Dashboard
            </a>
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
              <p>Create forms in minutes with our intuitive interface. No coding required.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔗</div>
              <h3>Share Instantly</h3>
              <p>Generate public links and share your forms with anyone, anywhere.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Data Export</h3>
              <p>Export responses to Excel and analyze your data with ease.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Custom Redirects</h3>
              <p>Redirect users to any URL after form submission for a seamless experience.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3>Team Collaboration</h3>
              <p>Manage forms as a team with secure admin access and dashboard.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Responsive Design</h3>
              <p>Forms work perfectly on all devices - desktop, tablet, and mobile.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <h2>Ready to Get Started?</h2>
          <p>Join thousands of teams already using Team Form Builder to streamline their data collection.</p>
          <a href="/admin" className="btn btn-primary btn-large">
            Start Building Forms
          </a>
        </div>
      </section>
    </div>
  );
}

export default Home;
