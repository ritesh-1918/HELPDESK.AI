import * as React from 'react';
import type { CSSProperties } from 'react';
import type { SemanticClassNamesType, SemanticStylesType } from '../_util/hooks';
import type { Breakpoint } from '../_util/responsiveObserver';
import type { RowProps } from '../grid';
import type { MasonryItemType } from './MasonryItem';
export type Gap = number | undefined;
export type Key = string | number;
export type MasonrySemanticName = keyof MasonrySemanticClassNames & keyof MasonrySemanticStyles;
export type MasonrySemanticClassNames = {
    root?: string;
    item?: string;
};
export type MasonrySemanticStyles = {
    root?: React.CSSProperties;
    item?: React.CSSProperties;
};
export type MasonryClassNamesType = SemanticClassNamesType<MasonryProps, MasonrySemanticClassNames>;
export type MasonryStylesType = SemanticStylesType<MasonryProps, MasonrySemanticStyles>;
export interface MasonryProps<ItemDataType = any> {
    prefixCls?: string;
    className?: string;
    rootClassName?: string;
    style?: CSSProperties;
    classNames?: MasonryClassNamesType;
    styles?: MasonryStylesType;
    /** Spacing between items */
    gutter?: RowProps['gutter'];
    items?: MasonryItemType<ItemDataType>[];
    itemRender?: (itemInfo: MasonryItemType<ItemDataType> & {
        index: number;
    }) => React.ReactNode;
    /** Number of columns in the masonry grid layout */
    columns?: number | Partial<Record<Breakpoint, number>>;
    /** Trigger when item layout order changed */
    onLayoutChange?: (sortInfo: {
        key: React.Key;
        column: number;
    }[]) => void;
    fresh?: boolean;
}
export interface MasonryRef {
    nativeElement: HTMLDivElement;
}
declare const _default: (<ItemDataType = any>(props: React.PropsWithChildren<MasonryProps<ItemDataType>> & React.RefAttributes<MasonryRef>) => React.ReactElement) & Pick<React.FC, "displayName">;
export default _default;
