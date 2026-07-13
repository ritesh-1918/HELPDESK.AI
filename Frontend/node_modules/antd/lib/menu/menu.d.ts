import * as React from 'react';
import type { MenuProps as RcMenuProps, MenuRef as RcMenuRef } from '@rc-component/menu';
import type { SiderContextProps } from '../layout/Sider';
import type { TooltipProps } from '../tooltip';
import type { ItemType } from './interface';
import type { MenuTheme } from './MenuContext';
export type MenuSemanticName = keyof MenuSemanticClassNames & keyof MenuSemanticStyles;
export type MenuSemanticClassNames = {
    root?: string;
    itemTitle?: string;
    list?: string;
    item?: string;
    itemIcon?: string;
    itemContent?: string;
};
export type MenuSemanticStyles = {
    root?: React.CSSProperties;
    itemTitle?: React.CSSProperties;
    list?: React.CSSProperties;
    item?: React.CSSProperties;
    itemIcon?: React.CSSProperties;
    itemContent?: React.CSSProperties;
};
export type SubMenuSemanticName = keyof SubMenuSemanticClassNames & keyof SubMenuSemanticStyles;
export type SubMenuSemanticClassNames = {
    item?: string;
    itemTitle?: string;
    list?: string;
    itemContent?: string;
    itemIcon?: string;
};
export type SubMenuSemanticStyles = {
    item?: React.CSSProperties;
    itemTitle?: React.CSSProperties;
    list?: React.CSSProperties;
    itemContent?: React.CSSProperties;
    itemIcon?: React.CSSProperties;
};
export type MenuPopupSemanticName = keyof MenuPopupSemanticClassNames & keyof MenuPopupSemanticStyles;
export type MenuPopupSemanticClassNames = {
    root?: string;
};
export type MenuPopupSemanticStyles = {
    root?: React.CSSProperties;
};
type MenuClassNamesSchemaType = MenuSemanticClassNames & {
    popup?: MenuPopupSemanticClassNames | string;
    subMenu?: SubMenuSemanticClassNames;
};
type MenuStylesSchemaType = MenuSemanticStyles & {
    popup?: MenuPopupSemanticStyles | React.CSSProperties;
    subMenu?: SubMenuSemanticStyles;
};
export type MenuClassNamesType = MenuClassNamesSchemaType | ((info: {
    props: MenuProps;
}) => MenuClassNamesSchemaType);
export type MenuStylesType = MenuStylesSchemaType | ((info: {
    props: MenuProps;
}) => MenuStylesSchemaType);
export interface MenuProps extends Omit<RcMenuProps, 'items' | '_internalComponents' | 'classNames' | 'styles' | 'activeKey' | 'defaultActiveFirst'> {
    theme?: MenuTheme;
    inlineIndent?: number;
    tooltip?: false | TooltipProps;
    /**
     * @private Internal Usage. Not promise crash if used in production. Connect with chenshuai2144
     *   for removing.
     * @deprecated Will be removed in next version. Use `tooltip={false}` instead.
     */
    _internalDisableMenuItemTitleTooltip?: boolean;
    items?: ItemType[];
    classNames?: MenuClassNamesType;
    styles?: MenuStylesType;
}
declare const InternalMenu: React.ForwardRefExoticComponent<MenuProps & SiderContextProps & {
    collapsedWidth?: string | number;
} & React.RefAttributes<RcMenuRef>>;
export default InternalMenu;
