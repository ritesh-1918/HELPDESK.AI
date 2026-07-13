import * as React from 'react';
export interface InputProps {
    id?: string;
    readOnly?: boolean;
    value?: string;
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
    onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
    onFocus?: React.FocusEventHandler<HTMLInputElement>;
    onBlur?: React.FocusEventHandler<HTMLInputElement>;
    placeholder?: string;
    className?: string;
    style?: React.CSSProperties;
    maxLength?: number;
    /** width always match content width */
    syncWidth?: boolean;
    /** autoComplete for input */
    autoComplete?: string;
}
declare const Input: React.ForwardRefExoticComponent<InputProps & React.RefAttributes<HTMLInputElement>>;
export default Input;
