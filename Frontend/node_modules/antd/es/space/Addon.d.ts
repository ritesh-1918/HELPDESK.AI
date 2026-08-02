import React from 'react';
import type { InputStatus } from '../_util/statusUtils';
import type { Variant } from '../config-provider';
export interface SpaceCompactCellProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    prefixCls?: string;
    variant?: Variant;
    disabled?: boolean;
    status?: InputStatus;
}
declare const SpaceAddon: React.ForwardRefExoticComponent<SpaceCompactCellProps & React.RefAttributes<HTMLDivElement>>;
export default SpaceAddon;
