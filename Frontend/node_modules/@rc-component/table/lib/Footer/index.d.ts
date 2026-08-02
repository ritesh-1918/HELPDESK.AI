import * as React from 'react';
import type { ColumnType, StickyOffsets } from '../interface';
type FlattenColumns<RecordType> = readonly (ColumnType<RecordType> & {
    scrollbar?: boolean;
})[];
export interface FooterProps<RecordType> {
    children: React.ReactNode;
    stickyOffsets: StickyOffsets;
    flattenColumns: FlattenColumns<RecordType>;
}
declare const _default: <RecordType>(props: FooterProps<RecordType>) => React.JSX.Element;
export default _default;
export declare const FooterComponents: React.FC<React.PropsWithChildren<import("./Summary").SummaryProps>> & {
    Row: React.FC<React.PropsWithChildren<import("./Row").FooterRowProps>>;
    Cell: React.FC<React.PropsWithChildren<import("./Cell").SummaryCellProps>>;
};
