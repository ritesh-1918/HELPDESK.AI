import * as React from 'react';
import type { PresetColorType, PresetStatusColorType } from '../_util/colors';
import type { ClosableType, SemanticClassNamesType, SemanticStylesType } from '../_util/hooks';
import type { LiteralUnion } from '../_util/type';
import CheckableTag from './CheckableTag';
import CheckableTagGroup from './CheckableTagGroup';
export type { CheckableTagProps } from './CheckableTag';
export type { CheckableTagGroupProps } from './CheckableTagGroup';
export type TagSemanticName = keyof TagSemanticClassNames & keyof TagSemanticStyles;
export type TagSemanticClassNames = {
    root?: string;
    icon?: string;
    content?: string;
};
export type TagSemanticStyles = {
    root?: React.CSSProperties;
    icon?: React.CSSProperties;
    content?: React.CSSProperties;
};
export type TagClassNamesType = SemanticClassNamesType<TagProps, TagSemanticClassNames>;
export type TagStylesType = SemanticStylesType<TagProps, TagSemanticStyles>;
export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
    prefixCls?: string;
    className?: string;
    rootClassName?: string;
    color?: LiteralUnion<PresetColorType | PresetStatusColorType>;
    variant?: 'filled' | 'solid' | 'outlined';
    /** Advised to use closeIcon instead. */
    closable?: ClosableType;
    closeIcon?: React.ReactNode;
    onClose?: (e: React.MouseEvent<HTMLElement>) => void;
    style?: React.CSSProperties;
    icon?: React.ReactNode;
    /** @deprecated Please use `variant="filled"` instead */
    bordered?: boolean;
    href?: string;
    target?: string;
    disabled?: boolean;
    classNames?: TagClassNamesType;
    styles?: TagStylesType;
}
declare const InternalTag: React.ForwardRefExoticComponent<TagProps & React.RefAttributes<HTMLAnchorElement | HTMLSpanElement>>;
export type TagType = typeof InternalTag & {
    CheckableTag: typeof CheckableTag;
    CheckableTagGroup: typeof CheckableTagGroup;
};
declare const Tag: TagType;
export default Tag;
