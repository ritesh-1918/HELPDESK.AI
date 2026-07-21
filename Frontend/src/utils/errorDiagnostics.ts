import { ErrorInfo } from 'react';

type DiagnosticPayload = {
  message: string;
  stack: string | null;
  componentStack: string | null;
  userAgent: string | null;
  url: string | null;
  timestamp: string;
};

export const buildErrorPayload = (error: Error, errorInfo?: ErrorInfo | null) => {
  const payload: DiagnosticPayload = {
    message: error.message,
    stack: error.stack ?? null,
    componentStack: errorInfo?.componentStack ?? null,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
    url: typeof window !== 'undefined' ? window.location.href : null,
    timestamp: new Date().toISOString(),
  };

  return JSON.stringify(payload, null, 2);
};

export const copyErrorPayload = async (payload: string) => {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(payload);
      return true;
    }

    if (typeof document === 'undefined') {
      return false;
    }

    const textArea = document.createElement('textarea');
    textArea.value = payload;
    textArea.setAttribute('readonly', 'true');
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    const copied = document.execCommand('copy');
    document.body.removeChild(textArea);
    return copied;
  } catch (error) {
    console.error('[error-boundary] Failed to copy diagnostic payload', error);
    return false;
  }
};
