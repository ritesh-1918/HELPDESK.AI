import * as React from 'react';
import type { PresetColorType } from '../_util/colors';
import type { SemanticClassNamesType, SemanticStylesType } from '../_util/hooks';
import type { LiteralUnion } from '../_util/type';
type RibbonPlacement = 'start' | 'end';
export type RibbonSemanticName = keyof RibbonSemanticClassNames & keyof RibbonSemanticStyles;
export type RibbonSemanticClassNames = {
    root?: string;
    content?: string;
    indicator?: string;
};
export type RibbonSemanticStyles = {
    root?: React.CSSProperties;
    content?: React.CSSProperties;
    indicator?: React.CSSProperties;
};
export type RibbonClassNamesType = SemanticClassNamesType<RibbonProps, RibbonSemanticClassNames>;
export type RibbonStylesType = SemanticStylesType<RibbonProps, RibbonSemanticStyles>;
export interface RibbonProps {
    className?: string;
    prefixCls?: string;
    style?: React.CSSProperties;
    text?: React.ReactNode;
    color?: LiteralUnion<PresetColorType>;
    children?: React.ReactNode;
    placement?: RibbonPlacement;
    rootClassName?: string;
    classNames?: RibbonClassNamesType;
    styles?: RibbonStylesType;
}
declare const Ribbon: React.FC<RibbonProps>;
export default Ribbon;
