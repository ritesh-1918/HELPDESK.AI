import * as React from 'react';
import type { ColumnType } from '../interface';
export interface MeasureRowProps {
    prefixCls: string;
    onColumnResize: (key: React.Key, width: number) => void;
    columnsKey: React.Key[];
    columns: readonly ColumnType<any>[];
}
declare const MeasureRow: React.FC<MeasureRowProps>;
export default MeasureRow;
