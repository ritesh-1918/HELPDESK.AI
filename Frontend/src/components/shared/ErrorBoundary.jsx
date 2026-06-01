/**
 * Error Boundary Component
 * Catches unhandled errors and shows a stylized error page with diagnostic export.
 */

import React, { Component } from 'react';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: null,
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        const errorId = `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        this.setState({ errorInfo, errorId });

        // Log to console for development
        console.error('[ErrorBoundary] Caught error:', error);
        console.error('[ErrorBoundary] Error info:', errorInfo);

        // In production, you could send to error tracking service
        if (process.env.NODE_ENV === 'production') {
            this.logErrorToService(error, errorInfo, errorId);
        }
    }

    logErrorToService = (error, errorInfo, errorId) => {
        // TODO: Integrate with error tracking service (Sentry, LogRocket, etc.)
        console.log('[ErrorBoundary] Would send to error service:', {
            errorId,
            message: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
        });
    };

    handleCopyError = () => {
        const { error, errorInfo, errorId } = this.state;
        const errorPayload = {
            errorId,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            error: {
                message: error?.message,
                stack: error?.stack,
            },
            componentStack: errorInfo?.componentStack,
        };

        const errorText = JSON.stringify(errorPayload, null, 2);

        navigator.clipboard.writeText(errorText).then(() => {
            alert('Error details copied to clipboard!');
        }).catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = errorText;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert('Error details copied to clipboard!');
        });
    };

    handleReload = () => {
        window.location.reload();
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        const { hasError, error, errorInfo, errorId } = this.state;
        const { children, fallback } = this.props;

        if (hasError) {
            // Custom fallback if provided
            if (fallback) {
                return fallback(error, errorInfo, this.handleReload);
            }

            // Default error UI
            return (
                <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
                    <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-red-500 to-pink-500 p-6">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-white">Oops! Something went wrong</h1>
                                    <p className="text-white/80 mt-1">We encountered an unexpected error</p>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* Error ID */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Error ID</p>
                                        <p className="text-lg font-mono text-gray-800">{errorId}</p>
                                    </div>
                                    <button
                                        onClick={this.handleCopyError}
                                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                        </svg>
                                        <span>Copy Error</span>
                                    </button>
                                </div>
                            </div>

                            {/* Error Message */}
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-2">Error Message</h3>
                                <p className="text-gray-800 bg-red-50 p-3 rounded-lg font-mono text-sm">
                                    {error?.message || 'Unknown error'}
                                </p>
                            </div>

                            {/* Helpful Tips */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h3 className="text-sm font-medium text-blue-800 mb-2">What you can do:</h3>
                                <ul className="text-sm text-blue-700 space-y-1">
                                    <li>• Try refreshing the page</li>
                                    <li>• Clear your browser cache</li>
                                    <li>• If the problem persists, copy the error details and contact support</li>
                                </ul>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex space-x-3">
                                <button
                                    onClick={this.handleReload}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center space-x-2"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    <span>Refresh Page</span>
                                </button>
                                <button
                                    onClick={this.handleGoHome}
                                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                    <span>Go Home</span>
                                </button>
                            </div>

                            {/* Development Details */}
                            {process.env.NODE_ENV === 'development' && errorInfo && (
                                <details className="mt-4">
                                    <summary className="cursor-pointer text-sm font-medium text-gray-500 hover:text-gray-700">
                                        Technical Details (Development Only)
                                    </summary>
                                    <div className="mt-3 p-4 bg-gray-900 rounded-lg overflow-auto max-h-64">
                                        <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">
                                            {error?.stack}
                                            {'\n\nComponent Stack:'}
                                            {errorInfo?.componentStack}
                                        </pre>
                                    </div>
                                </details>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        return children;
    }
}

export default ErrorBoundary;

/**
 * Hook to use error boundary programmatically
 */
export const useErrorBoundary = () => {
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
        if (error) {
            throw error;
        }
    }, [error]);

    const captureError = React.useCallback((error) => {
        setError(error);
    }, []);

    return { captureError };
};
