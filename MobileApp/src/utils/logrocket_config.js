// LogRocket Privacy Masking Configuration
import LogRocket from 'logrocket';

export const initLogRocket = () => {
    LogRocket.init('helpdesk-ai/mobile-app', {
        shouldCaptureIP: false,
        network: {
            requestSanitizer: (request) => {
                request.headers['Authorization'] = null;
                return request;
            }
        }
    });
};
