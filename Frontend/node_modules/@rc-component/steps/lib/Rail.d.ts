import * as React from 'react';
import type { Status } from './Steps';
export interface RailProps {
    prefixCls: string;
    className: string;
    style: React.CSSProperties;
    status: Status;
}
export default function Rail(props: RailProps): React.JSX.Element;
