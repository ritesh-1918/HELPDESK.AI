import * as React from 'react';
import type { NoticeProps } from '@rc-component/notification/lib/Notice';
import type { SemanticClassNamesType, SemanticStylesType } from '../_util/hooks';
import type { IconType, NotificationSemanticClassNames, NotificationSemanticStyles } from './interface';
export type PurePanelClassNamesType = SemanticClassNamesType<PurePanelProps, NotificationSemanticClassNames>;
export type PurePanelStylesType = SemanticStylesType<PurePanelProps, NotificationSemanticStyles>;
export declare const TypeIcon: {
    info: React.JSX.Element;
    success: React.JSX.Element;
    error: React.JSX.Element;
    warning: React.JSX.Element;
    loading: React.JSX.Element;
};
export declare function getCloseIcon(prefixCls: string, closeIcon?: React.ReactNode): React.ReactNode;
export interface PureContentProps {
    prefixCls: string;
    icon?: React.ReactNode;
    /** @deprecated Please use `title` instead */
    message?: React.ReactNode;
    title?: React.ReactNode;
    description?: React.ReactNode;
    /** @deprecated Please use `actions` instead */
    btn?: React.ReactNode;
    actions?: React.ReactNode;
    type?: IconType;
    role?: 'alert' | 'status';
    classNames: NotificationSemanticClassNames;
    styles: NotificationSemanticStyles;
}
export declare const PureContent: React.FC<PureContentProps>;
export interface PurePanelProps extends Omit<NoticeProps, 'prefixCls' | 'eventKey' | 'classNames' | 'styles'>, Omit<PureContentProps, 'prefixCls' | 'children' | 'classNames' | 'styles'> {
    prefixCls?: string;
    classNames?: PurePanelClassNamesType;
    styles?: PurePanelStylesType;
    closeIcon?: React.ReactNode;
}
/** @private Internal Component. Do not use in your production. */
declare const PurePanel: React.FC<PurePanelProps>;
export default PurePanel;
