import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { useState } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import AdminCreateForm from "./pages/AdminCreateForm";
import AdminDashboard from "./pages/AdminDashboard";
import PublicForm from "./pages/PublicForm";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import { useAuth } from "./contexts/AuthContext";
import "./App.css";

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const isPublicForm = location.pathname.startsWith("/form/");
  const isAuthPage =
    location.pathname === "/signin" || location.pathname === "/signup";
  const { isAuthenticated, loading, logout, admin } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (loading) {
    return <div>Loading...</div>;
  }

  const authenticated = isAuthenticated();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className="App">
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
          </div>
          {!isPublicForm && !isAuthPage && (
            <>
              <div className="header-center">
                {authenticated && (
                  <span className="welcome-user">Welcome, {admin?.email}</span>
                )}
              </div>
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
                        navigate("/admin/dashboard");
                        setIsMenuOpen(false);
                      }}
                    >
                      Dashboard
                    </a>
                    <button
                      onClick={() => {
                        logout();
                        navigate("/");
                        setIsMenuOpen(false);
                      }}
                      className="logout-btn"
                    >
                      Logout
                    </button>
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
                <button
                  className={`hamburger ${isMenuOpen ? "open" : ""}`}
                  onClick={toggleMenu}
                >
                  <span></span>
                  <span></span>
                  <span></span>
                </button>
              </div>
            </>
          )}
        </div>
      </header>
      <main>
        <Routes>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
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
            path="/admin/dashboard"
            element={
              isAuthenticated() ? <AdminDashboard /> : <Navigate to="/signin" />
            }
          />
          <Route path="/form/:id" element={<PublicForm />} />
          <Route
            path="/"
            element={
              !isAuthenticated() ? <Home /> : <Navigate to="/admin/dashboard" />
            }
          />
        </Routes>
      </main>
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
    </div>
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
