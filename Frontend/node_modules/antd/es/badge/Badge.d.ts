import * as React from 'react';
import type { PresetStatusColorType } from '../_util/colors';
import type { SemanticClassNamesType, SemanticStylesType } from '../_util/hooks';
import type { LiteralUnion } from '../_util/type';
import type { PresetColorKey } from '../theme/internal';
export type BadgeSemanticName = keyof BadgeSemanticClassNames & keyof BadgeSemanticStyles;
export type BadgeSemanticClassNames = {
    root?: string;
    indicator?: string;
};
export type BadgeSemanticStyles = {
    root?: React.CSSProperties;
    indicator?: React.CSSProperties;
};
export type BadgeClassNamesType = SemanticClassNamesType<BadgeProps, BadgeSemanticClassNames>;
export type BadgeStylesType = SemanticStylesType<BadgeProps, BadgeSemanticStyles>;
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    /** Number to show in badge */
    count?: React.ReactNode;
    showZero?: boolean;
    /** Max count to show */
    overflowCount?: number;
    /** Whether to show red dot without number */
    dot?: boolean;
    style?: React.CSSProperties;
    prefixCls?: string;
    scrollNumberPrefixCls?: string;
    className?: string;
    rootClassName?: string;
    status?: PresetStatusColorType;
    color?: LiteralUnion<PresetColorKey>;
    text?: React.ReactNode;
    size?: 'default' | 'small';
    offset?: [number | string, number | string];
    title?: string;
    children?: React.ReactNode;
    classNames?: BadgeClassNamesType;
    styles?: BadgeStylesType;
}
declare const Badge: React.ForwardRefExoticComponent<BadgeProps & React.RefAttributes<HTMLSpanElement>>;
export default Badge;
