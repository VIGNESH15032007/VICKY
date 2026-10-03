import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback({
          error: this.state.error,
          resetErrorBoundary: this.handleReset,
        });
      }

      return (
        <div className="w-full p-6 my-4 rounded-2xl bg-surface-container-high border border-error/40 shadow-xl flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-error-container/30 text-error flex items-center justify-center mb-3">
            <span className="material-symbols-outlined text-[28px]">warning</span>
          </div>
          <h3 className="text-base font-bold text-on-surface">Telemetry Display Warning</h3>
          <p className="text-xs text-on-surface-variant max-w-md mt-1 mb-4 leading-relaxed">
            {this.state.error?.message || 'A display rendering error occurred. The application remains running.'}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={this.handleReset}
              className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-md hover:bg-primary/90 transition"
            >
              Retry Display
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-xl bg-surface-container text-xs text-on-surface font-semibold hover:bg-surface-container-highest transition"
            >
              Refresh View
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
