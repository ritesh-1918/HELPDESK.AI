import * as React from 'react';
import type { HTMLAriaDataAttributes } from '../_util/aria-data-attrs';
import type { SemanticClassNamesType, SemanticStylesType } from '../_util/hooks';
export declare const IconMap: {
    success: React.ForwardRefExoticComponent<Omit<import("@ant-design/icons/lib/components/AntdIcon").AntdIconProps, "ref"> & React.RefAttributes<HTMLSpanElement>>;
    error: React.ForwardRefExoticComponent<Omit<import("@ant-design/icons/lib/components/AntdIcon").AntdIconProps, "ref"> & React.RefAttributes<HTMLSpanElement>>;
    info: React.ForwardRefExoticComponent<Omit<import("@ant-design/icons/lib/components/AntdIcon").AntdIconProps, "ref"> & React.RefAttributes<HTMLSpanElement>>;
    warning: React.ForwardRefExoticComponent<Omit<import("@ant-design/icons/lib/components/AntdIcon").AntdIconProps, "ref"> & React.RefAttributes<HTMLSpanElement>>;
};
export declare const ExceptionMap: {
    '404': React.FC<{}>;
    '500': React.FC<{}>;
    '403': React.FC<{}>;
};
export type ExceptionStatusType = 403 | 404 | 500 | '403' | '404' | '500';
export type ResultStatusType = ExceptionStatusType | keyof typeof IconMap;
export type ResultSemanticName = keyof ResultSemanticClassNames & keyof ResultSemanticStyles;
export type ResultSemanticClassNames = {
    root?: string;
    title?: string;
    subTitle?: string;
    body?: string;
    extra?: string;
    icon?: string;
};
export type ResultSemanticStyles = {
    root?: React.CSSProperties;
    title?: React.CSSProperties;
    subTitle?: React.CSSProperties;
    body?: React.CSSProperties;
    extra?: React.CSSProperties;
    icon?: React.CSSProperties;
};
export type ResultClassNamesType = SemanticClassNamesType<ResultProps, ResultSemanticClassNames>;
export type ResultStylesType = SemanticStylesType<ResultProps, ResultSemanticStyles>;
export interface ResultProps extends HTMLAriaDataAttributes {
    icon?: React.ReactNode;
    status?: ResultStatusType;
    title?: React.ReactNode;
    subTitle?: React.ReactNode;
    extra?: React.ReactNode;
    prefixCls?: string;
    className?: string;
    rootClassName?: string;
    style?: React.CSSProperties;
    children?: React.ReactNode;
    classNames?: ResultClassNamesType;
    styles?: ResultStylesType;
}
export interface ResultType extends React.FC<ResultProps> {
    PRESENTED_IMAGE_404: React.FC;
    PRESENTED_IMAGE_403: React.FC;
    PRESENTED_IMAGE_500: React.FC;
}
declare const Result: ResultType;
export default Result;
