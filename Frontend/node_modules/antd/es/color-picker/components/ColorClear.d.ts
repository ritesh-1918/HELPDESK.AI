import type { FC } from 'react';
import React from 'react';
import type { AggregationColor } from '../color';
interface ColorClearProps {
    prefixCls: string;
    value?: AggregationColor;
    onChange?: (value: AggregationColor) => void;
    className?: string;
    style?: React.CSSProperties;
}
declare const ColorClear: FC<ColorClearProps>;
export default ColorClear;
