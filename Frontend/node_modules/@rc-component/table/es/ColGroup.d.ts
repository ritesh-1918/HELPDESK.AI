import * as React from 'react';
import type { ColumnType } from './interface';
export interface ColGroupProps<RecordType> {
    colWidths: readonly (number | string)[];
    columns?: readonly ColumnType<RecordType>[];
    columCount?: number;
}
declare const ColGroup: <RecordType>(props: ColGroupProps<RecordType>) => React.JSX.Element;
export default ColGroup;
