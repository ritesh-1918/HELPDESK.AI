import * as React from 'react';
import type { SemanticClassNamesType, SemanticStylesType } from '../../_util/hooks';
import type { InputStatus } from '../../_util/statusUtils';
import type { Variant } from '../../config-provider';
import type { SizeType } from '../../config-provider/SizeContext';
export type OTPSemanticClassNames = {
    root?: string;
    input?: string;
    separator?: string;
};
export type OTPSemanticStyles = {
    root?: React.CSSProperties;
    input?: React.CSSProperties;
    separator?: React.CSSProperties;
};
export type OTPClassNamesType = SemanticClassNamesType<OTPProps, OTPSemanticClassNames>;
export type OTPStylesType = SemanticStylesType<OTPProps, OTPSemanticStyles>;
export interface OTPRef {
    focus: VoidFunction;
    blur: VoidFunction;
    nativeElement: HTMLDivElement;
}
export interface OTPProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'onInput'> {
    prefixCls?: string;
    length?: number;
    variant?: Variant;
    rootClassName?: string;
    className?: string;
    style?: React.CSSProperties;
    size?: SizeType;
    defaultValue?: string;
    value?: string;
    onChange?: (value: string) => void;
    formatter?: (value: string) => string;
    separator?: ((index: number) => React.ReactNode) | React.ReactNode;
    disabled?: boolean;
    status?: InputStatus;
    mask?: boolean | string;
    type?: React.HTMLInputTypeAttribute;
    autoComplete?: string;
    onInput?: (value: string[]) => void;
    classNames?: OTPClassNamesType;
    styles?: OTPStylesType;
}
declare const OTP: React.ForwardRefExoticComponent<OTPProps & React.RefAttributes<OTPRef>>;
export default OTP;
