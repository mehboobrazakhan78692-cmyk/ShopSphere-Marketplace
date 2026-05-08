import React from 'react';

class ErrorBoundary extends React.Component {
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

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          height: '100vh', 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          textAlign: 'center',
          padding: '20px',
          fontFamily: 'Inter, sans-serif'
        }}>
          <h1 style={{ color: '#ff4d4f' }}>Oops! Something went wrong.</h1>
          <p style={{ color: '#555', marginBottom: '20px' }}>
            We've encountered an unexpected error. Please try refreshing the page.
          </p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#f90',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Refresh Page
          </button>
          {process.env.NODE_ENV !== 'production' && (
            <details style={{ marginTop: '20px', textAlign: 'left', maxWidth: '80%', overflow: 'auto' }}>
              <summary>Error Details</summary>
              <pre style={{ fontSize: '12px', background: '#f5f5f5', padding: '10px' }}>
                {this.state.error && this.state.error.toString()}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
