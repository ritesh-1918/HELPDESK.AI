import React from 'react';
import type { PosInfo } from './hooks/useTarget';
import type { SemanticName, TourProps } from './interface';
export interface MaskProps {
    prefixCls?: string;
    pos: PosInfo;
    rootClassName?: string;
    showMask?: boolean;
    style?: React.CSSProperties;
    fill?: string;
    open?: boolean;
    animated?: boolean | {
        placeholder: boolean;
    };
    zIndex?: number;
    disabledInteraction?: boolean;
    classNames?: Partial<Record<SemanticName, string>>;
    styles?: Partial<Record<SemanticName, React.CSSProperties>>;
    getPopupContainer?: TourProps['getPopupContainer'];
    onEsc?: (info: {
        top: boolean;
        event: KeyboardEvent;
    }) => void;
}
declare const Mask: React.FC<MaskProps>;
export default Mask;
