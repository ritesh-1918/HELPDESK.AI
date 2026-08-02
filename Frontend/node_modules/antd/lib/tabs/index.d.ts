import * as React from 'react';
import type { TabsProps as RcTabsProps } from '@rc-component/tabs';
import RcTabs from '@rc-component/tabs';
import type { GetIndicatorSize } from '@rc-component/tabs/lib/hooks/useIndicator';
import type { MoreProps, Tab } from '@rc-component/tabs/lib/interface';
import type { SemanticClassNamesType, SemanticStylesType } from '../_util/hooks';
import type { SizeType } from '../config-provider/SizeContext';
import TabPane from './TabPane';
import type { TabPaneProps } from './TabPane';
export type TabsType = 'line' | 'card' | 'editable-card';
export type TabPosition = 'top' | 'right' | 'bottom' | 'left';
export type TabPlacement = 'top' | 'end' | 'bottom' | 'start';
export type { TabPaneProps };
export type TabsSemanticName = keyof TabsSemanticClassNames & keyof TabsSemanticStyles;
export type TabsSemanticClassNames = {
    root?: string;
    item?: string;
    indicator?: string;
    content?: string;
    header?: string;
};
export type TabsSemanticStyles = {
    root?: React.CSSProperties;
    item?: React.CSSProperties;
    indicator?: React.CSSProperties;
    content?: React.CSSProperties;
    header?: React.CSSProperties;
};
export type TabsClassNamesType = SemanticClassNamesType<TabsProps, TabsSemanticClassNames, {
    popup?: {
        root?: string;
    };
}>;
export type TabsStylesType = SemanticStylesType<TabsProps, TabsSemanticStyles, {
    popup?: {
        root?: React.CSSProperties;
    };
}>;
export interface CompatibilityProps {
    /** @deprecated Please use `destroyOnHidden` instead */
    destroyInactiveTabPane?: boolean;
}
export interface TabsRef {
    nativeElement: React.ComponentRef<typeof RcTabs> | null;
}
export interface BaseTabsProps {
    type?: TabsType;
    size?: SizeType;
    hideAdd?: boolean;
    centered?: boolean;
    className?: string;
    rootClassName?: string;
    classNames?: TabsClassNamesType;
    styles?: TabsStylesType;
    /** @deprecated please use `tabPlacement` instead */
    tabPosition?: TabPosition;
    tabPlacement?: TabPlacement;
    onEdit?: (e: React.MouseEvent | React.KeyboardEvent | string, action: 'add' | 'remove') => void;
    children?: React.ReactNode;
    /** @deprecated Please use `indicator={{ size: ... }}` instead */
    indicatorSize?: GetIndicatorSize;
    items?: (Tab & CompatibilityProps)[];
}
export interface TabsProps extends BaseTabsProps, CompatibilityProps, Omit<RcTabsProps, 'editable' | 'items' | 'classNames' | 'styles' | 'popupClassName'> {
    addIcon?: React.ReactNode;
    moreIcon?: React.ReactNode;
    more?: MoreProps;
    removeIcon?: React.ReactNode;
    styles?: TabsStylesType;
    classNames?: TabsClassNamesType;
    /** @deprecated Please use `classNames.popup` instead */
    popupClassName?: string;
}
declare const InternalTabs: React.ForwardRefExoticComponent<TabsProps & React.RefAttributes<TabsRef>>;
type CompoundedComponent = typeof InternalTabs & {
    TabPane: typeof TabPane;
};
declare const Tabs: CompoundedComponent;
export default Tabs;
