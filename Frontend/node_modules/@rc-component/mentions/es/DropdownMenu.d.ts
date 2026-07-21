import React from 'react';
import type { DataDrivenOptionProps } from './Mentions';
export interface DropdownMenuProps {
    prefixCls?: string;
    options: DataDrivenOptionProps[];
    opened: boolean;
}
/**
 * We only use Menu to display the candidate.
 * The focus is controlled by textarea to make accessibility easy.
 */
declare function DropdownMenu(props: DropdownMenuProps): React.JSX.Element;
export default DropdownMenu;
