import * as React from 'react';
import type { TextAreaProps as RcTextAreaProps, TextAreaRef as RcTextAreaRef } from '@rc-component/textarea';
import type { SemanticClassNamesType, SemanticStylesType } from '../_util/hooks';
import type { InputStatus } from '../_util/statusUtils';
import type { Variant } from '../config-provider';
import type { SizeType } from '../config-provider/SizeContext';
import type { InputFocusOptions } from './Input';
export type TextAreaSemanticName = keyof TextAreaSemanticClassNames & keyof TextAreaSemanticStyles;
export type TextAreaSemanticClassNames = {
    root?: string;
    textarea?: string;
    count?: string;
};
export type TextAreaSemanticStyles = {
    root?: React.CSSProperties;
    textarea?: React.CSSProperties;
    count?: React.CSSProperties;
};
export type TextAreaClassNamesType = SemanticClassNamesType<TextAreaProps, TextAreaSemanticClassNames>;
export type TextAreaStylesType = SemanticStylesType<TextAreaProps, TextAreaSemanticStyles>;
export interface TextAreaProps extends Omit<RcTextAreaProps, 'suffix' | 'classNames' | 'styles'> {
    /** @deprecated Use `variant` instead */
    bordered?: boolean;
    size?: SizeType;
    status?: InputStatus;
    rootClassName?: string;
    /**
     * @since 5.13.0
     * @default "outlined"
     */
    variant?: Variant;
    classNames?: TextAreaClassNamesType;
    styles?: TextAreaStylesType;
}
export interface TextAreaRef {
    focus: (options?: InputFocusOptions) => void;
    blur: () => void;
    resizableTextArea?: RcTextAreaRef['resizableTextArea'];
    nativeElement: HTMLElement | null;
}
declare const TextArea: React.ForwardRefExoticComponent<TextAreaProps & React.RefAttributes<TextAreaRef>>;
export default TextArea;
