import * as React from 'react';
import type { RenderFunction } from '../_util/getRenderPropValue';
import type { SemanticClassNamesType, SemanticStylesType } from '../_util/hooks';
import type { AbstractTooltipProps, TooltipRef, TooltipSemanticClassNames, TooltipSemanticStyles } from '../tooltip';
import PurePanel from './PurePanel';
export type PopoverSemanticName = keyof PopoverSemanticClassNames & keyof PopoverSemanticStyles;
export type PopoverSemanticClassNames = TooltipSemanticClassNames & {
    title?: string;
    content?: string;
};
export type PopoverSemanticStyles = TooltipSemanticStyles & {
    title?: React.CSSProperties;
    content?: React.CSSProperties;
};
export type PopoverClassNamesType = SemanticClassNamesType<PopoverProps, PopoverSemanticClassNames>;
export type PopoverStylesType = SemanticStylesType<PopoverProps, PopoverSemanticStyles>;
export interface PopoverProps extends AbstractTooltipProps {
    title?: React.ReactNode | RenderFunction;
    content?: React.ReactNode | RenderFunction;
    onOpenChange?: (open: boolean) => void;
    classNames?: PopoverClassNamesType;
    styles?: PopoverStylesType;
}
declare const InternalPopover: React.ForwardRefExoticComponent<PopoverProps & React.RefAttributes<TooltipRef>>;
type CompoundedComponent = typeof InternalPopover & {
    _InternalPanelDoNotUseOrYouWillBeFired: typeof PurePanel;
};
declare const Popover: CompoundedComponent;
export default Popover;
