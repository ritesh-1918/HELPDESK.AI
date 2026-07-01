import React from 'react';
import type { DirectionType } from '../config-provider';
export interface TransferOperationProps {
    className?: string;
    actions: React.ReactNode[];
    moveToLeft?: React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
    moveToRight?: React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
    leftActive?: boolean;
    rightActive?: boolean;
    style?: React.CSSProperties;
    disabled?: boolean;
    direction?: DirectionType;
    oneWay?: boolean;
}
declare const Actions: React.FC<TransferOperationProps>;
export default Actions;
