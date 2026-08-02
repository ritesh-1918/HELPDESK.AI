import * as React from 'react';
import type { TimelineItemType, TimelineMode, TimelineProps } from './Timeline';
declare const useItems: (rootPrefixCls: string, prefixCls: string, mode: TimelineMode, items?: TimelineItemType[], children?: React.ReactNode, pending?: TimelineProps["pending"], pendingDot?: TimelineProps["pendingDot"]) => TimelineItemType[];
export default useItems;
