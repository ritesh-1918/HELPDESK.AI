javascript
import React, { lazy, Suspense, Component } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { logger } from './utils/logger';
import { validateRoute } from './utils/routeValidation';
import { ErrorBoundary } from './components/ErrorBoundary';

// Type definitions for route configuration
/** @typedef {'dashboard' | 'admin' | 'profile' | 'tickets' | 'analytics'} RouteName */

/** @type {Object<RouteName, { chunkName: string, importPath: string, skeletonType: string }>} */
const ROUTE_CONFIG = {
  dashboard: {
    chunkName: 'dashboard',
    importPath: './pages/Dashboard',
    skeletonType: 'card'
  },
  admin: {
    chunkName: 'admin-panel',
    importPath: './pages/AdminPanel',
    skeletonType: 'table'
  },
  profile: {
    chunkName: 'user-profile',
    importPath: './pages/UserProfile',
    skeletonType: 'profile'
  },
  tickets: {
    chunkName: 'ticket-view',
    importPath: './pages/TicketView',
    skeletonType: 'table'
  },
  analytics: {
    chunkName: 'analytics',
    importPath: './pages/Analytics',
    skeletonType: 'chart'
  }
};

/**
 * Creates a lazy-loaded component with error handling and logging
 * @param {RouteName} routeName - The route identifier
 * @returns {React.LazyExoticComponent<React.ComponentType>} Lazy loaded component
 */
const createLazyComponent = (routeName) => {
  const config = ROUTE_CONFIG[routeName];
  if (!config) {
    throw new Error(`Invalid route configuration for: ${routeName}`);
  }

  return lazy(() => 
    import(/* webpackChunkName: "[request]" */ `./pages/${config.chunkName}`)
      .catch((err) => {
        logger.error(`Failed to load ${routeName} component`, { 
          error: err,
          chunkName: config.chunkName,
          timestamp: new Date().toISOString()
        });
        throw new Error(`${routeName} component failed to load: ${err.message}`);
      })
  );
};

// Create lazy components for all routes
const LazyComponents = Object.keys(ROUTE_CONFIG).reduce((acc, routeName) => {
  acc[routeName] = createLazyComponent(routeName);
  return acc;
}, {});

/**
 * Skeleton loader component with accessibility and performance optimizations
 */
class SkeletonLoader extends Component {
  static propTypes = {
    type: PropTypes.oneOf(['card', 'table', 'chart', 'profile']),
    ariaLabel: PropTypes.string,
    className: PropTypes.string
  };

  static defaultProps = {
    type: 'card',
    ariaLabel: 'Loading content',
    className: ''
  };

  /** @type {Object<string, Function>} */
  skeletonRenderers = {
    table: () => (
      <div className="skeleton-table" role="status" aria-label="Loading table">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={`row-${i}`} className="skeleton-row" style={{ animationDelay: `${i * 0.1}s` }} />
        ))}
      </div>
    ),
    chart: () => (
      <div className="skeleton-chart" role="status" aria-label="Loading chart">
        {Array.from({ length: 3 }, (_, i) => (
          <div 
            key={`bar-${i}`} 
            className="skeleton-bar" 
            style={{ 
              height: `${60 + Math.random() * 40}%`,
              animationDelay: `${i * 0.15}s` 
            }} 
          />
        ))}
      </div>
    ),
    profile: () => (
      <div className="skeleton-profile" role="status" aria-label="Loading profile">
        <div className="skeleton-avatar" />
        {Array.from({ length: 2 }, (_, i) => (
          <div key={`text-${i}`} className="skeleton-text" style={{ width: `${70 + i * 20}%` }} />
        ))}
      </div>
    ),
    card: () => (
      <div className="skeleton-card" role="status" aria-label="Loading card">
        <div className="skeleton-image" />
        <div className="skeleton-content">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={`line-${i}`} className="skeleton-line" style={{ width: `${80 - i * 20}%` }} />
          ))}
        </div>
      </div>
    )
  };

  shouldComponentUpdate(nextProps) {
    return this.props.type !== nextProps.type || 
           this.props.ariaLabel !== nextProps.ariaLabel;
  }

  render() {
    const { type, ariaLabel, className } = this.props;
    const renderer = this.skeletonRenderers[type] || this.skeletonRenderers.card;

    return (
      <div 
        className={`skeleton-loader ${className}`.trim()}
        aria-busy="true"
        aria-label={ariaLabel}
        role="alert"
      >
        {renderer()}
      </div>
    );
  }
}

/**
 * Route error boundary with comprehensive error handling
 */
