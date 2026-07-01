import * as React from 'react';
import type { OperationIcons } from '.';
export interface PrevNextProps {
    prefixCls: string;
    onActive: (offset: number) => void;
    current: number;
    count: number;
    icons: OperationIcons;
}
export default function PrevNext(props: PrevNextProps): React.JSX.Element;
