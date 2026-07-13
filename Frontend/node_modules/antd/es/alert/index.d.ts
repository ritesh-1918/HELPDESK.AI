import InternalAlert from './Alert';
import ErrorBoundary from './ErrorBoundary';
export type { AlertProps, AlertSemanticType } from './Alert';
export type { ErrorBoundaryProps } from './ErrorBoundary';
type CompoundedComponent = typeof InternalAlert & {
    ErrorBoundary: typeof ErrorBoundary;
};
declare const Alert: CompoundedComponent;
export default Alert;
