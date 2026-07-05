import * as React from 'react';
import type { ProgressGradient, ProgressProps, ProgressSemanticClassNames, ProgressSemanticStyles } from './progress';
export interface CircleProps extends Omit<ProgressProps, 'classNames' | 'styles'> {
    prefixCls: string;
    children: React.ReactNode;
    progressStatus: string;
    strokeColor?: string | ProgressGradient;
    classNames: ProgressSemanticClassNames;
    styles: ProgressSemanticStyles;
}
declare const Circle: React.FC<CircleProps>;
export default Circle;
