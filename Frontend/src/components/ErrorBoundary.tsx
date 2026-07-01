import React, { ErrorInfo, ReactNode } from 'react';
import { buildErrorPayload, copyErrorPayload } from '../utils/errorDiagnostics';

type ErrorBoundaryProps = {
  children: ReactNode;
  title?: string;
  description?: string;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  copied: boolean;
};

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
    copied: false,
  };

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      copied: false,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    console.error('[error-boundary] Unhandled application error', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      copied: false,
    });
  };

  handleCopy = async () => {
    const { error, errorInfo } = this.state;

    if (!error) {
      return;
    }

    const payload = buildErrorPayload(error, errorInfo);
    const copied = await copyErrorPayload(payload);
    this.setState({ copied });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const payload = this.state.error
      ? buildErrorPayload(this.state.error, this.state.errorInfo)
      : null;

    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          padding: '24px',
          background: 'radial-gradient(circle at top, #ffe7c2 0%, #f6f1e8 45%, #efe6d6 100%)',
          color: '#1d1d1b',
          fontFamily: 'Georgia, "Times New Roman", serif',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '760px',
            borderRadius: '28px',
            overflow: 'hidden',
            boxShadow: '0 30px 80px rgba(60, 42, 20, 0.16)',
            border: '1px solid rgba(69, 50, 31, 0.12)',
            background: 'rgba(255,255,255,0.86)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div
            style={{
              padding: '18px 24px',
              background: 'linear-gradient(135deg, #a63f14, #d97706)',
              color: '#fff7ed',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontSize: '12px',
              fontWeight: 700,
            }}
          >
            Application Recovery
          </div>

          <div style={{ padding: '32px 24px' }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#9a3412', fontWeight: 700 }}>
              Something went wrong
            </p>
            <h1 style={{ margin: '10px 0 12px', fontSize: 'clamp(2rem, 4vw, 3.4rem)', lineHeight: 1.05 }}>
              {this.props.title ?? 'We hit an unexpected error.'}
            </h1>
            <p style={{ margin: 0, maxWidth: '60ch', fontSize: '16px', lineHeight: 1.7, color: '#44403c' }}>
              {this.props.description ??
                'The page crashed before it could finish rendering. You can retry immediately or copy the diagnostic payload and share it with support for faster investigation.'}
            </p>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '24px' }}>
              <button
                type="button"
                onClick={this.handleRetry}
                style={{
                  border: 'none',
                  borderRadius: '999px',
                  background: '#1f2937',
                  color: '#fff',
                  padding: '12px 18px',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Retry page
              </button>
              <button
                type="button"
                onClick={this.handleCopy}
                style={{
                  borderRadius: '999px',
                  background: 'transparent',
                  color: '#9a3412',
                  padding: '12px 18px',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: '1px solid rgba(154, 52, 18, 0.24)',
                }}
              >
                {this.state.copied ? 'Copied payload' : 'Copy error payload'}
              </button>
            </div>

            {payload ? (
              <pre
                style={{
                  marginTop: '24px',
                  padding: '18px',
                  borderRadius: '18px',
                  background: '#1c1917',
                  color: '#fed7aa',
                  overflowX: 'auto',
                  fontSize: '12px',
                  lineHeight: 1.55,
                }}
              >
                {payload}
              </pre>
            ) : null}
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
