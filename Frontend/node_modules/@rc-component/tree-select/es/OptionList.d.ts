import type { RefOptionListProps } from '@rc-component/select/lib/OptionList';
import type { ScrollTo } from '@rc-component/tree/lib/interface';
import * as React from 'react';
type ReviseRefOptionListProps = Omit<RefOptionListProps, 'scrollTo'> & {
    scrollTo: ScrollTo;
};
declare const RefOptionList: React.ForwardRefExoticComponent<React.RefAttributes<ReviseRefOptionListProps>>;
export default RefOptionList;
