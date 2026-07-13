import * as React from 'react';
import type { AlignType, CellEllipsisType, ColumnType, CustomizeComponent, DataIndex, DefaultRecordType, ScopeType } from '../interface';
export interface CellProps<RecordType extends DefaultRecordType> {
    prefixCls?: string;
    className?: string;
    style?: React.CSSProperties;
    record?: RecordType;
    /** `column` index is the real show rowIndex */
    index?: number;
    /** the index of the record. For the render(value, record, renderIndex) */
    renderIndex?: number;
    dataIndex?: DataIndex<RecordType>;
    render?: ColumnType<RecordType>['render'];
    component?: CustomizeComponent;
    children?: React.ReactNode;
    colSpan?: number;
    rowSpan?: number;
    scope?: ScopeType;
    ellipsis?: CellEllipsisType;
    align?: AlignType;
    shouldCellUpdate?: (record: RecordType, prevRecord: RecordType) => boolean;
    fixStart?: number | false;
    fixEnd?: number | false;
    fixedStartShadow?: boolean;
    fixedEndShadow?: boolean;
    offsetFixedStartShadow?: number;
    offsetFixedEndShadow?: number;
    zIndex?: number;
    zIndexReverse?: number;
    allColsFixedLeft?: boolean;
    /** @private Used for `expandable` with nest tree */
    appendNode?: React.ReactNode;
    additionalProps?: React.TdHTMLAttributes<HTMLTableCellElement>;
    rowType?: 'header' | 'body' | 'footer';
    isSticky?: boolean;
}
declare const _default: <RecordType>(props: CellProps<RecordType>) => React.JSX.Element;
export default _default;
