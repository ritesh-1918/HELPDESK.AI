import * as React from 'react';
import type { ImageProps as RcImageProps } from '@rc-component/image';
import type { MaskType, SemanticClassNamesType, SemanticStylesType } from '../_util/hooks';
import PreviewGroup from './PreviewGroup';
type OriginPreviewConfig = NonNullable<Exclude<RcImageProps['preview'], boolean>>;
export type DeprecatedPreviewConfig = {
    /** @deprecated Use `open` instead */
    visible?: boolean;
    /** @deprecated Use `classNames.root` instead */
    rootClassName?: string;
    /**
     * @deprecated This has been removed.
     * Preview will always be rendered after show.
     */
    forceRender?: boolean;
    /**
     * @deprecated This has been removed.
     * Preview will always be rendered after show.
     */
    destroyOnClose?: boolean;
    /** @deprecated Use `actionsRender` instead */
    toolbarRender?: OriginPreviewConfig['actionsRender'];
};
export type PreviewConfig = OriginPreviewConfig & DeprecatedPreviewConfig & {
    /** @deprecated Use `onOpenChange` instead */
    onVisibleChange?: (visible: boolean, prevVisible: boolean) => void;
    /** @deprecated Use `classNames.cover` instead */
    maskClassName?: string;
    mask?: MaskType | React.ReactNode;
};
export interface CompositionImage<P> extends React.FC<P> {
    PreviewGroup: typeof PreviewGroup;
}
export type ImageSemanticName = keyof ImageSemanticClassNames & keyof ImageSemanticStyles;
export type ImageSemanticClassNames = {
    root?: string;
    image?: string;
    cover?: string;
};
export type ImageSemanticStyles = {
    root?: React.CSSProperties;
    image?: React.CSSProperties;
    cover?: React.CSSProperties;
};
export type ImagePopupSemanticName = keyof ImagePopupSemanticClassNames & keyof ImagePopupSemanticStyles;
export type ImagePopupSemanticClassNames = {
    root?: string;
    mask?: string;
    body?: string;
    footer?: string;
    actions?: string;
};
export type ImagePopupSemanticStyles = {
    root?: React.CSSProperties;
    mask?: React.CSSProperties;
    body?: React.CSSProperties;
    footer?: React.CSSProperties;
    actions?: React.CSSProperties;
};
export type ImageClassNamesType = SemanticClassNamesType<ImageProps, ImageSemanticClassNames, {
    popup?: ImagePopupSemanticClassNames;
}>;
export type ImageStylesType = SemanticStylesType<ImageProps, ImageSemanticStyles, {
    popup?: ImagePopupSemanticStyles;
}>;
export interface ImageProps extends Omit<RcImageProps, 'preview' | 'classNames' | 'styles'> {
    preview?: boolean | PreviewConfig;
    /** @deprecated Use `styles.root` instead */
    wrapperStyle?: React.CSSProperties;
    classNames?: ImageClassNamesType;
    styles?: ImageStylesType;
}
declare const Image: CompositionImage<ImageProps>;
export type { PreviewConfig as ImagePreviewType };
export default Image;
