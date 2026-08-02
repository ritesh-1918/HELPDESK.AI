import type { CompareProps } from '@rc-component/context/lib/Immutable';
import * as React from 'react';
import type { Reference } from '../interface';
import { type TableProps } from '../Table';
export interface VirtualTableProps<RecordType> extends Omit<TableProps<RecordType>, 'scroll'> {
    listItemHeight?: number;
    scroll: {
        x?: number;
        y?: number;
    };
}
export type ForwardGenericVirtualTable = (<RecordType>(props: TableProps<RecordType> & React.RefAttributes<Reference>) => React.ReactElement<any>) & {
    displayName?: string;
};
export declare const genVirtualTable: (shouldTriggerRender?: CompareProps<ForwardGenericVirtualTable>) => ForwardGenericVirtualTable;
declare const _default: ForwardGenericVirtualTable;
export default _default;
