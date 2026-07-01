import React from 'react';
import type { CollapsePanelProps, CollapseProps, ItemType } from '../interface';
type Props = Pick<CollapsePanelProps, 'prefixCls' | 'onItemClick' | 'openMotion' | 'expandIcon' | 'classNames' | 'styles'> & Pick<CollapseProps, 'accordion' | 'collapsible' | 'destroyOnHidden'> & {
    activeKey: React.Key[];
};
declare function useItems(items?: ItemType[], rawChildren?: React.ReactNode, props?: Props): React.ReactElement<CollapsePanelProps>[];
export default useItems;
