import type { PortalProps } from '@rc-component/portal';
import * as React from 'react';
import type { DrawerPanelAccessibility, DrawerPanelEvents } from './DrawerPanel';
import type { DrawerPopupProps } from './DrawerPopup';
import type { DrawerClassNames, DrawerStyles } from './inter';
export type Placement = 'left' | 'top' | 'right' | 'bottom';
export interface DrawerProps extends Omit<DrawerPopupProps, 'prefixCls' | 'inline' | 'scrollLocker'>, DrawerPanelEvents, DrawerPanelAccessibility {
    prefixCls?: string;
    open?: boolean;
    onClose?: (e: React.MouseEvent | React.KeyboardEvent | KeyboardEvent) => void;
    destroyOnHidden?: boolean;
    getContainer?: PortalProps['getContainer'];
    panelRef?: React.Ref<HTMLDivElement>;
    classNames?: DrawerClassNames;
    styles?: DrawerStyles;
    /**
     * @deprecated Use `size` instead. Will be removed in next major version.
     */
    width?: number | string;
    /**
     * @deprecated Use `size` instead. Will be removed in next major version.
     */
    height?: number | string;
    /** Size of the drawer (width for left/right placement, height for top/bottom placement) */
    size?: number | string;
    /** Maximum size of the drawer */
    maxSize?: number;
    /** Default size for uncontrolled resizable drawer */
    defaultSize?: number | string;
    /** Resizable configuration - boolean to enable/disable or object with optional callbacks */
    resizable?: boolean | {
        onResize?: (size: number) => void;
        onResizeStart?: () => void;
        onResizeEnd?: () => void;
    };
    focusTriggerAfterClose?: boolean;
}
declare const Drawer: React.FC<DrawerProps>;
export default Drawer;
