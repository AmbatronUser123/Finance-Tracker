import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Bisa log ke service eksternal di sini
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 text-red-800 p-8">
          <h1 className="text-2xl font-bold mb-4">Terjadi Kesalahan</h1>
          <p className="mb-2">Aplikasi mengalami error tak terduga.</p>
          <pre className="bg-red-100 rounded p-2 text-xs overflow-x-auto max-w-xl">{this.state.error?.message}</pre>
          <button onClick={() => window.location.reload()} className="mt-6 px-4 py-2 bg-red-600 text-white rounded-lg">Muat Ulang Aplikasi</button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary; 