import { Component } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[ErrorBoundary]", error, errorInfo.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-danger/10 flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-danger" />
            </div>
            <h1 className="heading-2 text-dark mb-3">Something went wrong</h1>
            <p className="body-default text-gray mb-8">
              The application encountered an unexpected error. Please try refreshing the page.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center gap-2 px-6 py-3 gradient-primary text-white rounded-[12px] body-small font-medium hover:shadow-glow transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 border border-gray-lighter text-dark rounded-[12px] body-small font-medium hover:bg-background transition-all"
              >
                Refresh Page
              </button>
            </div>
            {this.state.error && (
              <details className="mt-8 text-left">
                <summary className="caption text-gray cursor-pointer hover:text-dark">
                  Error details
                </summary>
                <pre className="mt-2 p-4 bg-card rounded-[12px] border border-gray-lighter caption text-danger overflow-x-auto">
                  {this.state.error.message}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
