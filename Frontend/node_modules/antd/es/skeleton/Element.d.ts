import * as React from 'react';
export type ElementSemanticName = keyof ElementSemanticClassNames & keyof ElementSemanticStyles;
export type ElementSemanticClassNames = {
    root?: string;
    content?: string;
};
export type ElementSemanticStyles = {
    root?: React.CSSProperties;
    content?: React.CSSProperties;
};
export interface SkeletonElementProps {
    prefixCls?: string;
    className?: string;
    rootClassName?: string;
    style?: React.CSSProperties;
    size?: 'large' | 'small' | 'default' | number;
    shape?: 'circle' | 'square' | 'round' | 'default';
    active?: boolean;
    classNames?: ElementSemanticClassNames;
    styles?: ElementSemanticStyles;
}
declare const Element: React.FC<SkeletonElementProps>;
export default Element;
