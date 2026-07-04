import * as React from 'react';
import type { SliderRef } from '@rc-component/slider/lib/Slider';
import type { TooltipProps } from '../tooltip';
export type SliderTooltipProps = TooltipProps & {
    draggingDelete?: boolean;
    value?: number;
};
declare const SliderTooltip: React.ForwardRefExoticComponent<TooltipProps & {
    draggingDelete?: boolean;
    value?: number;
} & React.RefAttributes<SliderRef>>;
export default SliderTooltip;
