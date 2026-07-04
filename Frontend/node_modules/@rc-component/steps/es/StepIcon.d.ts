import * as React from 'react';
export interface StepIconSemanticContextProps {
    className?: string;
    style?: React.CSSProperties;
}
export declare const StepIconSemanticContext: React.Context<StepIconSemanticContextProps>;
export type StepIconProps = React.HTMLAttributes<HTMLDivElement>;
declare const StepIcon: React.ForwardRefExoticComponent<StepIconProps & React.RefAttributes<HTMLDivElement>>;
export default StepIcon;
