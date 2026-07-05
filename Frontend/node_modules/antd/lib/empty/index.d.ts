import * as React from 'react';
import type { SemanticClassNamesType, SemanticStylesType } from '../_util/hooks';
export interface TransferLocale {
    description: string;
}
export type EmptySemanticName = keyof EmptySemanticClassNames & keyof EmptySemanticStyles;
export type EmptySemanticClassNames = {
    root?: string;
    image?: string;
    description?: string;
    footer?: string;
};
export type EmptySemanticStyles = {
    root?: React.CSSProperties;
    image?: React.CSSProperties;
    description?: React.CSSProperties;
    footer?: React.CSSProperties;
};
export type EmptyClassNamesType = SemanticClassNamesType<EmptyProps, EmptySemanticClassNames>;
export type EmptyStylesType = SemanticStylesType<EmptyProps, EmptySemanticStyles>;
export type SemanticName = EmptySemanticName;
export interface EmptyProps {
    prefixCls?: string;
    className?: string;
    rootClassName?: string;
    style?: React.CSSProperties;
    /** @deprecated Please use `styles.image` instead */
    imageStyle?: React.CSSProperties;
    image?: React.ReactNode;
    description?: React.ReactNode;
    children?: React.ReactNode;
    classNames?: EmptyClassNamesType;
    styles?: EmptyStylesType;
}
type CompoundedComponent = React.FC<EmptyProps> & {
    PRESENTED_IMAGE_DEFAULT: React.ReactNode;
    PRESENTED_IMAGE_SIMPLE: React.ReactNode;
};
declare const Empty: CompoundedComponent;
export default Empty;
