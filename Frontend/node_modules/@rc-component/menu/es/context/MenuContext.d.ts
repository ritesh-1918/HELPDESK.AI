import * as React from 'react';
import type { CSSMotionProps } from '@rc-component/motion';
import type { BuiltinPlacements, MenuClickEventHandler, MenuMode, RenderIconType, TriggerSubMenuAction, PopupRender } from '../interface';
import { SubMenuProps } from '..';
export interface MenuContextProps {
    prefixCls: string;
    classNames?: SubMenuProps['classNames'];
    styles?: SubMenuProps['styles'];
    rootClassName?: string;
    openKeys: string[];
    rtl?: boolean;
    mode: MenuMode;
    disabled?: boolean;
    overflowDisabled?: boolean;
    activeKey: string;
    onActive: (key: string) => void;
    onInactive: (key: string) => void;
    selectedKeys: string[];
    inlineIndent: number;
    motion?: CSSMotionProps;
    defaultMotions?: Partial<{
        [key in MenuMode | 'other']: CSSMotionProps;
    }>;
    subMenuOpenDelay: number;
    subMenuCloseDelay: number;
    forceSubMenuRender?: boolean;
    builtinPlacements?: BuiltinPlacements;
    triggerSubMenuAction?: TriggerSubMenuAction;
    popupRender?: PopupRender;
    itemIcon?: RenderIconType;
    expandIcon?: RenderIconType;
    onItemClick: MenuClickEventHandler;
    onOpenChange: (key: string, open: boolean) => void;
    getPopupContainer: (node: HTMLElement) => HTMLElement;
}
export declare const MenuContext: React.Context<MenuContextProps>;
export interface InheritableContextProps extends Partial<MenuContextProps> {
    children?: React.ReactNode;
    locked?: boolean;
}
export default function InheritableContextProvider({ children, locked, ...restProps }: InheritableContextProps): React.JSX.Element;
