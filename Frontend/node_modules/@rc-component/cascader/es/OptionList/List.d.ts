import type { useBaseProps } from '@rc-component/select';
import type { RefOptionListProps } from '@rc-component/select/lib/OptionList';
import * as React from 'react';
export type RawOptionListProps = Pick<ReturnType<typeof useBaseProps>, 'prefixCls' | 'multiple' | 'searchValue' | 'toggleOpen' | 'notFoundContent' | 'direction' | 'open' | 'disabled'> & {
    lockOptions?: boolean;
};
declare const RawOptionList: React.ForwardRefExoticComponent<Pick<import("@rc-component/select/lib/hooks/useBaseProps").BaseSelectContextProps, "disabled" | "prefixCls" | "multiple" | "searchValue" | "direction" | "notFoundContent" | "open" | "toggleOpen"> & {
    lockOptions?: boolean | undefined;
} & React.RefAttributes<RefOptionListProps>>;
export default RawOptionList;
