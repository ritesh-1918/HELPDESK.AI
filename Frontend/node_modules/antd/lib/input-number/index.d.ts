import * as React from 'react';
import type { InputNumberProps as RcInputNumberProps, InputNumberRef as RcInputNumberRef, ValueType } from '@rc-component/input-number';
import type { SemanticClassNamesType, SemanticStylesType } from '../_util/hooks';
import type { InputStatus } from '../_util/statusUtils';
import type { Variant } from '../config-provider';
import type { SizeType } from '../config-provider/SizeContext';
export type InputNumberSemanticName = keyof InputNumberSemanticClassNames & keyof InputNumberSemanticStyles;
export type InputNumberSemanticClassNames = {
    root?: string;
    prefix?: string;
    suffix?: string;
    input?: string;
    actions?: string;
};
export type InputNumberSemanticStyles = {
    root?: React.CSSProperties;
    prefix?: React.CSSProperties;
    suffix?: React.CSSProperties;
    input?: React.CSSProperties;
    actions?: React.CSSProperties;
};
export type InputNumberClassNamesType<T extends ValueType = ValueType> = SemanticClassNamesType<InputNumberProps<T>, InputNumberSemanticClassNames>;
export type InputNumberStylesType<T extends ValueType = ValueType> = SemanticStylesType<InputNumberProps<T>, InputNumberSemanticStyles>;
export interface InputNumberProps<T extends ValueType = ValueType> extends Omit<RcInputNumberProps<T>, 'prefix' | 'size' | 'controls' | 'classNames' | 'styles'> {
    prefixCls?: string;
    rootClassName?: string;
    classNames?: InputNumberClassNamesType;
    styles?: InputNumberStylesType;
    /**
     * @deprecated Use `Space.Compact` instead.
     *
     * @example
     * ```tsx
     * import { Space, InputNumber } from 'antd';
     *
     * <Space.Compact>
     *   {addon}
     *   <InputNumber defaultValue={1} />
     * </Space.Compact>
     * ```
     */
    addonBefore?: React.ReactNode;
    /**
     * @deprecated Use `Space.Compact` instead.
     *
     * @example
     * ```tsx
     * import { Space, InputNumber } from 'antd';
     *
     * <Space.Compact>
     *   <InputNumber defaultValue={1} />
     *   {addon}
     * </Space.Compact>
     * ```
     */
    addonAfter?: React.ReactNode;
    prefix?: React.ReactNode;
    suffix?: React.ReactNode;
    size?: SizeType;
    disabled?: boolean;
    /** @deprecated Use `variant` instead. */
    bordered?: boolean;
    status?: InputStatus;
    controls?: boolean | {
        upIcon?: React.ReactNode;
        downIcon?: React.ReactNode;
    };
    /**
     * @since 5.13.0
     * @default "outlined"
     */
    variant?: Variant;
}
declare const TypedInputNumber: (<T extends ValueType = ValueType>(props: React.PropsWithChildren<InputNumberProps<T>> & React.RefAttributes<RcInputNumberRef>) => React.ReactElement) & {
    displayName?: string;
    _InternalPanelDoNotUseOrYouWillBeFired: typeof PureInputNumber;
};
/** @private Internal Component. Do not use in your production. */
declare const PureInputNumber: React.FC<InputNumberProps>;
export default TypedInputNumber;
