import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Thanks.css";

const Thanks = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto redirect to signin after 5 seconds
    const timer = setTimeout(() => {
      navigate("/signin");
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="thanks-container">
      <div className="thanks-content">
        <div className="thanks-icon">
          <i className="fas fa-check-circle"></i>
        </div>
        <h1>Thank You!</h1>
        <p>Your account has been created successfully.</p>
        <p className="activation-message">
          Your account is pending approval. Please wait for admin approval
          before signing in.
        </p>
        <p className="redirect-message">
          You will be redirected to the sign-in page in 5 seconds.
        </p>
        <button className="signin-btn" onClick={() => navigate("/signin")}>
          Sign In Now
        </button>
      </div>
    </div>
  );
};

export default Thanks;
