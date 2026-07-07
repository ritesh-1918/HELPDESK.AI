import * as React from 'react';
import type { SemanticClassNamesType, SemanticStylesType } from '../_util/hooks';
import type { AnyObject } from '../_util/type';
import type { DropdownProps } from '../dropdown';
import type { BreadcrumbItemProps } from './BreadcrumbItem';
export interface BreadcrumbItemType extends React.AriaAttributes {
    key?: React.Key;
    /**
     * Different with `path`. Directly set the link of this item.
     */
    href?: string;
    /**
     * Different with `href`. It will concat all prev `path` to the current one.
     */
    path?: string;
    title?: React.ReactNode;
    /** @deprecated Please use `title` instead */
    breadcrumbName?: string;
    menu?: BreadcrumbItemProps['menu'];
    className?: string;
    style?: React.CSSProperties;
    dropdownProps?: DropdownProps;
    onClick?: React.MouseEventHandler<HTMLAnchorElement | HTMLSpanElement>;
    /** @deprecated Please use `menu` instead */
    children?: Omit<BreadcrumbItemType, 'children'>[];
    [key: `data-${string}`]: string;
}
export interface BreadcrumbSeparatorType {
    type: 'separator';
    separator?: React.ReactNode;
}
export type ItemType = Partial<BreadcrumbItemType & BreadcrumbSeparatorType>;
export type InternalRouteType = Partial<BreadcrumbItemType & BreadcrumbSeparatorType>;
export type BreadcrumbSemanticName = keyof BreadcrumbSemanticClassNames & keyof BreadcrumbSemanticStyles;
export type BreadcrumbSemanticClassNames = {
    root?: string;
    item?: string;
    separator?: string;
};
export type BreadcrumbSemanticStyles = {
    root?: React.CSSProperties;
    item?: React.CSSProperties;
    separator?: React.CSSProperties;
};
export type BreadcrumbClassNamesType<T extends AnyObject = AnyObject> = SemanticClassNamesType<BreadcrumbProps<T>, BreadcrumbSemanticClassNames>;
export type BreadcrumbStylesType<T extends AnyObject = AnyObject> = SemanticStylesType<BreadcrumbProps<T>, BreadcrumbSemanticStyles>;
export interface BreadcrumbProps<T extends AnyObject = AnyObject> {
    prefixCls?: string;
    params?: T;
    separator?: React.ReactNode;
    dropdownIcon?: React.ReactNode;
    style?: React.CSSProperties;
    className?: string;
    rootClassName?: string;
    children?: React.ReactNode;
    /** @deprecated Please use `items` instead */
    routes?: ItemType[];
    items?: ItemType[];
    classNames?: BreadcrumbClassNamesType<T>;
    styles?: BreadcrumbStylesType<T>;
    itemRender?: (route: ItemType, params: T, routes: ItemType[], paths: string[]) => React.ReactNode;
}
declare const Breadcrumb: {
    <T extends AnyObject = AnyObject>(props: BreadcrumbProps<T>): React.JSX.Element;
    displayName: string;
};
export default Breadcrumb;
