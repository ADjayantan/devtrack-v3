import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="card max-w-md w-full text-center">
            <p className="font-mono text-red-400 text-sm mb-2">// runtime error</p>
            <h2 className="text-white font-bold text-lg mb-3">Something crashed</h2>
            <p className="text-slate-400 text-sm mb-1 font-mono">
              {this.state.error?.message || 'Unknown error'}
            </p>
            <p className="text-slate-600 text-xs mb-6">
              This has been noted. Reload to continue.
            </p>
            <button
              className="btn-primary"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
