import * as React from 'react';
import type { SkeletonElementProps } from './Element';
export interface SkeletonNodeProps extends Omit<SkeletonElementProps, 'size' | 'shape'> {
    children?: React.ReactNode;
    internalClassName?: string;
}
declare const SkeletonNode: React.FC<SkeletonNodeProps>;
export default SkeletonNode;
