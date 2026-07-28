import * as React from 'react';
import type { Actions, PreviewProps } from '.';
import type { ImgInfo } from '../Image';
import type { TransformType } from '../hooks/useImageTransform';
export type FooterSemanticName = 'footer' | 'actions';
export interface FooterProps extends Actions {
    prefixCls: string;
    showProgress: boolean;
    countRender?: PreviewProps['countRender'];
    actionsRender?: PreviewProps['actionsRender'];
    current: number;
    count: number;
    showSwitch: boolean;
    icons: PreviewProps['icons'];
    scale: number;
    minScale: number;
    maxScale: number;
    image: ImgInfo;
    transform: TransformType;
    classNames: Partial<Record<FooterSemanticName, string>>;
    styles: Partial<Record<FooterSemanticName, React.CSSProperties>>;
}
export default function Footer(props: FooterProps): React.JSX.Element;
