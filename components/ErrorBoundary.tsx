// FIX: Changed React import to be consistent with the project and resolve typing issues.
import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<Props, State> {
  // FIX: Removed explicit 'public' modifiers to follow convention and avoid potential type inference issues.
  state: State = {
    hasError: false,
    error: undefined,
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-yellow-500/10 border border-yellow-500/30 text-yellow-700 dark:text-yellow-300 rounded-lg shadow-lg text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500" />
          <h1 className="mt-4 text-2xl font-bold">Something went wrong.</h1>
          <p className="mt-2">
            An unexpected error occurred. Please try reloading the page.
          </p>
          <p className="mt-2 text-xs font-mono bg-yellow-100 dark:bg-yellow-900/50 p-2 rounded">
            {this.state.error?.message || 'An unknown error occurred.'}
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;