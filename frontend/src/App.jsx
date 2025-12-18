import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import AdminCreateForm from "./pages/AdminCreateForm";
import CreateCampaign from "./pages/CreateCampaign";
import CampaignDashboard from "./pages/CampaignDashboard";
import DashboardLayout from "./components/DashboardLayout";
import AdminDashboard from "./pages/AdminDashboard";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import CampaignStop from "./pages/CampaignStop";
import PublicForm from "./pages/PublicForm";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Thanks from "./pages/Thanks";
import Settings from "./pages/Settings";
import { useAuth } from "./contexts/AuthContext";
import LoadingMessage from "./components/LoadingMessage";
import GlobalLoader from "./components/GlobalLoader";
import "./App.css";

// Helper function to generate random colors for avatar placeholders
const getRandomColor = (name, offset = 0) => {
  const colors = [
    "#667eea",
    "#764ba2",
    "#f093fb",
    "#f5576c",
    "#4facfe",
    "#00f2fe",
    "#43e97b",
    "#38f9d7",
    "#fa709a",
    "#fee140",
    "#a8edea",
    "#fed6e3",
  ];
  const index = (name.charCodeAt(0) + offset) % colors.length;
  return colors[index];
};

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const isPublicForm = location.pathname.startsWith("/form/");
  const isAuthPage =
    location.pathname === "/signin" || location.pathname === "/signup";
  const isCampaignStopPage = location.pathname === "/campaign-stopped";
  const { isAuthenticated, loading, logout, admin } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (loading) {
    return <LoadingMessage message="Authenticating..." />;
  }

  const authenticated = isAuthenticated();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);

  return (
    <>
      <GlobalLoader />
      <div className="App">
        {!isCampaignStopPage && (
          <>
            <header
              className={`App-header ${isPublicForm ? "public-form-header" : ""} ${
                isAuthPage ? "auth-page-header" : ""
              }`}
            >
              <div className="header-content">
                <div className="header-left">
                  <div
                    className="logo"
                    onClick={() => navigate("/")}
                    style={{ cursor: "pointer" }}
                  >
                    <span className="logo-text">RT Form</span>
                  </div>
                  {authenticated && (
                    <div className="welcome-text">
                      Welcome, {admin?.name?.split(" ")[0]}!
                    </div>
                  )}
                </div>
                {!isPublicForm && !isAuthPage && (
                  <>
                    <nav className={`header-nav ${isMenuOpen ? "open" : ""}`}>
                      {!authenticated && (
                        <>
                          <a
                            onClick={(e) => {
                              e.preventDefault();
                              navigate("/");
                              window.scrollTo(0, 0);
                              setIsMenuOpen(false);
                            }}
                          >
                            <i className="fas fa-home"></i> Home
                          </a>
                          <a
                            onClick={() => {
                              navigate("/#pricing");
                              setIsMenuOpen(false);
                            }}
                          >
                            <i className="fas fa-dollar-sign"></i> Pricing
                          </a>
                        </>
                      )}
                      {authenticated ? (
                        <>
                          {admin?.role !== "superadmin" && (
                            <>
                              <a
                                onClick={() => {
                                  navigate("/admin");
                                  setIsMenuOpen(false);
                                }}
                              >
                                Create Form
                              </a>
                              <a
                                onClick={() => {
                                  navigate("/admin/create-campaign");
                                  setIsMenuOpen(false);
                                }}
                              >
                                Create Campaign
                              </a>
                              <a
                                onClick={() => {
                                  navigate("/admin/campaigns");
                                  setIsMenuOpen(false);
                                }}
                              >
                                Campaigns
                              </a>
                              <a
                                onClick={() => {
                                  navigate("/admin/dashboard");
                                  setIsMenuOpen(false);
                                }}
                              >
                                Dashboard
                              </a>
                              {/* <button
                                onClick={() => {
                                  logout();
                                  navigate("/");
                                  setIsMenuOpen(false);
                                }}
                                className="logout-btn"
                              >
                                Logout
                              </button> */}
                            </>
                          )}
                        </>
                      ) : (
                        <>
                          <a
                            onClick={() => {
                              navigate("/signin");
                              setIsMenuOpen(false);
                            }}
                          >
                            Sign In
                          </a>
                          <a
                            onClick={() => {
                              navigate("/signup");
                              setIsMenuOpen(false);
                            }}
                          >
                            Sign Up
                          </a>
                        </>
                      )}
                    </nav>
                    <div className="header-right">
                      {authenticated && (
                        <div className="user-menu-container" ref={userMenuRef}>
                          <button
                            className="user-avatar-btn"
                            onClick={toggleUserMenu}
                            title={admin?.name}
                          >
                            {admin?.profilePicture ? (
                              <img
                                src={admin.profilePicture}
                                alt={admin.name}
                                className="user-avatar"
                              />
                            ) : (
                              <div
                                className="user-avatar-placeholder"
                                style={{
                                  background: `linear-gradient(135deg, ${getRandomColor(
                                    admin?.name || "User"
                                  )} 0%, ${getRandomColor(
                                    admin?.name || "User",
                                    1
                                  )} 100%)`,
                                }}
                              >
                                {admin?.name?.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </button>
                          {isUserMenuOpen && (
                            <div className="user-dropdown-menu">
                              <div className="user-info">
                                <strong>{admin?.name}</strong>
                                <small>{admin?.email}</small>
                              </div>
                              <hr />
                              <button
                                onClick={() => {
                                  navigate("/#pricing");
                                  setIsUserMenuOpen(false);
                                }}
                                className="dropdown-item"
                              >
                                <i className="fas fa-crown"></i> Upgrade Your Plan
                              </button>
                              <button
                                onClick={() => {
                                  navigate("/settings");
                                  setIsUserMenuOpen(false);
                                }}
                                className="dropdown-item"
                              >
                                <i className="fas fa-cog"></i> Settings
                              </button>
                              <hr />
                              <button
                                onClick={() => {
                                  logout();
                                  navigate("/");
                                  setIsUserMenuOpen(false);
                                }}
                                className="dropdown-item logout-item"
                              >
                                <i className="fas fa-sign-out-alt"></i> Logout
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                      {authenticated && admin?.role !== "superadmin" && (
                        <button
                          className={`hamburger ${isMenuOpen ? "open" : ""}`}
                          onClick={toggleMenu}
                        >
                          <span></span>
                          <span></span>
                          <span></span>
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </header>
            <footer className="App-footer">
              <div className="footer-content">
                <div className="footer-right">
                  <p>&copy; 2025 RT Form. All rights reserved.</p>
                  <div className="contact-links">
                    <a href="mailto:contact@rtform.com">
                      <i className="fas fa-envelope"></i>
                    </a>
                    <a
                      href="https://twitter.com/rtform"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="fab fa-twitter"></i>
                    </a>
                    <a
                      href="https://linkedin.com/company/rtform"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="fab fa-linkedin"></i>
                    </a>
                    <a
                      href="https://youtube.com/@rtform"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="fab fa-youtube"></i>
                    </a>
                  </div>
                </div>
              </div>
            </footer>
          </>
        )}
        <main>
          <Routes>
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/thanks" element={<Thanks />} />
            <Route
              path="/admin"
              element={
                isAuthenticated() ? (
                  <AdminCreateForm />
                ) : (
                  <Navigate to="/signin" />
                )
              }
            />
            <Route
              path="/admin/create-campaign"
              element={
                isAuthenticated() ? (
                  <CreateCampaign />
                ) : (
                  <Navigate to="/signin" />
                )
              }
            />
            <Route
              path="/admin/campaigns/:id/edit"
              element={
                isAuthenticated() ? (
                  <CreateCampaign />
                ) : (
                  <Navigate to="/signin" />
                )
              }
            />
            <Route
              path="/admin/campaigns"
              element={
                isAuthenticated() ? (
                  <CampaignDashboard />
                ) : (
                  <Navigate to="/signin" />
                )
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                isAuthenticated() ? (
                  admin?.role === "superadmin" ? (
                    <Navigate to="/superadmin/dashboard" />
                  ) : (
                    <AdminDashboard />
                  )
                ) : (
                  <Navigate to="/signin" />
                )
              }
            />
            <Route
              path="/superadmin/dashboard"
              element={
                isAuthenticated() && admin?.role === "superadmin" ? (
                  <SuperAdminDashboard />
                ) : (
                  <Navigate to="/signin" />
                )
              }
            />
            <Route path="/form/:id" element={<PublicForm />} />
            <Route path="/campaign-stopped" element={<CampaignStop />} />
            <Route
              path="/settings"
              element={
                isAuthenticated() ? <Settings /> : <Navigate to="/signin" />
              }
            />
            <Route
              path="/"
              element={
                !isAuthenticated() ? (
                  <Home />
                ) : admin?.role === "superadmin" ? (
                  <Navigate to="/superadmin/dashboard" />
                ) : (
                  <Navigate to="/admin/dashboard" />
                )
              }
            />
          </Routes>
        </main>
      </div>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
