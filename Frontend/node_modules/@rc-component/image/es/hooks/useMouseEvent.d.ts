import type React from 'react';
import type { DispatchZoomChangeFunc, TransformType, UpdateTransformFunc } from './useImageTransform';
export default function useMouseEvent(imgRef: React.MutableRefObject<HTMLImageElement>, movable: boolean, open: boolean, scaleStep: number, transform: TransformType, updateTransform: UpdateTransformFunc, dispatchZoomChange: DispatchZoomChangeFunc): {
    isMoving: boolean;
    onMouseDown: React.MouseEventHandler<HTMLDivElement>;
    onMouseMove: (event: MouseEvent) => void;
    onMouseUp: () => void;
    onWheel: (event: React.WheelEvent<HTMLImageElement>) => void;
};
