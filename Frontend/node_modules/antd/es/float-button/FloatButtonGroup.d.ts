import React from 'react';
import type { SemanticClassNamesType, SemanticStylesType } from '../_util/hooks';
import type { FloatButtonGroupTrigger, FloatButtonProps } from './FloatButton';
export type FloatButtonGroupSemanticName = keyof FloatButtonGroupSemanticClassNames & keyof FloatButtonGroupSemanticStyles;
export type FloatButtonGroupSemanticClassNames = {
    root?: string;
    list?: string;
    item?: string;
    itemIcon?: string;
    itemContent?: string;
    trigger?: string;
    triggerIcon?: string;
    triggerContent?: string;
};
export type FloatButtonGroupSemanticStyles = {
    root?: React.CSSProperties;
    list?: React.CSSProperties;
    item?: React.CSSProperties;
    itemIcon?: React.CSSProperties;
    itemContent?: React.CSSProperties;
    trigger?: React.CSSProperties;
    triggerIcon?: React.CSSProperties;
    triggerContent?: React.CSSProperties;
};
export type FloatButtonGroupClassNamesType = SemanticClassNamesType<FloatButtonGroupProps, FloatButtonGroupSemanticClassNames>;
export type FloatButtonGroupStylesType = SemanticStylesType<FloatButtonGroupProps, FloatButtonGroupSemanticStyles>;
export interface FloatButtonGroupProps extends Omit<FloatButtonProps, 'classNames' | 'styles'> {
    classNames?: FloatButtonGroupClassNamesType;
    styles?: FloatButtonGroupStylesType;
    trigger?: FloatButtonGroupTrigger;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    closeIcon?: React.ReactNode;
    children: React.ReactNode;
    placement?: 'top' | 'left' | 'right' | 'bottom';
}
declare const FloatButtonGroup: React.FC<Readonly<FloatButtonGroupProps>>;
export default FloatButtonGroup;
