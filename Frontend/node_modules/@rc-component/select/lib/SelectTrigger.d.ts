import type { AlignType, BuildInPlacements } from '@rc-component/trigger/lib/interface';
import * as React from 'react';
import type { Placement, RenderDOMFunc } from './BaseSelect';
export interface RefTriggerProps {
    getPopupElement: () => HTMLDivElement;
}
export interface SelectTriggerProps {
    prefixCls: string;
    children: React.ReactElement;
    disabled: boolean;
    visible: boolean;
    popupElement: React.ReactElement;
    animation?: string;
    transitionName?: string;
    placement?: Placement;
    builtinPlacements?: BuildInPlacements;
    popupStyle: React.CSSProperties;
    popupClassName: string;
    direction: string;
    popupMatchSelectWidth?: boolean | number;
    popupRender?: (menu: React.ReactElement) => React.ReactElement;
    getPopupContainer?: RenderDOMFunc;
    popupAlign: AlignType;
    empty: boolean;
    onPopupVisibleChange?: (visible: boolean) => void;
    onPopupMouseEnter: () => void;
    onPopupMouseDown: React.MouseEventHandler<HTMLDivElement>;
    onPopupBlur?: React.FocusEventHandler<HTMLDivElement>;
}
declare const RefSelectTrigger: React.ForwardRefExoticComponent<SelectTriggerProps & React.RefAttributes<RefTriggerProps>>;
export default RefSelectTrigger;
