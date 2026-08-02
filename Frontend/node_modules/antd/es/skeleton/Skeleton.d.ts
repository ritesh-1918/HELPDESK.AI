import * as React from 'react';
import type { SemanticClassNamesType, SemanticStylesType } from '../_util/hooks';
import type { AvatarProps } from './Avatar';
import SkeletonAvatar from './Avatar';
import SkeletonButton from './Button';
import SkeletonImage from './Image';
import SkeletonInput from './Input';
import SkeletonNode from './Node';
import type { SkeletonParagraphProps } from './Paragraph';
import type { SkeletonTitleProps } from './Title';
type SkeletonAvatarProps = Omit<AvatarProps, 'active'>;
export type SkeletonSemanticName = keyof SkeletonSemanticClassNames & keyof SkeletonSemanticStyles;
export type SkeletonSemanticClassNames = {
    root?: string;
    header?: string;
    section?: string;
    avatar?: string;
    title?: string;
    paragraph?: string;
};
export type SkeletonSemanticStyles = {
    root?: React.CSSProperties;
    header?: React.CSSProperties;
    section?: React.CSSProperties;
    avatar?: React.CSSProperties;
    title?: React.CSSProperties;
    paragraph?: React.CSSProperties;
};
export type SkeletonClassNamesType = SemanticClassNamesType<SkeletonProps, SkeletonSemanticClassNames>;
export type SkeletonStylesType = SemanticStylesType<SkeletonProps, SkeletonSemanticStyles>;
export interface SkeletonProps {
    active?: boolean;
    loading?: boolean;
    prefixCls?: string;
    className?: string;
    rootClassName?: string;
    style?: React.CSSProperties;
    avatar?: SkeletonAvatarProps | boolean;
    title?: SkeletonTitleProps | boolean;
    paragraph?: SkeletonParagraphProps | boolean;
    round?: boolean;
    classNames?: SkeletonClassNamesType;
    styles?: SkeletonStylesType;
}
type CompoundedComponent = {
    Button: typeof SkeletonButton;
    Avatar: typeof SkeletonAvatar;
    Input: typeof SkeletonInput;
    Image: typeof SkeletonImage;
    Node: typeof SkeletonNode;
};
declare const Skeleton: React.FC<React.PropsWithChildren<SkeletonProps>> & CompoundedComponent;
export default Skeleton;
