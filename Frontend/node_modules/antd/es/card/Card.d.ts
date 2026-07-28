import * as React from 'react';
import type { Tab, TabBarExtraContent } from '@rc-component/tabs/lib/interface';
import type { SemanticClassNamesType, SemanticStylesType } from '../_util/hooks';
import type { TabsProps } from '../tabs';
export type CardType = 'inner';
export type CardSize = 'default' | 'small';
export interface CardTabListType extends Omit<Tab, 'label'> {
    key: string;
    /** @deprecated Please use `label` instead */
    tab?: React.ReactNode;
    label?: React.ReactNode;
}
export type CardSemanticName = keyof CardSemanticClassNames & keyof CardSemanticStyles;
export type CardSemanticClassNames = {
    root?: string;
    header?: string;
    body?: string;
    extra?: string;
    title?: string;
    actions?: string;
    cover?: string;
};
export type CardSemanticStyles = {
    root?: React.CSSProperties;
    header?: React.CSSProperties;
    body?: React.CSSProperties;
    extra?: React.CSSProperties;
    title?: React.CSSProperties;
    actions?: React.CSSProperties;
    cover?: React.CSSProperties;
};
export type CardClassNamesType = SemanticClassNamesType<CardProps, CardSemanticClassNames>;
export type CardStylesType = SemanticStylesType<CardProps, CardSemanticStyles>;
export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
    prefixCls?: string;
    title?: React.ReactNode;
    extra?: React.ReactNode;
    /** @deprecated Please use `variant` instead */
    bordered?: boolean;
    /** @deprecated Please use `styles.header` instead */
    headStyle?: React.CSSProperties;
    /** @deprecated Please use `styles.body` instead */
    bodyStyle?: React.CSSProperties;
    style?: React.CSSProperties;
    loading?: boolean;
    hoverable?: boolean;
    children?: React.ReactNode;
    id?: string;
    className?: string;
    rootClassName?: string;
    size?: CardSize;
    type?: CardType;
    cover?: React.ReactNode;
    actions?: React.ReactNode[];
    tabList?: CardTabListType[];
    tabBarExtraContent?: TabBarExtraContent;
    onTabChange?: (key: string) => void;
    activeTabKey?: string;
    defaultActiveTabKey?: string;
    tabProps?: TabsProps;
    classNames?: CardClassNamesType;
    styles?: CardStylesType;
    variant?: 'borderless' | 'outlined';
}
declare const Card: React.ForwardRefExoticComponent<CardProps & React.RefAttributes<HTMLDivElement>>;
export default Card;
