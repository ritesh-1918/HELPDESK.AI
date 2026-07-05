import type { CSSMotionProps } from '@rc-component/motion';
import * as React from 'react';
export interface MaskProps {
    prefixCls: string;
    open?: boolean;
    zIndex?: number;
    mask?: boolean;
    motion?: CSSMotionProps;
    mobile?: boolean;
}
export default function Mask(props: MaskProps): React.JSX.Element;
