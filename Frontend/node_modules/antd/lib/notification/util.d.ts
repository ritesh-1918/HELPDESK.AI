import type * as React from 'react';
import type { CSSMotionProps } from '@rc-component/motion';
import type { NotificationConfig as CPNotificationConfig } from '../config-provider/context';
import type { NotificationConfig, NotificationPlacement } from './interface';
export declare function getPlacementStyle(placement: NotificationPlacement, top: number, bottom: number): React.CSSProperties;
export declare function getMotion(prefixCls: string): CSSMotionProps;
export declare function getCloseIconConfig(closeIcon: React.ReactNode, notificationConfig?: NotificationConfig, notification?: CPNotificationConfig): React.ReactNode;
