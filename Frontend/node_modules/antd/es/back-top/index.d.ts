import React from 'react';
export interface BackTopProps {
    visibilityHeight?: number;
    onClick?: React.MouseEventHandler<HTMLElement>;
    target?: () => HTMLElement | Window | Document;
    prefixCls?: string;
    className?: string;
    rootClassName?: string;
    style?: React.CSSProperties;
    duration?: number;
}
/**
 * @deprecated Please use `FloatButton.BackTop` instead.
 */
declare const BackTop: React.FC<React.PropsWithChildren<BackTopProps>>;
export default BackTop;
