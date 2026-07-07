import * as React from 'react';
import type { Placement } from '../Drawer';
export interface UseDragOptions {
    prefixCls: string;
    direction: Placement;
    className?: string;
    style?: React.CSSProperties;
    maxSize?: number;
    containerRef?: React.RefObject<HTMLElement>;
    currentSize?: number | string;
    onResize?: (size: number) => void;
    onResizeEnd?: (size: number) => void;
    onResizeStart?: (size: number) => void;
}
export interface UseDragReturn {
    dragElementProps: {
        className: string;
        style: React.CSSProperties;
        onMouseDown: (e: React.MouseEvent) => void;
    };
    isDragging: boolean;
}
export default function useDrag(options: UseDragOptions): UseDragReturn;
