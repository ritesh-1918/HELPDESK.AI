import * as React from 'react';
import type { InternalPreviewConfig, PreviewSemanticName, ToolbarRenderInfoType } from './Preview';
import PreviewGroup from './PreviewGroup';
import type { TransformType } from './hooks/useImageTransform';
export interface ImgInfo {
    url: string;
    alt: string;
    width: string | number;
    height: string | number;
}
export interface CoverConfig {
    coverNode?: React.ReactNode;
    placement?: 'top' | 'bottom' | 'center';
}
export interface PreviewConfig extends Omit<InternalPreviewConfig, 'countRender'> {
    cover?: React.ReactNode | CoverConfig;
    imageRender?: (originalNode: React.ReactElement, info: {
        transform: TransformType;
        image: ImgInfo;
    }) => React.ReactNode;
    actionsRender?: (originalNode: React.ReactElement, info: Omit<ToolbarRenderInfoType, 'current' | 'total'>) => React.ReactNode;
    onOpenChange?: (open: boolean) => void;
}
export type SemanticName = 'root' | 'image' | 'cover';
export interface ImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'placeholder' | 'onClick'> {
    prefixCls?: string;
    previewPrefixCls?: string;
    rootClassName?: string;
    classNames?: Partial<Record<SemanticName, string> & {
        popup?: Partial<Record<PreviewSemanticName, string>>;
    }>;
    styles?: Partial<Record<SemanticName, React.CSSProperties> & {
        popup?: Partial<Record<PreviewSemanticName, React.CSSProperties>>;
    }>;
    src?: string;
    placeholder?: React.ReactNode;
    fallback?: string;
    preview?: boolean | PreviewConfig;
    onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
    onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}
interface CompoundedComponent<P> extends React.FC<P> {
    PreviewGroup: typeof PreviewGroup;
}
declare const ImageInternal: CompoundedComponent<ImageProps>;
export default ImageInternal;
