import { ValueType } from '@rc-component/mini-decimal';
import * as React from 'react';
import { type InputFocusOptions } from '@rc-component/util/lib/Dom/focus';
export type { ValueType };
export interface InputNumberRef extends HTMLInputElement {
    focus: (options?: InputFocusOptions) => void;
    blur: () => void;
    nativeElement: HTMLElement;
}
type SemanticName = 'root' | 'actions' | 'input' | 'action' | 'prefix' | 'suffix';
export interface InputNumberProps<T extends ValueType = ValueType> extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue' | 'onInput' | 'onChange' | 'prefix' | 'suffix' | 'onMouseDown' | 'onClick' | 'onMouseUp' | 'onMouseLeave' | 'onMouseMove' | 'onMouseEnter' | 'onMouseOut'>, Pick<React.HTMLAttributes<HTMLDivElement>, 'onMouseDown' | 'onClick' | 'onMouseUp' | 'onMouseLeave' | 'onMouseMove' | 'onMouseEnter' | 'onMouseOut'> {
    disabled?: boolean;
    readOnly?: boolean;
    /** value will show as string */
    stringMode?: boolean;
    mode?: 'input' | 'spinner';
    defaultValue?: T;
    value?: T | null;
    prefixCls?: string;
    className?: string;
    style?: React.CSSProperties;
    min?: T;
    max?: T;
    step?: ValueType;
    tabIndex?: number;
    controls?: boolean;
    prefix?: React.ReactNode;
    suffix?: React.ReactNode;
    classNames?: Partial<Record<SemanticName, string>>;
    styles?: Partial<Record<SemanticName, React.CSSProperties>>;
    upHandler?: React.ReactNode;
    downHandler?: React.ReactNode;
    keyboard?: boolean;
    changeOnWheel?: boolean;
    /** Parse display value to validate number */
    parser?: (displayValue: string | undefined) => T;
    /** Transform `value` to display value show in input */
    formatter?: (value: T | undefined, info: {
        userTyping: boolean;
        input: string;
    }) => string;
    /** Syntactic sugar of `formatter`. Config precision of display. */
    precision?: number;
    /** Syntactic sugar of `formatter`. Config decimal separator of display. */
    decimalSeparator?: string;
    onInput?: (text: string) => void;
    onChange?: (value: T | null) => void;
    onPressEnter?: React.KeyboardEventHandler<HTMLInputElement>;
    onStep?: (value: T, info: {
        offset: ValueType;
        type: 'up' | 'down';
        emitter: 'handler' | 'keyboard' | 'wheel';
    }) => void;
    /**
     * Trigger change onBlur event.
     * If disabled, user must press enter or click handler to confirm the value update
     */
    changeOnBlur?: boolean;
}
declare const InputNumber: (<T extends ValueType = ValueType>(props: React.PropsWithChildren<InputNumberProps<T>> & {
    ref?: React.Ref<HTMLInputElement>;
}) => React.ReactElement) & {
    displayName?: string;
};
export default InputNumber;
