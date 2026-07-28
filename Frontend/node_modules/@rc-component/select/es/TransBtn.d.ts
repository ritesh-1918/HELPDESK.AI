import * as React from 'react';
import type { RenderNode } from './BaseSelect';
export interface TransBtnProps {
    className: string;
    style?: React.CSSProperties;
    customizeIcon: RenderNode;
    customizeIconProps?: any;
    onMouseDown?: React.MouseEventHandler<HTMLSpanElement>;
    onClick?: React.MouseEventHandler<HTMLSpanElement>;
    children?: React.ReactNode;
}
/**
 * Small wrapper for Select icons (clear/arrow/etc.).
 * Prevents default mousedown to avoid blurring or caret moves, and
 * renders a custom icon or a fallback icon span.
 *
 * DOM structure:
 * <span className={className} ...>
 *   { icon || <span className={`${className}-icon`}>{children}</span> }
 * </span>
 */
declare const TransBtn: React.FC<TransBtnProps>;
export default TransBtn;
