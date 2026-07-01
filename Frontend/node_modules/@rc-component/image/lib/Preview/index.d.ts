import { type PortalProps } from '@rc-component/portal';
import React from 'react';
import type { TransformAction, TransformType } from '../hooks/useImageTransform';
import type { ImgInfo } from '../Image';
import { type FooterSemanticName } from './Footer';
export type PreviewSemanticName = 'root' | 'mask' | 'body' | FooterSemanticName;
export interface OperationIcons {
    rotateLeft?: React.ReactNode;
    rotateRight?: React.ReactNode;
    zoomIn?: React.ReactNode;
    zoomOut?: React.ReactNode;
    close?: React.ReactNode;
    prev?: React.ReactNode;
    next?: React.ReactNode;
    /** @deprecated Please use `prev` instead */
    left?: React.ReactNode;
    /** @deprecated Please use `next` instead */
    right?: React.ReactNode;
    flipX?: React.ReactNode;
    flipY?: React.ReactNode;
}
export interface Actions {
    onActive: (offset: number) => void;
    onFlipY: () => void;
    onFlipX: () => void;
    onRotateLeft: () => void;
    onRotateRight: () => void;
    onZoomOut: () => void;
    onZoomIn: () => void;
    onClose: () => void;
    onReset: () => void;
}
export type ToolbarRenderInfoType = {
    icons: {
        prevIcon?: React.ReactNode;
        nextIcon?: React.ReactNode;
        flipYIcon: React.ReactNode;
        flipXIcon: React.ReactNode;
        rotateLeftIcon: React.ReactNode;
        rotateRightIcon: React.ReactNode;
        zoomOutIcon: React.ReactNode;
        zoomInIcon: React.ReactNode;
    };
    actions: Actions;
    transform: TransformType;
    current: number;
    total: number;
    image: ImgInfo;
};
export interface InternalPreviewConfig {
    /** Better to use `classNames.root` instead */
    rootClassName?: string;
    src?: string;
    alt?: string;
    scaleStep?: number;
    minScale?: number;
    maxScale?: number;
    motionName?: string;
    open?: boolean;
    getContainer?: PortalProps['getContainer'];
    zIndex?: number;
    afterOpenChange?: (open: boolean) => void;
    movable?: boolean;
    icons?: OperationIcons;
    closeIcon?: React.ReactNode;
    onTransform?: (info: {
        transform: TransformType;
        action: TransformAction;
    }) => void;
    countRender?: (current: number, total: number) => React.ReactNode;
    imageRender?: (originalNode: React.ReactElement, info: {
        transform: TransformType;
        current?: number;
        image: ImgInfo;
    }) => React.ReactNode;
    actionsRender?: (originalNode: React.ReactElement, info: ToolbarRenderInfoType) => React.ReactNode;
}
export interface PreviewProps extends InternalPreviewConfig {
    prefixCls: string;
    classNames?: Partial<Record<PreviewSemanticName, string>>;
    styles?: Partial<Record<PreviewSemanticName, React.CSSProperties>>;
    imageInfo?: {
        width: number | string;
        height: number | string;
    };
    fallback?: string;
    imgCommonProps?: React.ImgHTMLAttributes<HTMLImageElement>;
    width?: string | number;
    height?: string | number;
    current?: number;
    count?: number;
    onChange?: (current: number, prev: number) => void;
    onClose?: () => void;
    mousePosition: null | {
        x: number;
        y: number;
    };
}
declare const Preview: React.FC<PreviewProps>;
export default Preview;
