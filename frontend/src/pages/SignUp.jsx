import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./SignUp.css";

const OTPModal = ({ email, onVerify, onClose, error, loading }) => {
  const [otp, setOtp] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length === 6) {
      await onVerify(email, otp);
    }
  };

  return (
    <div className="otp-modal-overlay">
      <div className="otp-modal">
        <div className="otp-modal-header">
          <h3>Verify Your Email</h3>
          <button onClick={onClose} className="close-btn">
            &times;
          </button>
        </div>
        <div className="otp-modal-body">
          <p>
            We've sent a 6-digit OTP to <strong>{email}</strong>
          </p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="otp">Enter OTP</label>
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="000000"
                maxLength="6"
                required
                className="form-input otp-input"
              />
            </div>
            {error && <div className="error-message">{error}</div>}
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="verify-btn"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

function SignUp() {
  const [searchParams] = useSearchParams();
  const [companyName, setCompanyName] = useState("");
  const [yourName, setYourName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [city, setCity] = useState("");
  const [plan, setPlan] = useState("Free Demo Plan (15 Days)");
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);

  const { register, sendOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const planParam = searchParams.get("plan");
    if (planParam) {
      const planMap = {
        bronze: "BRONZE - ₹499/30 Days",
        silver: "SILVER - ₹1499/90 Days",
        gold: "GOLD - ₹2999/150 Days",
        platinum: "PLATINUM - ₹4999/365 Days",
      };
      const selectedPlan = planMap[planParam.toLowerCase()];
      if (selectedPlan) {
        setPlan(selectedPlan);
      }
    }
  }, [searchParams]);

  const handleSendOtp = async () => {
    setError("");
    setOtpError("");

    if (
      !companyName ||
      !yourName ||
      !mobileNumber ||
      !email ||
      !password ||
      !city ||
      !plan ||
      !termsAgreed
    ) {
      setError("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      const result = await sendOtp(email);
      if (result.success) {
        setShowOtpModal(true);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (email, otp) => {
    setOtpError("");
    setOtpLoading(true);

    try {
      const result = await verifyOtp(email, otp);
      if (result.success) {
        // OTP verified, now register the user
        const registerResult = await register(
          companyName,
          yourName,
          mobileNumber,
          email,
          password,
          city,
          plan,
          termsAgreed
        );

        if (registerResult.success) {
          setShowOtpModal(false);
          navigate("/thanks");
        } else {
          setOtpError(
            registerResult.error || "Registration failed. Please try again."
          );
        }
      } else {
        setOtpError(result.error);
      }
    } catch (err) {
      setOtpError("Failed to verify OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleCloseOtpModal = () => {
    setShowOtpModal(false);
    setOtpError("");
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-header">
          <h2>Admin Sign Up</h2>
          <p>Create your admin account</p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendOtp();
          }}
          className="signup-form"
        >
          {/* Company Name Field */}
          <div className="form-group">
            <label htmlFor="companyName">Company Name (Firm Name)</label>
            <input
              id="companyName"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Enter company or firm name"
              required
              className="form-input"
            />
          </div>

          {/* Your Name Field */}
          <div className="form-group">
            <label htmlFor="yourName">Your Name</label>
            <input
              id="yourName"
              type="text"
              value={yourName}
              onChange={(e) => setYourName(e.target.value)}
              placeholder="Enter your name"
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="mobileNumber">Mobile Number</label>
            <input
              id="mobileNumber"
              type="tel"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              placeholder="Enter mobile number"
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="city">City Name</label>
            <input
              id="city"
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter city"
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="plan">Select Plan</label>
            <select
              id="plan"
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              required
              className="form-input"
            >
              <option value="Free Demo Plan (15 Days)">
                Free Demo Plan (15 Days)
              </option>
              <option value="BRONZE - ₹499/30 Days">
                BRONZE - ₹499/30 Days
              </option>
              <option value="SILVER - ₹1499/90 Days">
                SILVER - ₹1499/90 Days
              </option>
              <option value="GOLD - ₹2999/150 Days">
                GOLD - ₹2999/150 Days
              </option>
              <option value="PLATINUM - ₹4999/365 Days">
                PLATINUM - ₹4999/365 Days
              </option>
            </select>
          </div>

          <div className="form-group" style={{ marginTop: "10px" }}>
            <label
              htmlFor="terms"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              <input
                id="terms"
                type="checkbox"
                checked={termsAgreed}
                onChange={(e) => setTermsAgreed(e.target.checked)}
                required
                style={{
                  width: "18px",
                  height: "18px",
                  cursor: "pointer",
                  accentColor: "#007bff",
                }}
              />
              <span>
                I agree to the{" "}
                <a
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "#007bff",
                    textDecoration: "underline",
                    cursor: "pointer",
                  }}
                >
                  terms and conditions
                </a>
              </span>
            </label>
          </div>

          <button type="submit" disabled={loading} className="signup-btn">
            {loading ? (
              <>
                <span className="spinner"></span>
                Creating Account...
              </>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {showOtpModal && (
          <OTPModal
            email={email}
            onVerify={handleVerifyOtp}
            onClose={handleCloseOtpModal}
            error={otpError}
            loading={otpLoading}
          />
        )}

        <div className="signup-footer">
          <p>
            Already have an account?{" "}
            <Link to="/signin" className="signin-link">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
