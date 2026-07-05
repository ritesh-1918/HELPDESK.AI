import * as React from 'react';
/**
 * Note: `middle` is deprecated and will be removed in v7, please use `medium` instead.
 */
export type SizeType = 'small' | 'medium' | 'middle' | 'large' | undefined;
declare const SizeContext: React.Context<SizeType>;
export interface SizeContextProps {
    size?: SizeType;
    children?: React.ReactNode;
}
export declare const SizeContextProvider: React.FC<SizeContextProps>;
export default SizeContext;
