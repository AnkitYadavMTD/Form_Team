function ErrorMessage({ message, icon = "❌" }) {
  if (!message) return null;

  return (
    <div className="error-message">
      <span className="error-icon">{icon}</span>
      <span>{message}</span>
    </div>
  );
}

export default ErrorMessage;
