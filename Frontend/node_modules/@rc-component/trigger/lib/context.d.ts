import * as React from 'react';
import type { CSSMotionProps } from '@rc-component/motion';
import type { PortalProps } from '@rc-component/portal';
import type { TriggerProps } from './index';
import type { AlignType, ArrowTypeOuter, BuildInPlacements } from './interface';
export interface TriggerContextProps {
    registerSubPopup: (id: string, node: HTMLElement) => void;
}
declare const TriggerContext: React.Context<TriggerContextProps>;
export default TriggerContext;
export interface UniqueShowOptions {
    id: string;
    popup: TriggerProps['popup'];
    target: HTMLElement;
    delay: number;
    prefixCls?: string;
    popupClassName?: string;
    uniqueContainerClassName?: string;
    uniqueContainerStyle?: React.CSSProperties;
    popupStyle?: React.CSSProperties;
    popupPlacement?: string;
    builtinPlacements?: BuildInPlacements;
    popupAlign?: AlignType;
    zIndex?: number;
    mask?: boolean;
    maskClosable?: boolean;
    popupMotion?: CSSMotionProps;
    maskMotion?: CSSMotionProps;
    arrow?: ArrowTypeOuter;
    getPopupContainer?: TriggerProps['getPopupContainer'];
    getPopupClassNameFromAlign?: (align: AlignType) => string;
    onEsc?: PortalProps['onEsc'];
}
export interface UniqueContextProps {
    show: (options: UniqueShowOptions, isOpen: () => boolean) => void;
    hide: (delay: number) => void;
}
export declare const UniqueContext: React.Context<UniqueContextProps>;
