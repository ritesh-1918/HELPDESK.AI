import type { RefOptionListProps } from '@rc-component/select/lib/OptionList';
import * as React from 'react';
import type { DefaultOptionType, InternalFieldNames, LegacyKey, SingleValueType } from '../Cascader';
declare const _default: (ref: React.Ref<RefOptionListProps>, options: DefaultOptionType[], fieldNames: InternalFieldNames, activeValueCells: LegacyKey[], setActiveValueCells: (activeValueCells: LegacyKey[]) => void, onKeyBoardSelect: (valueCells: SingleValueType, option: DefaultOptionType) => void, contextProps: {
    direction?: "ltr" | "rtl" | undefined;
    searchValue: string;
    toggleOpen: (open?: boolean) => void;
    open?: boolean | undefined;
}) => void;
export default _default;
