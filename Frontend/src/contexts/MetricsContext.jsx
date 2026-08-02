import React, { createContext, useContext, useRef, useCallback } from 'react';

/**
 * MetricsContext — provides a decoupled way to track application metrics 
 * without triggering React re-renders, solving page reload latency.
 */
const MetricsContext = createContext(undefined);

export function MetricsProvider({ children }) {
  // Use a ref instead of state so tracking metrics does not cause re-renders.
  const metricsRef = useRef({
    pageViews: 0,
    apiLatency: [],
    events: [],
  });

  const trackMetric = useCallback((key, value) => {
    const currentMetrics = metricsRef.current;
    
    if (Array.isArray(currentMetrics[key])) {
      currentMetrics[key].push(value);
    } else {
      currentMetrics[key] = value;
    }
  }, []);

  const getMetrics = useCallback(() => {
    return metricsRef.current;
  }, []);

  // Value is completely stable and will never cause children to re-render.
  const value = { trackMetric, getMetrics };

  return (
    <MetricsContext.Provider value={value}>
      {children}
    </MetricsContext.Provider>
  );
}

export function useMetrics() {
  const context = useContext(MetricsContext);
  if (context === undefined) {
    throw new Error('useMetrics must be used within a MetricsProvider');
  }
  return context;
}
