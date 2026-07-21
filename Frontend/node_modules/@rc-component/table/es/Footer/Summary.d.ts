import type * as React from 'react';
import Cell from './Cell';
import Row from './Row';
export interface SummaryProps {
    fixed?: boolean | 'top' | 'bottom';
}
/**
 * Syntactic sugar. Do not support HOC.
 */
declare const Summary: React.FC<React.PropsWithChildren<SummaryProps>> & {
    Row: typeof Row;
    Cell: typeof Cell;
};
export default Summary;
