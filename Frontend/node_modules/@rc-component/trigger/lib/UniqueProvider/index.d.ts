import * as React from 'react';
import { type UniqueShowOptions } from '../context';
export interface UniqueProviderProps {
    children: React.ReactNode;
    /** Additional handle options data to do the customize info */
    postTriggerProps?: (options: UniqueShowOptions) => UniqueShowOptions;
}
declare const UniqueProvider: ({ children, postTriggerProps, }: UniqueProviderProps) => React.JSX.Element;
export default UniqueProvider;
