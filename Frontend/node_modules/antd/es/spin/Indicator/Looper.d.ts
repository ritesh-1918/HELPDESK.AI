import * as React from 'react';
export interface IndicatorProps {
    prefixCls: string;
    percent?: number;
    className?: string;
    style?: React.CSSProperties;
}
export default function Looper(props: IndicatorProps): React.JSX.Element;
