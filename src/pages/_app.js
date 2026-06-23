// _app.js - Optimized to call initializeApp only once

import { useEffect } from 'react';
import { initializeApp, isInitialized } from '../lib/initializers';

function MyApp({ Component, pageProps }) {
    useEffect(() => {
        // Only initialize if not already done (prevents duplicate calls during rehydration)
        if (!isInitialized()) {
            initializeApp().catch((error) => {
                console.error('Failed to initialize app:', error);
            });
        }
    }, []);

    return <Component {...pageProps} />;
}

export default MyApp;
