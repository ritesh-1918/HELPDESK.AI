import * as React from 'react';
import type { MenuProps as RcMenuProps } from '@rc-component/menu';
import type { AlignType } from '@rc-component/trigger';
import type { SemanticClassNamesType, SemanticStylesType } from '../_util/hooks';
import type { AdjustOverflow } from '../_util/placements';
import type { MenuProps } from '../menu';
declare const _Placements: readonly ["topLeft", "topCenter", "topRight", "bottomLeft", "bottomCenter", "bottomRight", "top", "bottom"];
type Placement = (typeof _Placements)[number];
export type DropdownArrowOptions = {
    pointAtCenter?: boolean;
};
export type DropdownSemanticName = keyof DropdownSemanticClassNames & keyof DropdownSemanticStyles;
export type DropdownSemanticClassNames = {
    root?: string;
    item?: string;
    itemTitle?: string;
    itemIcon?: string;
    itemContent?: string;
};
export type DropdownSemanticStyles = {
    root?: React.CSSProperties;
    item?: React.CSSProperties;
    itemTitle?: React.CSSProperties;
    itemIcon?: React.CSSProperties;
    itemContent?: React.CSSProperties;
};
export type DropdownClassNamesType = SemanticClassNamesType<DropdownProps, DropdownSemanticClassNames>;
export type DropdownStylesType = SemanticStylesType<DropdownProps, DropdownSemanticStyles>;
export interface DropdownProps {
    classNames?: DropdownClassNamesType;
    styles?: DropdownStylesType;
    menu?: MenuProps & {
        activeKey?: RcMenuProps['activeKey'];
    };
    autoFocus?: boolean;
    arrow?: boolean | DropdownArrowOptions;
    trigger?: ('click' | 'hover' | 'contextMenu')[];
    /** @deprecated Please use `popupRender` instead */
    dropdownRender?: (originNode: React.ReactNode) => React.ReactNode;
    popupRender?: (originNode: React.ReactNode) => React.ReactNode;
    onOpenChange?: (open: boolean, info: {
        source: 'trigger' | 'menu';
    }) => void;
    open?: boolean;
    disabled?: boolean;
    /** @deprecated Please use `destroyOnHidden` instead */
    destroyPopupOnHide?: boolean;
    /**
     * @since 5.25.0
     */
    destroyOnHidden?: boolean;
    align?: AlignType;
    getPopupContainer?: (triggerNode: HTMLElement) => HTMLElement;
    prefixCls?: string;
    className?: string;
    rootClassName?: string;
    transitionName?: string;
    placement?: Placement;
    /** @deprecated please use `classNames.root` instead.*/
    overlayClassName?: string;
    /** @deprecated please use `styles.root` instead.*/
    overlayStyle?: React.CSSProperties;
    forceRender?: boolean;
    mouseEnterDelay?: number;
    mouseLeaveDelay?: number;
    openClassName?: string;
    children?: React.ReactNode;
    autoAdjustOverflow?: boolean | AdjustOverflow;
}
type CompoundedComponent = React.FC<DropdownProps> & {
    _InternalPanelDoNotUseOrYouWillBeFired: typeof WrapPurePanel;
};
declare const Dropdown: CompoundedComponent;
declare const WrapPurePanel: React.FC<DropdownProps>;
export default Dropdown;
