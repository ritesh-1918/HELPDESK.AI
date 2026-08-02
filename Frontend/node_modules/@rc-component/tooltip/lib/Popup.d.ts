import * as React from 'react';
import type { TooltipProps } from './Tooltip';
export interface ContentProps {
    prefixCls?: string;
    children: (() => React.ReactNode) | React.ReactNode;
    id?: string;
    classNames?: TooltipProps['classNames'];
    styles?: TooltipProps['styles'];
    className?: string;
    style?: React.CSSProperties;
}
declare const Popup: React.FC<ContentProps>;
export default Popup;
