import * as React from 'react';
import type { Orientation, SemanticClassNamesType, SemanticStylesType } from '../_util/hooks';
import type { SizeType } from '../config-provider/SizeContext';
export type TitlePlacement = 'left' | 'right' | 'center' | 'start' | 'end';
export type DividerSemanticName = keyof DividerSemanticClassNames & keyof DividerSemanticStyles;
export type DividerSemanticClassNames = {
    root?: string;
    rail?: string;
    content?: string;
};
export type DividerSemanticStyles = {
    root?: React.CSSProperties;
    rail?: React.CSSProperties;
    content?: React.CSSProperties;
};
export type DividerClassNamesType = SemanticClassNamesType<DividerProps, DividerSemanticClassNames>;
export type DividerStylesType = SemanticStylesType<DividerProps, DividerSemanticStyles>;
export interface DividerProps {
    prefixCls?: string;
    /**  @deprecated please use `orientation`*/
    type?: Orientation;
    orientation?: Orientation;
    vertical?: boolean;
    titlePlacement?: TitlePlacement;
    /** @deprecated please use `styles.content.margin` */
    orientationMargin?: string | number;
    className?: string;
    rootClassName?: string;
    children?: React.ReactNode;
    dashed?: boolean;
    /**
     * @since 5.20.0
     * @default solid
     */
    variant?: 'dashed' | 'dotted' | 'solid';
    style?: React.CSSProperties;
    size?: SizeType;
    plain?: boolean;
    classNames?: DividerClassNamesType;
    styles?: DividerStylesType;
}
declare const Divider: React.FC<DividerProps>;
export default Divider;
