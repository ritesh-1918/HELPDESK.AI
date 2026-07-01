import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import React from 'react';
export type ListItemSemanticName = keyof ListItemSemanticClassNames & keyof ListItemSemanticStyles;
export type ListItemSemanticClassNames = {
    actions?: string;
    extra?: string;
};
export type ListItemSemanticStyles = {
    actions?: React.CSSProperties;
    extra?: React.CSSProperties;
};
export interface ListItemProps extends HTMLAttributes<HTMLDivElement> {
    className?: string;
    classNames?: ListItemSemanticClassNames;
    children?: ReactNode;
    prefixCls?: string;
    style?: CSSProperties;
    styles?: ListItemSemanticStyles;
    extra?: ReactNode;
    actions?: ReactNode[];
    colStyle?: CSSProperties;
}
export interface ListItemMetaProps {
    avatar?: ReactNode;
    className?: string;
    children?: ReactNode;
    description?: ReactNode;
    prefixCls?: string;
    style?: CSSProperties;
    title?: ReactNode;
}
export declare const Meta: React.FC<ListItemMetaProps>;
declare const InternalItem: React.ForwardRefExoticComponent<ListItemProps & React.RefAttributes<HTMLDivElement>>;
export type ListItemTypeProps = typeof InternalItem & {
    Meta: typeof Meta;
};
declare const Item: ListItemTypeProps;
export default Item;
