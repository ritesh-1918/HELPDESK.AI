import React from 'react';
import type { TourProps, TourStepProps } from './interface';
interface TourPanelProps {
    stepProps: Omit<TourStepProps, 'closable'> & {
        closable?: Exclude<TourStepProps['closable'], boolean>;
    };
    current: number;
    type: TourProps['type'];
    indicatorsRender?: TourProps['indicatorsRender'];
    classNames?: TourProps['classNames'];
    styles?: TourProps['styles'];
    actionsRender?: TourProps['actionsRender'];
}
declare const TourPanel: React.FC<TourPanelProps>;
export default TourPanel;
