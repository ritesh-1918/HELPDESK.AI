import * as React from 'react';
export type SwitchChangeEventHandler = (checked: boolean, event: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>) => void;
export type SwitchClickEventHandler = SwitchChangeEventHandler;
interface SwitchProps extends Omit<React.HTMLAttributes<HTMLButtonElement>, 'onChange' | 'onClick'> {
    className?: string;
    prefixCls?: string;
    disabled?: boolean;
    checkedChildren?: React.ReactNode;
    unCheckedChildren?: React.ReactNode;
    onChange?: SwitchChangeEventHandler;
    onKeyDown?: React.KeyboardEventHandler<HTMLButtonElement>;
    onClick?: SwitchClickEventHandler;
    tabIndex?: number;
    checked?: boolean;
    defaultChecked?: boolean;
    loadingIcon?: React.ReactNode;
    style?: React.CSSProperties;
    title?: string;
    styles?: {
        content?: React.CSSProperties;
    };
    classNames?: {
        content?: string;
    };
}
declare const Switch: React.ForwardRefExoticComponent<SwitchProps & React.RefAttributes<HTMLButtonElement>>;
export default Switch;
