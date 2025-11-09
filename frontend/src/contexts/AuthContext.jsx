import { createContext, useContext, useState, useEffect, useRef } from "react";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const inactivityTimeoutRef = useRef(null);

  const resetInactivityTimer = () => {
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }
    if (token) {
      inactivityTimeoutRef.current = setTimeout(() => {
        logout();
        alert("You have been logged out due to inactivity.");
      }, 60 * 60 * 1000); // 1 hour
    }
  };

  useEffect(() => {
    // Check for stored token on app load
    const storedToken = localStorage.getItem("adminToken");
    const storedAdmin = localStorage.getItem("adminData");

    if (storedToken && storedAdmin) {
      setToken(storedToken);
      setAdmin(JSON.parse(storedAdmin));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    resetInactivityTimer();

    const handleActivity = () => resetInactivityTimer();

    // Add event listeners for user activity
    window.addEventListener("mousedown", handleActivity);
    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keypress", handleActivity);
    window.addEventListener("scroll", handleActivity);
    window.addEventListener("touchstart", handleActivity);

    return () => {
      // Cleanup event listeners
      window.removeEventListener("mousedown", handleActivity);
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keypress", handleActivity);
      window.removeEventListener("scroll", handleActivity);
      window.removeEventListener("touchstart", handleActivity);
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
    };
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        throw new Error("Server returned invalid response");
      }

      if (!response.ok) {
        // Handle approval status errors
        if (response.status === 403 && data.status) {
          return { success: false, error: data.error, status: data.status };
        }
        throw new Error(data.error || "Login failed");
      }

      setToken(data.token);
      setAdmin({ ...data.admin, role: data.adminRole || "admin" });

      // Store in localStorage
      localStorage.setItem("adminToken", data.token);
      localStorage.setItem(
        "adminData",
        JSON.stringify({ ...data.admin, role: data.adminRole || "admin" })
      );

      return { success: true, role: data.adminRole || "admin" };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const sendOtp = async (email) => {
    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        let errorMessage = "Failed to send OTP";
        try {
          const data = await response.json();
          errorMessage = data.error || errorMessage;
        } catch {
          try {
            const text = await response.text();
            errorMessage = text || errorMessage;
          } catch {
            // ignore
          }
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const verifyOtp = async (email, otp) => {
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      });

      if (!response.ok) {
        let errorMessage = "OTP verification failed";
        try {
          const data = await response.json();
          errorMessage = data.error || errorMessage;
        } catch {
          try {
            const text = await response.text();
            errorMessage = text || errorMessage;
          } catch {
            // ignore
          }
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (
    name,
    fullName,
    mobileNumber,
    email,
    password,
    city,
    plan,
    termsAgreed
  ) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          fullName,
          mobileNumber,
          email,
          password,
          city,
          plan,
          termsAgreed,
        }),
      });

      if (!response.ok) {
        let errorMessage = "Registration failed";
        try {
          const data = await response.json();
          errorMessage = data.error || errorMessage;
        } catch {
          try {
            const text = await response.text();
            errorMessage = text || errorMessage;
          } catch {
            // ignore
          }
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setToken(null);
    setAdmin(null);
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");
  };

  const isAuthenticated = () => {
    return !!token && !!admin;
  };

  const getAuthHeaders = () => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const value = {
    admin,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
    getAuthHeaders,
    sendOtp,
    verifyOtp,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
