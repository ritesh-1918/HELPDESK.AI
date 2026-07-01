import * as React from 'react';
import type { PanelProps } from '@rc-component/dialog/lib/Dialog/Content/Panel';
import type { ModalClassNamesType, ModalFuncProps, ModalStylesType } from './interface';
export interface PurePanelProps extends Omit<PanelProps, 'prefixCls' | 'footer' | 'classNames' | 'styles'>, Pick<ModalFuncProps, 'type' | 'footer'> {
    prefixCls?: string;
    style?: React.CSSProperties;
    classNames?: ModalClassNamesType;
    styles?: ModalStylesType;
}
declare const _default: (props: PurePanelProps) => React.JSX.Element;
export default _default;
