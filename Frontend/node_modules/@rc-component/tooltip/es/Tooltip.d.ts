import type { ArrowType, TriggerProps, TriggerRef } from '@rc-component/trigger';
import type { ActionType, AlignType } from '@rc-component/trigger/lib/interface';
import * as React from 'react';
export type SemanticName = 'root' | 'arrow' | 'container' | 'uniqueContainer';
export interface TooltipProps extends Pick<TriggerProps, 'onPopupAlign' | 'builtinPlacements' | 'fresh' | 'mouseLeaveDelay' | 'mouseEnterDelay' | 'prefixCls' | 'forceRender' | 'popupVisible'> {
    children: React.ReactElement;
    classNames?: Partial<Record<SemanticName, string>>;
    styles?: Partial<Record<SemanticName, React.CSSProperties>>;
    /** Config popup motion */
    motion?: TriggerProps['popupMotion'];
    trigger?: ActionType | ActionType[];
    defaultVisible?: boolean;
    visible?: boolean;
    placement?: string;
    onVisibleChange?: (visible: boolean) => void;
    afterVisibleChange?: (visible: boolean) => void;
    overlay: (() => React.ReactNode) | React.ReactNode;
    getTooltipContainer?: (node: HTMLElement) => HTMLElement;
    destroyOnHidden?: boolean;
    align?: AlignType;
    showArrow?: boolean | ArrowType;
    arrowContent?: React.ReactNode;
    id?: string;
    zIndex?: number;
    /**
     * Configures Tooltip to reuse the background for transition usage.
     * This is an experimental API and may not be stable.
     */
    unique?: TriggerProps['unique'];
}
export interface TooltipRef extends TriggerRef {
}
declare const Tooltip: React.ForwardRefExoticComponent<TooltipProps & React.RefAttributes<TooltipRef>>;
export default Tooltip;
