import * as React from 'react';
import type { PaginationLocale, PaginationProps as RcPaginationProps } from '@rc-component/pagination';
import type { SemanticClassNamesType, SemanticStylesType } from '../_util/hooks';
import type { SizeType } from '../config-provider/SizeContext';
import type { SelectProps } from '../select';
export type SemanticName = keyof PaginationSemanticClassNames & keyof PaginationSemanticStyles;
export type PaginationSemanticName = SemanticName;
export type PaginationSemanticClassNames = {
    root?: string;
    item?: string;
};
export type PaginationSemanticStyles = {
    root?: React.CSSProperties;
    item?: React.CSSProperties;
};
export type PaginationClassNamesType = SemanticClassNamesType<PaginationProps, PaginationSemanticClassNames>;
export type PaginationStylesType = SemanticStylesType<PaginationProps, PaginationSemanticStyles>;
export interface PaginationProps extends Omit<RcPaginationProps, 'showSizeChanger' | 'pageSizeOptions' | 'classNames' | 'styles'> {
    showQuickJumper?: boolean | {
        goButton?: React.ReactNode;
    };
    size?: SizeType;
    responsive?: boolean;
    role?: string;
    totalBoundaryShowSizeChanger?: number;
    rootClassName?: string;
    showSizeChanger?: boolean | SelectProps;
    /** @deprecated Not official support. Will be removed in next major version. */
    selectComponentClass?: any;
    /** `string` type will be removed in next major version. */
    pageSizeOptions?: (string | number)[];
    classNames?: PaginationClassNamesType;
    styles?: PaginationStylesType;
}
export type PaginationPosition = 'top' | 'bottom' | 'both';
export interface PaginationConfig extends Omit<PaginationProps, 'rootClassName'> {
    position?: PaginationPosition;
}
export type { PaginationLocale };
declare const Pagination: React.FC<PaginationProps>;
export default Pagination;
