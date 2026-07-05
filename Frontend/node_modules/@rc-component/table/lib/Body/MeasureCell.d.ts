import * as React from 'react';
export interface MeasureCellProps {
    columnKey: React.Key;
    onColumnResize: (key: React.Key, width: number) => void;
    title?: React.ReactNode;
}
declare const MeasureCell: React.FC<MeasureCellProps>;
export default MeasureCell;
