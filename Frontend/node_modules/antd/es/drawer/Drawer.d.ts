import * as React from 'react';
import type { DrawerProps as RcDrawerProps } from '@rc-component/drawer';
import type { Placement } from '@rc-component/drawer/lib/Drawer';
import type { MaskType } from '../_util/hooks';
import type { DrawerPanelProps } from './DrawerPanel';
import type { FocusableConfig, OmitFocusType } from './useFocusable';
declare const _SizeTypes: readonly ["default", "large"];
type sizeType = (typeof _SizeTypes)[number];
export interface PushState {
    distance: string | number;
}
export interface DrawerResizableConfig {
    onResize?: (size: number) => void;
    onResizeStart?: () => void;
    onResizeEnd?: () => void;
}
export interface DrawerProps extends Omit<RcDrawerProps, 'maskStyle' | 'destroyOnClose' | 'mask' | 'resizable' | 'classNames' | 'styles' | OmitFocusType>, Omit<DrawerPanelProps, 'prefixCls' | 'ariaId'> {
    size?: sizeType | number | string;
    resizable?: boolean | DrawerResizableConfig;
    open?: boolean;
    afterOpenChange?: (open: boolean) => void;
    /** @deprecated Please use `destroyOnHidden` instead */
    destroyOnClose?: boolean;
    /**
     * @since 5.25.0
     */
    destroyOnHidden?: boolean;
    /** @deprecated Please use `mask.closable` instead */
    maskClosable?: boolean;
    mask?: MaskType;
    focusable?: FocusableConfig;
}
declare const Drawer: React.FC<DrawerProps> & {
    _InternalPanelDoNotUseOrYouWillBeFired: typeof PurePanel;
};
interface PurePanelInterface {
    prefixCls?: string;
    style?: React.CSSProperties;
    className?: string;
    placement?: Placement;
}
/** @private Internal Component. Do not use in your production. */
declare const PurePanel: React.FC<Omit<DrawerPanelProps, 'prefixCls'> & PurePanelInterface>;
export default Drawer;
