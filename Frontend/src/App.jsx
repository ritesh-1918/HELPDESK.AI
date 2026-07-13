import React from 'react';
import AppRoutes from './routes/AppRoutes';
import { ThemeProvider } from './contexts/ThemeContext';
import { MetricsProvider } from './contexts/MetricsContext';
import useTabSync from './hooks/useTabSync';
export default function App({ nonce }) {
  useTabSync();
  return (
    <MetricsProvider>
      <ThemeProvider>
        <AppRoutes />
      </ThemeProvider>
    </MetricsProvider>
  );
}
