import * as React from 'react';
import RcImage from '@rc-component/image';
import type { DeprecatedPreviewConfig, ImageClassNamesType, ImageStylesType } from '.';
import type { MaskType } from '../_util/hooks';
import type { GetProps } from '../_util/type';
export declare const icons: {
    rotateLeft: React.JSX.Element;
    rotateRight: React.JSX.Element;
    zoomIn: React.JSX.Element;
    zoomOut: React.JSX.Element;
    close: React.JSX.Element;
    left: React.JSX.Element;
    right: React.JSX.Element;
    flipX: React.JSX.Element;
    flipY: React.JSX.Element;
};
type RcPreviewGroupProps = GetProps<typeof RcImage.PreviewGroup>;
type OriginPreviewConfig = NonNullable<Exclude<RcPreviewGroupProps['preview'], boolean>>;
export type GroupPreviewConfig = OriginPreviewConfig & DeprecatedPreviewConfig & {
    /** @deprecated Use `onOpenChange` instead */
    onVisibleChange?: (visible: boolean, prevVisible: boolean, current: number) => void;
    mask?: MaskType;
};
export interface PreviewGroupProps extends Omit<RcPreviewGroupProps, 'preview'> {
    preview?: boolean | GroupPreviewConfig;
    classNames?: ImageClassNamesType;
    styles?: ImageStylesType;
}
declare const InternalPreviewGroup: React.FC<PreviewGroupProps>;
export default InternalPreviewGroup;
