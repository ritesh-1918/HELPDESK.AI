import type { TooltipProps } from '../../tooltip';
declare const useTooltipProps: (tooltip: React.ReactNode | TooltipProps, editConfigText: React.ReactNode, children: React.ReactNode) => {
    [Symbol.iterator](): Iterator<import("react").ReactNode, any, any>;
    title: import("react").ReactNode;
} | {
    then<TResult1 = string | number | bigint | boolean | import("react").ReactPortal | import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>> | Iterable<import("react").ReactNode> | null | undefined, TResult2 = never>(onfulfilled?: ((value: string | number | bigint | boolean | import("react").ReactPortal | import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>> | Iterable<import("react").ReactNode> | null | undefined) => TResult1 | PromiseLike<TResult1>) | null | undefined, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null | undefined): Promise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null | undefined): Promise<(string | number | bigint | boolean | import("react").ReactPortal | import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>> | Iterable<import("react").ReactNode> | null | undefined) | TResult>;
    finally(onfinally?: (() => void) | null | undefined): Promise<string | number | bigint | boolean | import("react").ReactPortal | import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>> | Iterable<import("react").ReactNode> | null | undefined>;
    [Symbol.toStringTag]: string;
    title: import("react").ReactNode;
} | {
    title: string | number | bigint | boolean | import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>> | Iterable<import("react").ReactNode> | Promise<string | number | bigint | boolean | import("react").ReactPortal | import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>> | Iterable<import("react").ReactNode> | null | undefined> | import("../../_util/getRenderPropValue").RenderFunction | null | undefined;
    overlay?: React.ReactNode | import("../../_util/getRenderPropValue").RenderFunction;
    classNames?: import("../../tooltip").TooltipClassNamesType;
    styles?: import("../../tooltip").TooltipStylesType;
    style?: React.CSSProperties;
    className?: string;
    rootClassName?: string;
    color?: import("../../_util/type").LiteralUnion<import("../../_util/colors").PresetColorType>;
    placement?: import("../../tooltip").TooltipPlacement;
    builtinPlacements?: typeof import("@rc-component/tooltip/lib/placements").placements;
    openClassName?: string;
    arrow?: boolean | {
        pointAtCenter?: boolean;
    };
    autoAdjustOverflow?: boolean | import("../../tooltip").AdjustOverflow;
    getPopupContainer?: (triggerNode: HTMLElement) => HTMLElement;
    children?: React.ReactNode;
    destroyOnHidden?: boolean;
    destroyTooltipOnHide?: boolean | {
        keepParent?: boolean;
    };
    overlayStyle?: React.CSSProperties;
    overlayInnerStyle?: React.CSSProperties;
    overlayClassName?: string;
    open?: import("@rc-component/tooltip/lib/Tooltip").TooltipProps["visible"];
    defaultOpen?: import("@rc-component/tooltip/lib/Tooltip").TooltipProps["defaultVisible"];
    onOpenChange?: import("@rc-component/tooltip/lib/Tooltip").TooltipProps["onVisibleChange"];
    afterOpenChange?: import("@rc-component/tooltip/lib/Tooltip").TooltipProps["afterVisibleChange"];
    align?: import("@rc-component/trigger").AlignType | undefined;
    motion?: import("@rc-component/motion").CSSMotionProps | undefined;
    prefixCls?: string | undefined;
    zIndex?: number | undefined;
    onPopupAlign?: ((element: HTMLElement, align: import("@rc-component/trigger").AlignType) => void) | undefined;
    fresh?: boolean | undefined;
    mouseLeaveDelay?: number | undefined;
    mouseEnterDelay?: number | undefined;
    forceRender?: boolean | undefined;
    popupVisible?: boolean | undefined;
    trigger?: (import("@rc-component/trigger").ActionType | import("@rc-component/trigger").ActionType[]) | undefined;
    getTooltipContainer?: ((node: HTMLElement) => HTMLElement) | undefined;
    showArrow?: (boolean | import("@rc-component/trigger").ArrowType) | undefined;
    arrowContent?: import("react").ReactNode;
    id?: string | undefined;
    unique?: boolean | undefined;
};
export default useTooltipProps;
