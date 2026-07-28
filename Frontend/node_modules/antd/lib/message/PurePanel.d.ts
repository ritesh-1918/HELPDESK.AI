import * as React from 'react';
import type { NoticeProps } from '@rc-component/notification/lib/Notice';
import type { ArgsClassNamesType, ArgsStylesType, MessageSemanticClassNames, MessageSemanticStyles, NoticeType } from './interface';
export declare const TypeIcon: {
    info: React.JSX.Element;
    success: React.JSX.Element;
    error: React.JSX.Element;
    warning: React.JSX.Element;
    loading: React.JSX.Element;
};
export interface PureContentProps {
    prefixCls: string;
    type?: NoticeType;
    icon?: React.ReactNode;
    classNames?: MessageSemanticClassNames;
    styles?: MessageSemanticStyles;
}
export declare const PureContent: React.FC<React.PropsWithChildren<PureContentProps>>;
export interface PurePanelProps extends Omit<NoticeProps, 'prefixCls' | 'eventKey' | 'classNames' | 'styles'>, Omit<PureContentProps, 'prefixCls' | 'children' | 'classNames' | 'styles'> {
    prefixCls?: string;
    classNames?: ArgsClassNamesType;
    styles?: ArgsStylesType;
}
/** @private Internal Component. Do not use in your production. */
declare const PurePanel: React.FC<PurePanelProps>;
export default PurePanel;
