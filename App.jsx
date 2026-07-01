import React from 'react';
import AppRoutes from './Frontend/src/routes/AppRoutes';
import { ThemeProvider } from './Frontend/src/contexts/ThemeContext';
import { MetricsProvider } from './Frontend/src/contexts/MetricsContext';

export default function App({ nonce }) {
  return (
    <MetricsProvider>
      <ThemeProvider>
        <AppRoutes />
      </ThemeProvider>
    </MetricsProvider>
  );
}
