import * as React from 'react';
import type { AlignType } from '../interface';
export interface SummaryCellProps {
    className?: string;
    index: number;
    colSpan?: number;
    rowSpan?: number;
    align?: AlignType;
}
declare const SummaryCell: React.FC<React.PropsWithChildren<SummaryCellProps>>;
export default SummaryCell;