class RouteErrorBoundary extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    fallback: PropTypes.node,
    onError: PropTypes.func
  };

  static defaultProps = {
    fallback: null,
    onError: null
  };

  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    
    logger.error('Route error caught', { 
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString()
    });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-boundary" role="alert">
          <div className="error-boundary-content">
            <h2>Something went wrong</h2>
            <p>We encountered an unexpected error. Please try again.</p>
            <div className="error-boundary-actions">
              <button 
                onClick={this.handleRetry}
                className="btn btn-primary"
                aria-label="Refresh page"
              >
                Refresh Page
              </button>
              <button 
                onClick={() => window.history.back()}
                className="btn btn-secondary"
                aria-label="Go back"
              >
                Go Back
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <details className="error-details">
                <summary>Error Details</summary>
                <pre>{this.state.error?.stack}</pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Main App component with authentication and routing
 */
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isAuthenticated: false,
      userRole: null,
      isLoading: true,
      authError: null
    };
  }

  componentDidMount() {
    this.checkAuthentication();
  }

  componentDidCatch(error, errorInfo) {
    logger.error('App component error', {
      error: error.message,
      componentStack: errorInfo?.componentStack
    });
  }

  /**
   * Checks user authentication status
   * @returns {Promise<void>}
   */
  async checkAuthentication() {
    try {
      const token = localStorage.getItem('authToken');
      const userRole = localStorage.getItem('userRole');
      
      if (!token || !userRole) {
        this.setState({ 
          isAuthenticated: false, 
          userRole: null, 
          isLoading: false 
        });
        return;
      }

      // Validate token format
      if (typeof token !== 'string' || token.length < 10) {
        throw new Error('Invalid token format');
      }

      // Validate user role
      const validRoles = ['admin', 'user', 'agent'];
      if (!validRoles.includes(userRole)) {
        throw new Error(`Invalid user role: ${userRole}`);
      }

      this.setState({ 
        isAuthenticated: true, 
        userRole, 
        isLoading: false 
      });
      
      logger.info('User authenticated successfully', { 
        role: userRole,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Authentication check failed', { 
        error: error.message,
        timestamp: new Date().toISOString()
      });
      
      this.setState({ 
        isAuthenticated: false, 
        userRole: null, 
        isLoading: false,
        authError: error.message
      });
    }
  }

  /**
   * Renders route with suspense and error boundary
   * @param {RouteName} routeName - The route identifier
   * @returns {JSX.Element} Route element with boundaries
   */
  renderRouteWithBoundaries(routeName) {
    const config = ROUTE_CONFIG[routeName];
    const Component = LazyComponents[routeName];
    const { isAuthenticated, userRole } = this.state;

    if (!validateRoute(routeName, isAuthenticated, userRole)) {
      logger.warn('Unauthorized route access attempt', { 
        route: routeName, 
        userRole,
        timestamp: new Date().toISOString()
      });
      return <Navigate to="/login" replace />;
    }

    return (
      <Suspense fallback={<SkeletonLoader type={config.skeletonType} />}>
        <RouteErrorBoundary>
          <Component />
        </RouteErrorBoundary>
      </Suspense>
    );
  }

  /**
   * Renders the application header
   * @returns {JSX.Element} Header component
   */
  renderHeader() {
    return (
      <header className="app-header" role="banner">
        <img 
          src="/optimized-logo.webp" 
          alt="HelpDesk.AI Logo" 
          width="150" 
          height="50"
          loading="lazy"
          decoding="async"
          className="app-logo"
        />
        <nav className="app-navigation" role="navigation" aria-label="Main navigation">
          <ul className="nav-list">
            <li><a href="/dashboard">Dashboard</a></li>
            <li><a href="/tickets">Tickets</a></li>
            <li><a href="/analytics">Analytics</a></li>
          </ul>
        </nav>
      </header>
    );
  }

  render() {
    if (this.state.isLoading) {
      return <SkeletonLoader type="card" ariaLabel="Loading application" />;
    }

    return (
      <ErrorBoundary>
        <Router>
          <div className="app" role="application">
            {this.renderHeader()}
            
            <main className="app-main" role="main">
              <Routes>
                {Object.keys(ROUTE_CONFIG).map(routeName => (
                  <Route 
                    key={routeName}
                    path={`/${routeName}`}
                    element={this.renderRouteWithBoundaries(routeName)}
                  />
                ))}
                <Route 
                  path="*" 
                  element={<Navigate to="/dashboard" replace />} 
                />
              </Routes>
            </main>
            
            <footer className="app-footer" role="contentinfo">
              <p>&copy; {new Date().getFullYear()} HelpDesk.AI. All rights reserved.</p>
            </footer>
          </div>
        </Router>
      </ErrorBoundary>
    );
  }
}

App.propTypes = {
  // No props expected for root component
};

export default App;