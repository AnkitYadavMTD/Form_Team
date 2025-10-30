import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
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
  const isPublicForm = location.pathname.startsWith("/form/");
  const { isAuthenticated, loading, logout, admin } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  const authenticated = isAuthenticated();

  return (
    <div className="App">
      <header
        className={`App-header ${isPublicForm ? "public-form-header" : ""}`}
      >
        <div className="header-content">
          <h1>Team Form Builder</h1>
          {!isPublicForm && (
            <nav className="header-nav">
              <a href="/">Home</a>
              {authenticated ? (
                <>
                  <span className="welcome-user">Welcome, {admin?.email}</span>
                  <a href="/admin">Create Form</a>
                  <a href="/admin/dashboard">Dashboard</a>
                  <button
                    onClick={() => {
                      logout();
                      window.location.href = "/";
                    }}
                    className="logout-btn"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <a href="/signin">Sign In</a>
                  <a href="/signup">Sign Up</a>
                </>
              )}
            </nav>
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
          <Route path="/" element={<Home />} />
        </Routes>
      </main>
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
