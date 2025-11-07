import { useLoading } from "../contexts/LoadingContext";
import LoadingMessage from "./LoadingMessage";

function GlobalLoader() {
  const { globalLoading } = useLoading();

  if (!globalLoading) return null;

  return (
    <div className="global-loader-overlay">
      <LoadingMessage message="Loading..." />
    </div>
  );
}

export default GlobalLoader;
