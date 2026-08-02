import * as React from 'react';
export interface ErrorBoundaryProps {
    title?: React.ReactNode;
    /**
     * @deprecated please use `title` instead.
     */
    message?: React.ReactNode;
    description?: React.ReactNode;
    children?: React.ReactNode;
    id?: string;
}
interface ErrorBoundaryStates {
    error?: Error | null;
    info?: {
        componentStack?: string;
    };
}
declare class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryStates> {
    state: {
        error: undefined;
        info: {
            componentStack: string;
        };
    };
    componentDidCatch(error: Error | null, info: object): void;
    render(): React.ReactNode;
}
export default ErrorBoundary;
