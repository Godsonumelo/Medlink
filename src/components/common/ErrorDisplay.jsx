import { AlertTriangle, RefreshCw } from "lucide-react";

export default function ErrorDisplay({ message, onRetry, fullScreen = false }) {
  const content = (
    <div className="flex flex-col items-center text-center p-8">
      <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center mb-4">
        <AlertTriangle className="w-8 h-8 text-danger" />
      </div>
      <h3 className="heading-4 text-dark mb-2">Something went wrong</h3>
      <p className="body-small text-gray mb-6 max-w-sm">
        {message || "An unexpected error occurred. Please try again."}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-6 py-3 gradient-primary text-white rounded-[12px] body-small font-medium hover:shadow-glow transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        {content}
      </div>
    );
  }

  return content;
}
