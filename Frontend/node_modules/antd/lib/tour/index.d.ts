import React from 'react';
import type { TourProps, TourSemanticClassNames, TourSemanticName, TourSemanticStyles, TourStepProps } from './interface';
import PurePanel from './PurePanel';
export type { TourProps, TourSemanticClassNames, TourSemanticName, TourSemanticStyles, TourStepProps, };
declare const Tour: React.FC<TourProps> & {
    _InternalPanelDoNotUseOrYouWillBeFired: typeof PurePanel;
};
export default Tour;
