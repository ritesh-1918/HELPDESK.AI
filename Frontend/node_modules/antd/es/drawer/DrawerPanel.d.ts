import * as React from 'react';
import type { DrawerProps as RCDrawerProps } from '@rc-component/drawer';
import type { DrawerProps } from '.';
import type { ClosableType, SemanticClassNamesType, SemanticStylesType } from '../_util/hooks';
export type DrawerSemanticName = keyof DrawerSemanticClassNames & keyof DrawerSemanticStyles;
export type DrawerSemanticClassNames = {
    root?: string;
    mask?: string;
    header?: string;
    title?: string;
    extra?: string;
    section?: string;
    body?: string;
    footer?: string;
    wrapper?: string;
    dragger?: string;
    close?: string;
    /**
     * @deprecated please use `classNames.section` instead.
     */
    content?: string;
};
export type DrawerSemanticStyles = {
    root?: React.CSSProperties;
    mask?: React.CSSProperties;
    header?: React.CSSProperties;
    title?: React.CSSProperties;
    extra?: React.CSSProperties;
    section?: React.CSSProperties;
    body?: React.CSSProperties;
    footer?: React.CSSProperties;
    wrapper?: React.CSSProperties;
    dragger?: React.CSSProperties;
    close?: React.CSSProperties;
    /**
     * @deprecated please use `styles.section` instead.
     */
    content?: React.CSSProperties;
};
export type DrawerClassNamesType = SemanticClassNamesType<DrawerProps, DrawerSemanticClassNames>;
export type DrawerStylesType = SemanticStylesType<DrawerProps, DrawerSemanticStyles>;
export interface DrawerPanelProps {
    prefixCls: string;
    ariaId?: string;
    title?: React.ReactNode;
    footer?: React.ReactNode;
    extra?: React.ReactNode;
    size?: DrawerProps['size'];
    /**
     * Recommend to use closeIcon instead
     *
     * e.g.
     *
     * `<Drawer closeIcon={false} />`
     */
    closable?: boolean | (Extract<ClosableType, object> & {
        placement?: 'start' | 'end';
    });
    closeIcon?: React.ReactNode;
    onClose?: RCDrawerProps['onClose'];
    children?: React.ReactNode;
    classNames?: DrawerClassNamesType;
    styles?: DrawerStylesType;
    loading?: boolean;
    /** @deprecated Please use `styles.header` instead */
    headerStyle?: React.CSSProperties;
    /** @deprecated Please use `styles.body` instead */
    bodyStyle?: React.CSSProperties;
    /** @deprecated Please use `styles.footer` instead */
    footerStyle?: React.CSSProperties;
    /** @deprecated Please use `styles.wrapper` instead */
    contentWrapperStyle?: React.CSSProperties;
    /** @deprecated Please use `styles.mask` instead */
    maskStyle?: React.CSSProperties;
    /** @deprecated Please use `styles.content` instead */
    drawerStyle?: React.CSSProperties;
}
declare const DrawerPanel: React.FC<DrawerPanelProps>;
export default DrawerPanel;
