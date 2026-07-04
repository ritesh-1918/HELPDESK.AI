import * as React from 'react';
import type { ImgInfo } from './Image';
import type { InternalPreviewConfig, PreviewProps, PreviewSemanticName } from './Preview';
import type { TransformType } from './hooks/useImageTransform';
import type { ImageElementProps } from './interface';
export interface GroupPreviewConfig extends InternalPreviewConfig {
    current?: number;
    imageRender?: (originalNode: React.ReactElement, info: {
        transform: TransformType;
        current: number;
        image: ImgInfo;
    }) => React.ReactNode;
    onOpenChange?: (value: boolean, info: {
        current: number;
    }) => void;
    onChange?: (current: number, prevCurrent: number) => void;
}
export interface PreviewGroupProps {
    previewPrefixCls?: string;
    classNames?: {
        popup?: Partial<Record<PreviewSemanticName, string>>;
    };
    styles?: {
        popup?: Partial<Record<PreviewSemanticName, React.CSSProperties>>;
    };
    icons?: PreviewProps['icons'];
    items?: (string | ImageElementProps)[];
    fallback?: string;
    preview?: boolean | GroupPreviewConfig;
    children?: React.ReactNode;
}
declare const Group: React.FC<PreviewGroupProps>;
export default Group;
