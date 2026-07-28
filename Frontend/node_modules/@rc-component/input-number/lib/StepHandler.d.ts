import * as React from 'react';
export interface StepHandlerProps {
    prefixCls: string;
    action: 'up' | 'down';
    children?: React.ReactNode;
    disabled?: boolean;
    className?: string;
    style?: React.CSSProperties;
    onStep: (up: boolean, emitter: 'handler' | 'keyboard' | 'wheel') => void;
}
export default function StepHandler({ prefixCls, action, children, disabled, className, style, onStep, }: StepHandlerProps): React.JSX.Element;
