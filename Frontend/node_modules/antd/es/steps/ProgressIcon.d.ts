import * as React from 'react';
export interface ProgressIconProps {
    prefixCls: string;
    rootPrefixCls: string;
    percent: number;
}
declare const ProgressIcon: React.FC<React.PropsWithChildren<ProgressIconProps>>;
export default ProgressIcon;
