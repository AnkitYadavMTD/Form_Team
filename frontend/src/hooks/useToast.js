import { useState, useCallback } from "react";

let toastId = 0;

function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success", duration = 3000) => {
    const id = ++toastId;
    const toast = { id, message, type, duration };

    setToasts((prevToasts) => [...prevToasts, toast]);

    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  const showSuccess = useCallback(
    (message, duration) => addToast(message, "success", duration),
    [addToast]
  );

  const showError = useCallback(
    (message, duration) => addToast(message, "error", duration),
    [addToast]
  );

  const showWarning = useCallback(
    (message, duration) => addToast(message, "warning", duration),
    [addToast]
  );

  const showInfo = useCallback(
    (message, duration) => addToast(message, "info", duration),
    [addToast]
  );

  return {
    toasts,
    addToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
}

export default useToast;
