import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props { children: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false, error: null };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[UI/UX Crash Detected in Component]", error.message, errorInfo.componentStack);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#090d18] text-white p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-3xl mb-4">
            ⚠️
          </div>
          <h1 className="text-xl font-bold mb-2">خطا در رندر رابط کاربری (UI/UX)</h1>
          <p className="text-sm text-slate-400 mb-4 max-w-md font-mono text-left bg-black/40 p-3 rounded-xl border border-white/10">
            {this.state.error?.message}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-semibold transition"
          >
            🔄 بارگذاری مجدد رابط کاربری
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
