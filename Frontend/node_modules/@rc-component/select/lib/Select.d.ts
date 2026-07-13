/**
 * To match accessibility requirement, we always provide an input in the component.
 * Other element will not set `tabIndex` to avoid `onBlur` sequence problem.
 * For focused select, we set `aria-live="polite"` to update the accessibility content.
 *
 * ref:
 * - keyboard: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/listbox_role#Keyboard_interactions
 *
 * New api:
 * - listHeight
 * - listItemHeight
 * - component
 *
 * Remove deprecated api:
 * - multiple
 * - tags
 * - combobox
 * - firstActiveValue
 * - dropdownMenuStyle
 * - openClassName (Not list in api)
 *
 * Update:
 * - `backfill` only support `combobox` mode
 * - `combobox` mode not support `labelInValue` since it's meaningless
 * - `getInputElement` only support `combobox` mode
 * - `onChange` return OptionData instead of ReactNode
 * - `filterOption` `onChange` `onSelect` accept OptionData instead of ReactNode
 * - `combobox` mode trigger `onChange` will get `undefined` if no `value` match in Option
 * - `combobox` mode not support `optionLabelProp`
 */
import * as React from 'react';
import type { BaseSelectPropsWithoutPrivate, BaseSelectRef, BaseSelectSemanticName, DisplayValueType, RenderNode } from './BaseSelect';
import OptGroup from './OptGroup';
import Option from './Option';
import type { FlattenOptionData } from './interface';
export type OnActiveValue = (active: RawValueType, index: number, info?: {
    source?: 'keyboard' | 'mouse';
}) => void;
export type OnInternalSelect = (value: RawValueType, info: {
    selected: boolean;
}) => void;
export type RawValueType = string | number;
export interface LabelInValueType {
    label: React.ReactNode;
    value: RawValueType;
}
export type DraftValueType = RawValueType | LabelInValueType | DisplayValueType | (RawValueType | LabelInValueType | DisplayValueType)[];
export type FilterFunc<OptionType> = (inputValue: string, option?: OptionType) => boolean;
export interface FieldNames {
    value?: string;
    label?: string;
    groupLabel?: string;
    options?: string;
}
export interface BaseOptionType {
    disabled?: boolean;
    className?: string;
    title?: string;
    [name: string]: any;
}
export interface DefaultOptionType extends BaseOptionType {
    label?: React.ReactNode;
    value?: string | number | null;
    children?: Omit<DefaultOptionType, 'children'>[];
}
export type SelectHandler<ValueType, OptionType extends BaseOptionType = DefaultOptionType> = (value: ValueType, option: OptionType) => void;
type ArrayElementType<T> = T extends (infer E)[] ? E : T;
export type SemanticName = BaseSelectSemanticName;
export type PopupSemantic = 'listItem' | 'list';
export interface SearchConfig<OptionType> {
    searchValue?: string;
    autoClearSearchValue?: boolean;
    onSearch?: (value: string) => void;
    filterOption?: boolean | FilterFunc<OptionType>;
    filterSort?: (optionA: OptionType, optionB: OptionType, info: {
        searchValue: string;
    }) => number;
    optionFilterProp?: string | string[];
}
export interface SelectProps<ValueType = any, OptionType extends BaseOptionType = DefaultOptionType> extends Omit<BaseSelectPropsWithoutPrivate, 'showSearch'> {
    prefixCls?: string;
    id?: string;
    backfill?: boolean;
    fieldNames?: FieldNames;
    /**  @deprecated please use  showSearch.onSearch */
    onSearch?: SearchConfig<OptionType>['onSearch'];
    showSearch?: boolean | SearchConfig<OptionType>;
    /**  @deprecated please use  showSearch.searchValue */
    searchValue?: SearchConfig<OptionType>['searchValue'];
    /**  @deprecated please use  showSearch.autoClearSearchValue */
    autoClearSearchValue?: boolean;
    onSelect?: SelectHandler<ArrayElementType<ValueType>, OptionType>;
    onDeselect?: SelectHandler<ArrayElementType<ValueType>, OptionType>;
    onActive?: (value: ValueType) => void;
    /**
     * In Select, `false` means do nothing.
     * In TreeSelect, `false` will highlight match item.
     * It's by design.
     */
    /**  @deprecated please use  showSearch.filterOption */
    filterOption?: SearchConfig<OptionType>['filterOption'];
    /**  @deprecated please use  showSearch.filterSort */
    filterSort?: SearchConfig<OptionType>['filterSort'];
    /**  @deprecated please use  showSearch.optionFilterProp */
    optionFilterProp?: string | string[];
    optionLabelProp?: string;
    children?: React.ReactNode;
    options?: OptionType[];
    optionRender?: (oriOption: FlattenOptionData<OptionType>, info: {
        index: number;
    }) => React.ReactNode;
    defaultActiveFirstOption?: boolean;
    virtual?: boolean;
    direction?: 'ltr' | 'rtl';
    listHeight?: number;
    listItemHeight?: number;
    labelRender?: (props: LabelInValueType) => React.ReactNode;
    menuItemSelectedIcon?: RenderNode;
    mode?: 'combobox' | 'multiple' | 'tags';
    labelInValue?: boolean;
    value?: ValueType | null;
    defaultValue?: ValueType | null;
    maxCount?: number;
    onChange?: (value: ValueType, option?: OptionType | OptionType[]) => void;
    classNames?: Partial<Record<SemanticName, string>>;
    styles?: Partial<Record<SemanticName, React.CSSProperties>>;
}
declare const TypedSelect: (<ValueType = any, OptionType extends DefaultOptionType | BaseOptionType = DefaultOptionType>(props: React.PropsWithChildren<SelectProps<ValueType, OptionType>> & React.RefAttributes<BaseSelectRef>) => React.ReactElement) & {
    Option: typeof Option;
    OptGroup: typeof OptGroup;
};
export default TypedSelect;
