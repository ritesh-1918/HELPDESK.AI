import * as React from 'react';
import type { RateRef, RateProps as RcRateProps } from '@rc-component/rate/lib/Rate';
import type { TooltipProps } from '../tooltip';
export interface RateProps extends RcRateProps {
    rootClassName?: string;
    tooltips?: (TooltipProps | string)[];
    size?: 'small' | 'middle' | 'large';
}
declare const Rate: React.ForwardRefExoticComponent<RateProps & React.RefAttributes<RateRef>>;
export default Rate;
