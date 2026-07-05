import * as React from 'react';
import type { placements as Placements } from '@rc-component/tooltip/lib/placements';
import type { TooltipProps as RcTooltipProps } from '@rc-component/tooltip/lib/Tooltip';
import type { PresetColorType } from '../_util/colors';
import type { RenderFunction } from '../_util/getRenderPropValue';
import type { SemanticClassNamesType, SemanticStylesType } from '../_util/hooks';
import type { AdjustOverflow, PlacementsConfig } from '../_util/placements';
import type { LiteralUnion } from '../_util/type';
import PurePanel from './PurePanel';
import UniqueProvider from './UniqueProvider';
export type { AdjustOverflow, PlacementsConfig };
export interface TooltipRef {
    forceAlign: VoidFunction;
    /** Wrapped dom element. Not promise valid if child not support ref */
    nativeElement: HTMLElement;
    /** Popup dom element */
    popupElement: HTMLDivElement;
}
export type TooltipPlacement = 'top' | 'left' | 'right' | 'bottom' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'leftTop' | 'leftBottom' | 'rightTop' | 'rightBottom';
export interface TooltipAlignConfig {
    points?: [string, string];
    offset?: [number | string, number | string];
    targetOffset?: [number | string, number | string];
    overflow?: {
        adjustX: boolean;
        adjustY: boolean;
    };
    useCssRight?: boolean;
    useCssBottom?: boolean;
    useCssTransform?: boolean;
}
interface LegacyTooltipProps extends Partial<Omit<RcTooltipProps, 'children' | 'visible' | 'defaultVisible' | 'onVisibleChange' | 'afterVisibleChange' | 'destroyTooltipOnHide' | 'classNames' | 'styles'>> {
    open?: RcTooltipProps['visible'];
    defaultOpen?: RcTooltipProps['defaultVisible'];
    onOpenChange?: RcTooltipProps['onVisibleChange'];
    afterOpenChange?: RcTooltipProps['afterVisibleChange'];
}
export type TooltipSemanticName = keyof TooltipSemanticClassNames & keyof TooltipSemanticStyles;
export type TooltipSemanticClassNames = {
    root?: string;
    container?: string;
    arrow?: string;
};
export type TooltipSemanticStyles = {
    root?: React.CSSProperties;
    container?: React.CSSProperties;
    arrow?: React.CSSProperties;
};
export type TooltipClassNamesType = SemanticClassNamesType<TooltipProps, TooltipSemanticClassNames>;
export type TooltipStylesType = SemanticStylesType<TooltipProps, TooltipSemanticStyles>;
export interface AbstractTooltipProps extends LegacyTooltipProps {
    style?: React.CSSProperties;
    className?: string;
    rootClassName?: string;
    color?: LiteralUnion<PresetColorType>;
    placement?: TooltipPlacement;
    builtinPlacements?: typeof Placements;
    openClassName?: string;
    arrow?: boolean | {
        pointAtCenter?: boolean;
    };
    autoAdjustOverflow?: boolean | AdjustOverflow;
    getPopupContainer?: (triggerNode: HTMLElement) => HTMLElement;
    children?: React.ReactNode;
    /**
     * @since 5.25.0
     */
    destroyOnHidden?: boolean;
    /** @deprecated Please use `destroyOnHidden` instead */
    destroyTooltipOnHide?: boolean | {
        keepParent?: boolean;
    };
    /** @deprecated Please use `styles.root` instead */
    overlayStyle?: React.CSSProperties;
    /** @deprecated Please use `styles.container` instead */
    overlayInnerStyle?: React.CSSProperties;
    /** @deprecated Please use `classNames.root` instead */
    overlayClassName?: string;
}
export interface TooltipProps extends AbstractTooltipProps {
    title?: React.ReactNode | RenderFunction;
    overlay?: React.ReactNode | RenderFunction;
    classNames?: TooltipClassNamesType;
    styles?: TooltipStylesType;
}
interface InternalTooltipProps extends TooltipProps {
}
declare const InternalTooltip: React.ForwardRefExoticComponent<InternalTooltipProps & React.RefAttributes<TooltipRef>>;
type CompoundedComponent = typeof InternalTooltip & {
    _InternalPanelDoNotUseOrYouWillBeFired: typeof PurePanel;
    UniqueProvider: typeof UniqueProvider;
};
declare const Tooltip: CompoundedComponent;
export default Tooltip;
