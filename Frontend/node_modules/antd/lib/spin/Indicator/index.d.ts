import * as React from 'react';
export interface IndicatorProps {
    prefixCls: string;
    indicator?: React.ReactNode;
    percent?: number;
    className?: string;
    style?: React.CSSProperties;
}
export default function Indicator(props: IndicatorProps): React.JSX.Element;
