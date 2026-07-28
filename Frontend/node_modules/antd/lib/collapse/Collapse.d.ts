import * as React from 'react';
import type { CollapseProps as RcCollapseProps } from '@rc-component/collapse';
import type { SemanticClassNamesType, SemanticStylesType } from '../_util/hooks';
import type { SizeType } from '../config-provider/SizeContext';
import type { CollapsibleType } from './CollapsePanel';
export type ExpandIconPlacement = 'start' | 'end';
export type CollapseSemanticName = keyof CollapseSemanticClassNames & keyof CollapseSemanticStyles;
export type CollapseSemanticClassNames = {
    root?: string;
    header?: string;
    title?: string;
    body?: string;
    icon?: string;
};
export type CollapseSemanticStyles = {
    root?: React.CSSProperties;
    header?: React.CSSProperties;
    title?: React.CSSProperties;
    body?: React.CSSProperties;
    icon?: React.CSSProperties;
};
export type CollapseClassNamesType = SemanticClassNamesType<CollapseProps, CollapseSemanticClassNames>;
export type CollapseStylesType = SemanticStylesType<CollapseProps, CollapseSemanticStyles>;
export interface CollapseProps extends Pick<RcCollapseProps, 'items'> {
    activeKey?: Array<string | number> | string | number;
    defaultActiveKey?: Array<string | number> | string | number;
    /** 手风琴效果 */
    accordion?: boolean;
    /** @deprecated Please use `destroyOnHidden` instead */
    destroyInactivePanel?: boolean;
    /**
     * @since 5.25.0
     */
    destroyOnHidden?: boolean;
    onChange?: (key: string[]) => void;
    style?: React.CSSProperties;
    className?: string;
    rootClassName?: string;
    bordered?: boolean;
    prefixCls?: string;
    expandIcon?: (panelProps: PanelProps) => React.ReactNode;
    expandIconPlacement?: ExpandIconPlacement;
    /** @deprecated Please use `expandIconPlacement` instead */
    expandIconPosition?: ExpandIconPlacement;
    ghost?: boolean;
    size?: SizeType;
    collapsible?: CollapsibleType;
    /**
     * @deprecated use `items` instead
     */
    children?: React.ReactNode;
    classNames?: CollapseClassNamesType;
    styles?: CollapseStylesType;
}
interface PanelProps {
    isActive?: boolean;
    header?: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    showArrow?: boolean;
    forceRender?: boolean;
    extra?: React.ReactNode;
    collapsible?: CollapsibleType;
    classNames?: CollapseSemanticClassNames;
    styles?: CollapseSemanticStyles;
}
declare const _default: React.ForwardRefExoticComponent<CollapseProps & React.RefAttributes<HTMLDivElement>> & {
    Panel: React.ForwardRefExoticComponent<import("./CollapsePanel").CollapsePanelProps & React.RefAttributes<HTMLDivElement>>;
};
export default _default;
