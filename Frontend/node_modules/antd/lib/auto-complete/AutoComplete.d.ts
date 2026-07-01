import * as React from 'react';
import type { BaseSelectRef } from '@rc-component/select';
import type { SemanticClassNamesType, SemanticStylesType } from '../_util/hooks';
import type { InputStatus } from '../_util/statusUtils';
import type { BaseOptionType, DefaultOptionType, InternalSelectProps, SelectPopupSemanticClassNames, SelectPopupSemanticStyles } from '../select';
export type AutoCompleteSemanticName = keyof AutoCompleteSemanticClassNames & keyof AutoCompleteSemanticStyles;
export type AutoCompleteSemanticClassNames = {
    root?: string;
    prefix?: string;
    input?: string;
    placeholder?: string;
    content?: string;
};
export type AutoCompleteSemanticStyles = {
    root?: React.CSSProperties;
    prefix?: React.CSSProperties;
    input?: React.CSSProperties;
    placeholder?: React.CSSProperties;
    content?: React.CSSProperties;
};
export interface DataSourceItemObject {
    value: string;
    text: string;
}
export type DataSourceItemType = DataSourceItemObject | React.ReactNode;
export type AutoCompleteClassNamesType = SemanticClassNamesType<AutoCompleteProps, AutoCompleteSemanticClassNames, {
    popup?: SelectPopupSemanticClassNames;
}>;
export type AutoCompleteStylesType = SemanticStylesType<AutoCompleteProps, AutoCompleteSemanticStyles, {
    popup?: SelectPopupSemanticStyles;
}>;
export interface AutoCompleteProps<ValueType = any, OptionType extends BaseOptionType | DefaultOptionType = DefaultOptionType> extends Omit<InternalSelectProps<ValueType, OptionType>, 'loading' | 'mode' | 'optionLabelProp' | 'labelInValue'> {
    /** @deprecated Please use `options` instead */
    dataSource?: DataSourceItemType[];
    status?: InputStatus;
    /** @deprecated Please use `classNames.popup.root` instead */
    popupClassName?: string;
    /** @deprecated Please use `classNames.popup.root` instead */
    dropdownClassName?: string;
    /** @deprecated Please use `popupMatchSelectWidth` instead */
    dropdownMatchSelectWidth?: boolean | number;
    popupMatchSelectWidth?: boolean | number;
    styles?: AutoCompleteStylesType;
    classNames?: AutoCompleteClassNamesType;
    /** @deprecated Please use `popupRender` instead */
    dropdownRender?: (menu: React.ReactElement) => React.ReactElement;
    popupRender?: (menu: React.ReactElement) => React.ReactElement;
    /** @deprecated Please use `styles.popup.root` instead */
    dropdownStyle?: React.CSSProperties;
    /** @deprecated Please use `onOpenChange` instead */
    onDropdownVisibleChange?: (visible: boolean) => void;
    onOpenChange?: (visible: boolean) => void;
}
declare const RefAutoComplete: (<ValueType = any, OptionType extends BaseOptionType | DefaultOptionType = DefaultOptionType>(props: React.PropsWithChildren<AutoCompleteProps<ValueType, OptionType>> & React.RefAttributes<BaseSelectRef>) => React.ReactElement) & {
    displayName?: string;
};
export default RefAutoComplete;
