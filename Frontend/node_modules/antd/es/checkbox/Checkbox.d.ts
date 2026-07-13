import * as React from 'react';
import type { CheckboxRef } from '@rc-component/checkbox';
import type { SemanticClassNamesType, SemanticStylesType } from '../_util/hooks';
export interface AbstractCheckboxProps<T> {
    prefixCls?: string;
    className?: string;
    rootClassName?: string;
    defaultChecked?: boolean;
    checked?: boolean;
    style?: React.CSSProperties;
    disabled?: boolean;
    title?: string;
    onChange?: (e: T) => void;
    onClick?: React.MouseEventHandler<HTMLElement>;
    onMouseEnter?: React.MouseEventHandler<HTMLElement>;
    onMouseLeave?: React.MouseEventHandler<HTMLElement>;
    onKeyPress?: React.KeyboardEventHandler<HTMLElement>;
    onKeyDown?: React.KeyboardEventHandler<HTMLElement>;
    onFocus?: React.FocusEventHandler<HTMLInputElement>;
    onBlur?: React.FocusEventHandler<HTMLInputElement>;
    value?: any;
    tabIndex?: number;
    name?: string;
    children?: React.ReactNode;
    id?: string;
    autoFocus?: boolean;
    type?: string;
    skipGroup?: boolean;
    required?: boolean;
}
export interface CheckboxChangeEventTarget extends CheckboxProps {
    checked: boolean;
}
export interface CheckboxChangeEvent {
    target: CheckboxChangeEventTarget;
    stopPropagation: () => void;
    preventDefault: () => void;
    nativeEvent: MouseEvent;
}
export type CheckboxSemanticName = keyof CheckboxSemanticClassNames & keyof CheckboxSemanticStyles;
export type CheckboxSemanticClassNames = {
    root?: string;
    icon?: string;
    label?: string;
};
export type CheckboxSemanticStyles = {
    root?: React.CSSProperties;
    icon?: React.CSSProperties;
    label?: React.CSSProperties;
};
export type CheckboxClassNamesType = SemanticClassNamesType<CheckboxProps, CheckboxSemanticClassNames>;
export type CheckboxStylesType = SemanticStylesType<CheckboxProps, CheckboxSemanticStyles>;
export interface CheckboxProps extends AbstractCheckboxProps<CheckboxChangeEvent> {
    indeterminate?: boolean;
    classNames?: CheckboxClassNamesType;
    styles?: CheckboxStylesType;
}
declare const Checkbox: React.ForwardRefExoticComponent<CheckboxProps & React.RefAttributes<CheckboxRef>>;
export default Checkbox;
