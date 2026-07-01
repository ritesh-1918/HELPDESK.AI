import * as React from 'react';
import type { ProgressProps, ProgressSemanticClassNames, ProgressSemanticStyles } from './progress';
interface ProgressStepsProps extends Omit<ProgressProps, 'classNames' | 'styles'> {
    steps: number;
    strokeColor?: string | string[];
    railColor?: string;
    /** @deprecated Please use `railColor` instead */
    trailColor?: string;
    classNames: ProgressSemanticClassNames;
    styles: ProgressSemanticStyles;
}
declare const Steps: React.FC<ProgressStepsProps>;
export default Steps;
