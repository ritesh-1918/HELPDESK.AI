import type { CSSMotionProps } from '@rc-component/motion';
import * as React from 'react';
import { type MobileConfig } from './Popup';
import type { ActionType, AlignType, ArrowTypeOuter, BuildInPlacements } from './interface';
export type { ActionType, AlignType, ArrowTypeOuter as ArrowType, BuildInPlacements, };
import UniqueProvider, { type UniqueProviderProps } from './UniqueProvider';
export { UniqueProvider };
export type { UniqueProviderProps };
export interface TriggerRef {
    nativeElement: HTMLElement;
    popupElement: HTMLDivElement;
    forceAlign: VoidFunction;
}
export interface TriggerProps {
    children: React.ReactElement<any> | ((info: {
        open: boolean;
    }) => React.ReactElement<any>);
    action?: ActionType | ActionType[];
    showAction?: ActionType[];
    hideAction?: ActionType[];
    prefixCls?: string;
    zIndex?: number;
    onPopupAlign?: (element: HTMLElement, align: AlignType) => void;
    stretch?: string;
    popupVisible?: boolean;
    defaultPopupVisible?: boolean;
    onOpenChange?: (visible: boolean) => void;
    afterOpenChange?: (visible: boolean) => void;
    /** @deprecated Use `onOpenChange` instead */
    onPopupVisibleChange?: (visible: boolean) => void;
    /** @deprecated Use `afterOpenChange` instead */
    afterPopupVisibleChange?: (visible: boolean) => void;
    getPopupContainer?: (node: HTMLElement) => HTMLElement;
    forceRender?: boolean;
    autoDestroy?: boolean;
    mask?: boolean;
    maskClosable?: boolean;
    /** Set popup motion. You can ref `rc-motion` for more info. */
    popupMotion?: CSSMotionProps;
    /** Set mask motion. You can ref `rc-motion` for more info. */
    maskMotion?: CSSMotionProps;
    mouseEnterDelay?: number;
    mouseLeaveDelay?: number;
    focusDelay?: number;
    blurDelay?: number;
    popup: React.ReactNode | (() => React.ReactNode);
    popupPlacement?: string;
    builtinPlacements?: BuildInPlacements;
    popupAlign?: AlignType;
    popupClassName?: string;
    /** Pass to `UniqueProvider` UniqueContainer */
    uniqueContainerClassName?: string;
    /** Pass to `UniqueProvider` UniqueContainer */
    uniqueContainerStyle?: React.CSSProperties;
    popupStyle?: React.CSSProperties;
    getPopupClassNameFromAlign?: (align: AlignType) => string;
    onPopupClick?: React.MouseEventHandler<HTMLDivElement>;
    alignPoint?: boolean;
    /**
     * Trigger will memo content when close.
     * This may affect the case if want to keep content update.
     * Set `fresh` to `false` will always keep update.
     */
    fresh?: boolean;
    /**
     * Config with UniqueProvider to shared the floating popup.
     */
    unique?: boolean;
    arrow?: boolean | ArrowTypeOuter;
    /**
     * @private Bump fixed position at bottom in mobile.
     * Will replace the config of root props.
     * This will directly trade as mobile view which will not check what real is.
     * This is internal usage currently, do not use in your prod.
     */
    mobile?: MobileConfig;
}
export declare function generateTrigger(PortalComponent?: React.ComponentType<any>): React.ForwardRefExoticComponent<TriggerProps & React.RefAttributes<TriggerRef>>;
declare const _default: React.ForwardRefExoticComponent<TriggerProps & React.RefAttributes<TriggerRef>>;
export default _default;
