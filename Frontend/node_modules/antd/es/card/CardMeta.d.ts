import * as React from 'react';
import type { SemanticClassNamesType, SemanticStylesType } from '../_util/hooks';
export type CardMetaSemanticName = keyof CardMetaSemanticClassNames & keyof CardMetaSemanticStyles;
export type CardMetaSemanticClassNames = {
    root?: string;
    section?: string;
    avatar?: string;
    title?: string;
    description?: string;
};
export type CardMetaSemanticStyles = {
    root?: React.CSSProperties;
    section?: React.CSSProperties;
    avatar?: React.CSSProperties;
    title?: React.CSSProperties;
    description?: React.CSSProperties;
};
export type CardMetaClassNamesType = SemanticClassNamesType<CardMetaProps, CardMetaSemanticClassNames>;
export type CardMetaStylesType = SemanticStylesType<CardMetaProps, CardMetaSemanticStyles>;
export interface CardMetaProps {
    prefixCls?: string;
    style?: React.CSSProperties;
    className?: string;
    avatar?: React.ReactNode;
    title?: React.ReactNode;
    description?: React.ReactNode;
    classNames?: CardMetaClassNamesType;
    styles?: CardMetaStylesType;
}
declare const CardMeta: React.FC<CardMetaProps>;
export default CardMeta;
