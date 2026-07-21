import * as React from 'react';
import { List, useWatch } from '@rc-component/form';
import type { FormProps as RcFormProps } from '@rc-component/form/lib/Form';
import type { FormRef } from '@rc-component/form/lib/interface';
import type { SemanticClassNamesType, SemanticStylesType } from '../_util/hooks';
import type { Variant } from '../config-provider';
import type { SizeType } from '../config-provider/SizeContext';
import type { ColProps } from '../grid/col';
import type { FeedbackIcons } from './FormItem';
import type { FormTooltipProps } from './FormItemLabel';
import useForm from './hooks/useForm';
import type { FormInstance } from './hooks/useForm';
import type { FormLabelAlign, ScrollFocusOptions } from './interface';
export type RequiredMark = boolean | 'optional' | ((labelNode: React.ReactNode, info: {
    required: boolean;
}) => React.ReactNode);
export type FormLayout = 'horizontal' | 'inline' | 'vertical';
export type FormItemLayout = 'horizontal' | 'vertical';
export type { ScrollFocusOptions };
export type FormSemanticName = keyof FormSemanticClassNames & keyof FormSemanticStyles;
export type FormSemanticClassNames = {
    root?: string;
    label?: string;
    content?: string;
};
export type FormSemanticStyles = {
    root?: React.CSSProperties;
    label?: React.CSSProperties;
    content?: React.CSSProperties;
};
export type FormClassNamesType = SemanticClassNamesType<FormProps, FormSemanticClassNames>;
export type FormStylesType = SemanticStylesType<FormProps, FormSemanticStyles>;
export interface FormProps<Values = any> extends Omit<RcFormProps<Values>, 'form'> {
    classNames?: FormClassNamesType;
    styles?: FormStylesType;
    prefixCls?: string;
    colon?: boolean;
    name?: string;
    layout?: FormLayout;
    labelAlign?: FormLabelAlign;
    labelWrap?: boolean;
    labelCol?: ColProps;
    wrapperCol?: ColProps;
    form?: FormInstance<Values>;
    feedbackIcons?: FeedbackIcons;
    size?: SizeType;
    disabled?: boolean;
    scrollToFirstError?: ScrollFocusOptions | boolean;
    requiredMark?: RequiredMark;
    rootClassName?: string;
    variant?: Variant;
    tooltip?: FormTooltipProps;
}
declare const Form: (<Values = any>(props: React.PropsWithChildren<FormProps<Values>> & React.RefAttributes<FormRef<Values>>) => React.ReactElement) & Pick<React.FC, "displayName">;
export { type FormInstance, List, useForm, useWatch };
export default Form;
