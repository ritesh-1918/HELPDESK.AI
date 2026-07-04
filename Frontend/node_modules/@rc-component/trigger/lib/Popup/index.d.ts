import type { CSSMotionProps } from '@rc-component/motion';
import { type ResizeObserverProps } from '@rc-component/resize-observer';
import * as React from 'react';
import type { TriggerProps } from '../';
import type { AlignType, ArrowPos, ArrowTypeOuter } from '../interface';
import type { PortalProps } from '@rc-component/portal';
export interface MobileConfig {
    mask?: boolean;
    /** Set popup motion. You can ref `rc-motion` for more info. */
    motion?: CSSMotionProps;
    /** Set mask motion. You can ref `rc-motion` for more info. */
    maskMotion?: CSSMotionProps;
}
export interface PopupProps {
    onEsc?: PortalProps['onEsc'];
    prefixCls: string;
    className?: string;
    style?: React.CSSProperties;
    popup?: TriggerProps['popup'];
    target: HTMLElement;
    onMouseEnter?: React.MouseEventHandler<HTMLDivElement>;
    onMouseLeave?: React.MouseEventHandler<HTMLDivElement>;
    onPointerEnter?: React.MouseEventHandler<HTMLDivElement>;
    onPointerDownCapture?: React.MouseEventHandler<HTMLDivElement>;
    zIndex?: number;
    mask?: boolean;
    onVisibleChanged: (visible: boolean) => void;
    align?: AlignType;
    arrow?: ArrowTypeOuter;
    arrowPos: ArrowPos;
    open: boolean;
    /** Tell Portal that should keep in screen. e.g. should wait all motion end */
    keepDom: boolean;
    fresh?: boolean;
    onClick?: React.MouseEventHandler<HTMLDivElement>;
    motion?: CSSMotionProps;
    maskMotion?: CSSMotionProps;
    forceRender?: boolean;
    getPopupContainer?: TriggerProps['getPopupContainer'];
    autoDestroy?: boolean;
    portal: React.ComponentType<any>;
    children?: React.ReactElement;
    ready: boolean;
    offsetX: number;
    offsetY: number;
    offsetR: number;
    offsetB: number;
    onAlign: VoidFunction;
    onPrepare: () => Promise<void>;
    stretch?: string;
    targetWidth?: number;
    targetHeight?: number;
    onResize?: ResizeObserverProps['onResize'];
    mobile?: MobileConfig;
}
declare const Popup: React.ForwardRefExoticComponent<PopupProps & React.RefAttributes<HTMLDivElement>>;
export default Popup;
