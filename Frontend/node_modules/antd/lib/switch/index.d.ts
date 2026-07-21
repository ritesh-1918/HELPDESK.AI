import * as React from 'react';
import type { SwitchChangeEventHandler, SwitchClickEventHandler } from '@rc-component/switch';
import type { SemanticClassNamesType, SemanticStylesType } from '../_util/hooks';
export type SwitchSize = 'small' | 'default';
export type { SwitchChangeEventHandler, SwitchClickEventHandler };
export type SwitchSemanticName = keyof SwitchSemanticClassNames & keyof SwitchSemanticStyles;
export type SwitchSemanticClassNames = {
    root?: string;
    content?: string;
    indicator?: string;
};
export type SwitchSemanticStyles = {
    root?: React.CSSProperties;
    content?: React.CSSProperties;
    indicator?: React.CSSProperties;
};
export type SwitchClassNamesType = SemanticClassNamesType<SwitchProps, SwitchSemanticClassNames>;
export type SwitchStylesType = SemanticStylesType<SwitchProps, SwitchSemanticStyles>;
export interface SwitchProps {
    prefixCls?: string;
    size?: SwitchSize;
    className?: string;
    rootClassName?: string;
    checked?: boolean;
    defaultChecked?: boolean;
    /**
     * Alias for `checked`.
     * @since 5.12.0
     */
    value?: boolean;
    /**
     * Alias for `defaultChecked`.
     * @since 5.12.0
     */
    defaultValue?: boolean;
    onChange?: SwitchChangeEventHandler;
    onClick?: SwitchClickEventHandler;
    checkedChildren?: React.ReactNode;
    unCheckedChildren?: React.ReactNode;
    disabled?: boolean;
    loading?: boolean;
    autoFocus?: boolean;
    style?: React.CSSProperties;
    title?: string;
    tabIndex?: number;
    id?: string;
    classNames?: SwitchClassNamesType;
    styles?: SwitchStylesType;
}
declare const InternalSwitch: React.ForwardRefExoticComponent<SwitchProps & React.RefAttributes<HTMLButtonElement>>;
type CompoundedComponent = typeof InternalSwitch & {};
declare const Switch: CompoundedComponent;
export default Switch;
