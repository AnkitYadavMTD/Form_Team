function LoadingMessage({ message = "Loading...", className = "" }) {
  return (
    <div className={`loading-message ${className}`}>
      <div className="loading-spinner"></div>
      <h2>{message}</h2>
    </div>
  );
}

export default LoadingMessage;
