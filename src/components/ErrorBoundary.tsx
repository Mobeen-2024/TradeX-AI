import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props { children: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[TradeX ErrorBoundary]", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center font-mono">
          <div className="border border-red-500/40 bg-red-950/20 p-8 rounded max-w-lg text-center font-mono">
            <div className="text-red-400 text-4xl mb-4">⚠</div>
            <h2 className="text-red-400 text-xl font-bold mb-2">System Fault Detected</h2>
            <p className="text-gray-400 text-sm mb-4">{this.state.error?.message}</p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="bg-red-500/20 border border-red-500/40 text-red-400 px-4 py-2 rounded text-sm hover:bg-red-500/30 transition-colors cursor-pointer"
            >
              Attempt Recovery
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
