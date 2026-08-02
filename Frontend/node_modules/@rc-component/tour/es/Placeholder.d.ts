import { type PortalProps } from '@rc-component/portal';
import * as React from 'react';
export interface PlaceholderProps extends Pick<PortalProps, 'open' | 'autoLock' | 'getContainer'> {
    domRef: React.RefObject<HTMLDivElement>;
    className: string;
    style: React.CSSProperties;
    fallbackDOM: () => HTMLElement | null;
}
declare const Placeholder: React.ForwardRefExoticComponent<PlaceholderProps & React.RefAttributes<HTMLElement>>;
export default Placeholder;
