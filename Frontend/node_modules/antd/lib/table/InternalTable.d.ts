import * as React from 'react';
import type { TableProps as RcTableProps } from '@rc-component/table';
import type { SemanticClassNamesType, SemanticStylesType } from '../_util/hooks';
import type { AnyObject } from '../_util/type';
import type { SizeType } from '../config-provider/SizeContext';
import type { PaginationSemanticClassNames, PaginationSemanticStyles } from '../pagination/Pagination';
import type { SpinProps } from '../spin';
import type { ColumnsType, FilterValue, GetPopupContainer, RefInternalTable, SorterResult, SorterTooltipProps, SortOrder, TableCurrentDataSource, TableLocale, TablePaginationConfig, TableRowSelection } from './interface';
export type { ColumnsType, TablePaginationConfig };
export type TableSemanticName = keyof TableSemanticClassNames & keyof TableSemanticStyles;
export type TableSemanticClassNames = {
    root?: string;
    section?: string;
    title?: string;
    footer?: string;
    content?: string;
};
export type TableSemanticStyles = {
    root?: React.CSSProperties;
    section?: React.CSSProperties;
    title?: React.CSSProperties;
    footer?: React.CSSProperties;
    content?: React.CSSProperties;
};
export type ComponentsSemantic = keyof ComponentsSemanticClassNames & keyof ComponentsSemanticStyles;
export type ComponentsSemanticClassNames = {
    wrapper?: string;
    cell?: string;
    row?: string;
};
export type ComponentsSemanticStyles = {
    wrapper?: React.CSSProperties;
    cell?: React.CSSProperties;
    row?: React.CSSProperties;
};
export type TableClassNamesType<RecordType = AnyObject> = SemanticClassNamesType<TableProps<RecordType>, TableSemanticClassNames, {
    body?: ComponentsSemanticClassNames;
    header?: ComponentsSemanticClassNames;
    pagination?: PaginationSemanticClassNames;
}>;
export type TableStylesType<RecordType = AnyObject> = SemanticStylesType<TableProps<RecordType>, TableSemanticStyles, {
    body?: ComponentsSemanticStyles;
    header?: ComponentsSemanticStyles;
    pagination?: PaginationSemanticStyles;
}>;
export interface TableProps<RecordType = AnyObject> extends Omit<RcTableProps<RecordType>, 'transformColumns' | 'internalHooks' | 'internalRefs' | 'data' | 'columns' | 'scroll' | 'emptyText' | 'classNames' | 'styles'> {
    classNames?: TableClassNamesType<RecordType>;
    styles?: TableStylesType<RecordType>;
    dropdownPrefixCls?: string;
    dataSource?: RcTableProps<RecordType>['data'];
    columns?: ColumnsType<RecordType>;
    pagination?: false | TablePaginationConfig;
    loading?: boolean | SpinProps;
    size?: SizeType;
    bordered?: boolean;
    locale?: TableLocale;
    rootClassName?: string;
    onChange?: (pagination: TablePaginationConfig, filters: Record<string, FilterValue | null>, sorter: SorterResult<RecordType> | SorterResult<RecordType>[], extra: TableCurrentDataSource<RecordType>) => void;
    rowSelection?: TableRowSelection<RecordType>;
    getPopupContainer?: GetPopupContainer;
    scroll?: RcTableProps<RecordType>['scroll'] & {
        scrollToFirstRowOnChange?: boolean;
    };
    sortDirections?: SortOrder[];
    showSorterTooltip?: boolean | SorterTooltipProps;
    virtual?: boolean;
}
/** Same as `TableProps` but we need record parent render times */
export interface InternalTableProps<RecordType = AnyObject> extends TableProps<RecordType> {
    _renderTimes: number;
}
declare const _default_1: RefInternalTable;
export default _default_1;
