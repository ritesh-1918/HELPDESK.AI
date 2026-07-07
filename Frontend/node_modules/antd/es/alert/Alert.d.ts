import * as React from 'react';
import type { ClosableType, SemanticType } from '../_util/hooks';
export interface AlertRef {
    nativeElement: HTMLDivElement;
}
export type AlertSemanticType = {
    classNames: {
        root?: string;
        icon?: string;
        section?: string;
        title?: string;
        description?: string;
        actions?: string;
        close?: string;
    };
    styles: {
        root?: React.CSSProperties;
        icon?: React.CSSProperties;
        section?: React.CSSProperties;
        title?: React.CSSProperties;
        description?: React.CSSProperties;
        actions?: React.CSSProperties;
        close?: React.CSSProperties;
    };
};
export type AlertClassNamesType = SemanticType<AlertProps, AlertSemanticType['classNames']>;
export type AlertStylesType = SemanticType<AlertProps, AlertSemanticType['styles']>;
export interface AlertProps {
    /** Type of Alert styles, options:`success`, `info`, `warning`, `error` */
    type?: 'success' | 'info' | 'warning' | 'error';
    /** Whether Alert can be closed */
    closable?: boolean | (Exclude<ClosableType, boolean> & {
        /** Callback when close Alert */
        onClose?: React.MouseEventHandler<HTMLButtonElement>;
    });
    /**
     * @deprecated please use `closable.closeIcon` instead.
     * Close text to show
     */
    closeText?: React.ReactNode;
    /** Content of Alert */
    title?: React.ReactNode;
    /**
     * @deprecated please use `title` instead.
     */
    message?: React.ReactNode;
    /** Additional content of Alert */
    description?: React.ReactNode;
    /**
     * @deprecated please use `closable.onClose` instead.
     */
    onClose?: React.MouseEventHandler<HTMLButtonElement>;
    /** Trigger when animation ending of Alert */
    /**
     * @deprecated please use `closable.afterClose` instead.
     */
    afterClose?: () => void;
    /** Whether to show icon */
    showIcon?: boolean;
    /** https://www.w3.org/TR/2014/REC-html5-20141028/dom.html#aria-role-attribute */
    role?: string;
    style?: React.CSSProperties;
    prefixCls?: string;
    className?: string;
    classNames?: AlertClassNamesType;
    styles?: AlertStylesType;
    rootClassName?: string;
    banner?: boolean;
    icon?: React.ReactNode;
    /**
     * @deprecated please use `closable.closeIcon` instead.
     */
    closeIcon?: React.ReactNode;
    action?: React.ReactNode;
    onMouseEnter?: React.MouseEventHandler<HTMLDivElement>;
    onMouseLeave?: React.MouseEventHandler<HTMLDivElement>;
    onClick?: React.MouseEventHandler<HTMLDivElement>;
    id?: string;
}
declare const Alert: React.ForwardRefExoticComponent<AlertProps & React.RefAttributes<AlertRef>>;
export default Alert;
