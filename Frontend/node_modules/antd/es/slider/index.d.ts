import React from 'react';
import type { SliderProps as RcSliderProps } from '@rc-component/slider';
import type { SliderRef } from '@rc-component/slider/lib/Slider';
import type { Orientation, SemanticClassNamesType, SemanticStylesType } from '../_util/hooks';
import type { GetProp } from '../_util/type';
import type { AbstractTooltipProps, TooltipPlacement } from '../tooltip';
export type SliderMarks = RcSliderProps['marks'];
export type SliderSemanticName = keyof SliderSemanticClassNames & keyof SliderSemanticStyles;
export type SliderSemanticClassNames = {
    root?: string;
    tracks?: string;
    track?: string;
    rail?: string;
    handle?: string;
};
export type SliderSemanticStyles = {
    root?: React.CSSProperties;
    tracks?: React.CSSProperties;
    track?: React.CSSProperties;
    rail?: React.CSSProperties;
    handle?: React.CSSProperties;
};
export type SliderClassNamesType = SemanticClassNamesType<SliderBaseProps, SliderSemanticClassNames>;
export type SliderStylesType = SemanticStylesType<SliderBaseProps, SliderSemanticStyles>;
export interface SliderProps extends Omit<RcSliderProps, 'styles' | 'classNames'> {
    classNames?: SliderClassNamesType;
    styles?: SliderStylesType;
}
interface HandleGeneratorInfo {
    value?: number;
    dragging?: boolean;
    index: number;
}
export type HandleGeneratorFn = (config: {
    tooltipPrefixCls?: string;
    prefixCls?: string;
    info: HandleGeneratorInfo;
}) => React.ReactElement;
export type Formatter = ((value?: number) => React.ReactNode) | null;
export interface SliderTooltipProps extends AbstractTooltipProps {
    prefixCls?: string;
    open?: boolean;
    placement?: TooltipPlacement;
    getPopupContainer?: (triggerNode: HTMLElement) => HTMLElement;
    formatter?: Formatter;
    autoAdjustOverflow?: boolean;
}
export interface SliderBaseProps {
    prefixCls?: string;
    reverse?: boolean;
    min?: number;
    max?: number;
    step?: null | number;
    marks?: SliderMarks;
    dots?: boolean;
    included?: boolean;
    disabled?: boolean;
    keyboard?: boolean;
    orientation?: Orientation;
    vertical?: boolean;
    className?: string;
    rootClassName?: string;
    id?: string;
    style?: React.CSSProperties;
    tooltip?: SliderTooltipProps;
    autoFocus?: boolean;
    styles?: SliderStylesType;
    classNames?: SliderClassNamesType;
    onFocus?: React.FocusEventHandler<HTMLDivElement>;
    onBlur?: React.FocusEventHandler<HTMLDivElement>;
    tabIndex?: SliderProps['tabIndex'];
    ariaLabelForHandle?: SliderProps['ariaLabelForHandle'];
    ariaLabelledByForHandle?: SliderProps['ariaLabelledByForHandle'];
    ariaRequired?: SliderProps['ariaRequired'];
    ariaValueTextFormatterForHandle?: SliderProps['ariaValueTextFormatterForHandle'];
}
export interface SliderSingleProps extends SliderBaseProps {
    range?: false;
    value?: number;
    defaultValue?: number;
    onChange?: (value: number) => void;
    /** @deprecated Please use `onChangeComplete` instead */
    onAfterChange?: (value: number) => void;
    onChangeComplete?: (value: number) => void;
    /** @deprecated Please use `styles.handle` instead */
    handleStyle?: React.CSSProperties;
    /** @deprecated Please use `styles.track` instead */
    trackStyle?: React.CSSProperties;
    /** @deprecated Please use `styles.rail` instead */
    railStyle?: React.CSSProperties;
}
export interface SliderRangeProps extends SliderBaseProps {
    range: true | SliderRange;
    value?: number[];
    defaultValue?: number[];
    onChange?: (value: number[]) => void;
    /** @deprecated Please use `onChangeComplete` instead */
    onAfterChange?: (value: number[]) => void;
    onChangeComplete?: (value: number[]) => void;
    /** @deprecated Please use `styles.handle` instead */
    handleStyle?: React.CSSProperties[];
    /** @deprecated Please use `styles.track` instead */
    trackStyle?: React.CSSProperties[];
    /** @deprecated Please use `styles.rail` instead */
    railStyle?: React.CSSProperties;
}
type SliderRange = Exclude<GetProp<RcSliderProps, 'range'>, boolean>;
export type Opens = {
    [index: number]: boolean;
};
declare const Slider: React.ForwardRefExoticComponent<(SliderSingleProps | SliderRangeProps) & React.RefAttributes<SliderRef>>;
export default Slider;
