import React from 'react';
import type { MasonryProps } from './Masonry';
export interface MasonryItemType<T = any> {
    key: React.Key;
    column?: number;
    height?: number;
    children?: React.ReactNode;
    data: T;
}
interface MasonryItemProps<T = any> extends Pick<MasonryProps, 'itemRender'> {
    prefixCls: string;
    item: MasonryItemType<T>;
    style: React.CSSProperties;
    className?: string;
    index: number;
    column: number;
    onResize: VoidFunction | null;
}
declare const MasonryItem: React.ForwardRefExoticComponent<MasonryItemProps<any> & React.RefAttributes<HTMLDivElement>>;
export default MasonryItem;
