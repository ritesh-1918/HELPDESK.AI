import React from 'react';
import type { CSSMotionProps } from '@rc-component/motion';
import type { AlignType, ArrowPos } from '../interface';
export interface UniqueContainerProps {
    prefixCls: string;
    isMobile: boolean;
    ready: boolean;
    open: boolean;
    align: AlignType;
    offsetR: number;
    offsetB: number;
    offsetX: number;
    offsetY: number;
    arrowPos?: ArrowPos;
    popupSize?: {
        width: number;
        height: number;
    };
    motion?: CSSMotionProps;
    uniqueContainerClassName?: string;
    uniqueContainerStyle?: React.CSSProperties;
}
declare const UniqueContainer: (props: UniqueContainerProps) => React.JSX.Element;
export default UniqueContainer;
