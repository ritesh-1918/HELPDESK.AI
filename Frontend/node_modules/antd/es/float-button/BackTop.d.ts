import React from 'react';
import type { FloatButtonElement, FloatButtonProps, FloatButtonRef } from './FloatButton';
export interface BackTopProps extends Omit<FloatButtonProps, 'target'> {
    visibilityHeight?: number;
    onClick?: React.MouseEventHandler<FloatButtonElement>;
    target?: () => HTMLElement | Window | Document;
    prefixCls?: string;
    children?: React.ReactNode;
    className?: string;
    rootClassName?: string;
    style?: React.CSSProperties;
    duration?: number;
}
declare const BackTop: React.ForwardRefExoticComponent<BackTopProps & React.RefAttributes<FloatButtonRef>>;
export default BackTop;
