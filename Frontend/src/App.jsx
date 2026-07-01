import React from 'react';
import AppRoutes from './routes/AppRoutes';
import { ThemeProvider } from './contexts/ThemeContext';
import { MetricsProvider } from './contexts/MetricsContext';

export default function App({ nonce }) {
  return (
    <MetricsProvider>
      <ThemeProvider>
        <AppRoutes />
      </ThemeProvider>
    </MetricsProvider>
  );
}
