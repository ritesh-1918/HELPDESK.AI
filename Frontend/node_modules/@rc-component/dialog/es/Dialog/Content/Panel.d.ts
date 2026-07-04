import React from 'react';
import type { IDialogPropTypes } from '../../IDialogPropTypes';
export interface PanelProps extends Omit<IDialogPropTypes, 'getOpenCount'> {
    prefixCls: string;
    ariaId?: string;
    onMouseDown?: React.MouseEventHandler;
    onMouseUp?: React.MouseEventHandler;
    holderRef?: React.Ref<HTMLDivElement>;
    /** Used for focus lock. When true and open, focus will lock into the panel */
    isFixedPos?: boolean;
}
export type PanelRef = {
    focus: () => void;
};
declare const Panel: React.ForwardRefExoticComponent<PanelProps & React.RefAttributes<PanelRef>>;
export default Panel;
