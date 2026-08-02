import * as React from 'react';
import type { HeaderProps } from '../Header/Header';
import type { Direction, TableLayout } from '../interface';
export interface FixedHeaderProps<RecordType> extends HeaderProps<RecordType> {
    className: string;
    style?: React.CSSProperties;
    noData: boolean;
    maxContentScroll: boolean;
    colWidths: readonly number[];
    columCount: number;
    direction: Direction;
    fixHeader: boolean;
    stickyTopOffset?: number;
    stickyBottomOffset?: number;
    stickyClassName?: string;
    scrollX?: number | string | true;
    tableLayout?: TableLayout;
    onScroll: (info: {
        currentTarget: HTMLDivElement;
        scrollLeft?: number;
    }) => void;
    children: (info: HeaderProps<RecordType>) => React.ReactNode;
    colGroup?: React.ReactNode;
}
/** Return a table in div as fixed element which contains sticky info */
declare const _default: React.NamedExoticComponent<FixedHeaderProps<any> & React.RefAttributes<HTMLDivElement>>;
export default _default;
