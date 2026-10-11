import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    try {
      window.localStorage.removeItem('stockPortfolioApp_v1');
    } catch (e) {
      // ignore
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#111827] border border-rose-900/50 rounded-2xl p-8 shadow-2xl text-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-950/60 border border-rose-800/50 flex items-center justify-center mx-auto mb-5 text-rose-400">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Something Went Wrong</h2>
            <p className="text-sm text-slate-400 mb-6">
              An unexpected UI runtime error occurred. Your saved portfolio data in browser storage is safe.
            </p>
            <div className="p-3 bg-[#0B0F19] border border-rose-950 rounded-lg text-xs font-mono text-rose-300 text-left mb-6 overflow-x-auto max-h-32">
              {this.state.error?.message || 'Unknown Application Error'}
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleReload}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold text-sm transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Application
              </button>
              <button
                onClick={this.handleReset}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#1E293B] hover:bg-[#28384E] text-slate-300 text-xs transition-colors"
              >
                Reset Local Storage & Reload
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
