import * as React from 'react';
import type { SkeletonNodeProps } from './Node';
export interface SkeletonImageProps extends Omit<SkeletonNodeProps, 'children' | 'internalClassName'> {
}
declare const SkeletonImage: React.FC<SkeletonImageProps>;
export default SkeletonImage;
