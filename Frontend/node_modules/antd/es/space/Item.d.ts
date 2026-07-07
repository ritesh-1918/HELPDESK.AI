import * as React from 'react';
export interface ItemProps {
    className: string;
    children: React.ReactNode;
    prefix: string;
    index: number;
    separator?: React.ReactNode;
    style?: React.CSSProperties;
    classNames?: {
        separator?: string;
    };
    styles?: {
        separator?: React.CSSProperties;
    };
}
declare const Item: React.FC<ItemProps>;
export default Item;
