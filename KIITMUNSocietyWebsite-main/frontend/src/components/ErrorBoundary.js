'use client';

import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-lg font-bold text-red-800 mb-2">Something went wrong</h2>
          <details className="text-sm text-red-700">
            <summary>Error Details</summary>
            <pre className="mt-2 whitespace-pre-wrap">{this.state.error?.toString()}</pre>
            {this.state.errorInfo?.componentStack && (
              <pre className="mt-2 whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
            )}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
