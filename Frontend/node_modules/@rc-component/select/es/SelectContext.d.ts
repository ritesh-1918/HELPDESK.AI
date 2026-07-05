import * as React from 'react';
import type { RawValueType, RenderNode } from './BaseSelect';
import type { BaseOptionType, FieldNames, OnActiveValue, OnInternalSelect, SelectProps, SemanticName, PopupSemantic } from './Select';
import type { FlattenOptionData } from './interface';
/**
 * SelectContext is only used for Select. BaseSelect should not consume this context.
 */
export interface SelectContextProps {
    classNames?: Partial<Record<SemanticName, string>> & {
        popup?: Partial<Record<PopupSemantic, string>>;
    };
    styles?: Partial<Record<SemanticName, React.CSSProperties>> & {
        popup?: Partial<Record<PopupSemantic, React.CSSProperties>>;
    };
    options: BaseOptionType[];
    optionRender?: SelectProps['optionRender'];
    flattenOptions: FlattenOptionData<BaseOptionType>[];
    onActiveValue: OnActiveValue;
    defaultActiveFirstOption?: boolean;
    onSelect: OnInternalSelect;
    menuItemSelectedIcon?: RenderNode;
    rawValues: Set<RawValueType>;
    fieldNames?: FieldNames;
    virtual?: boolean;
    direction?: 'ltr' | 'rtl';
    listHeight?: number;
    listItemHeight?: number;
    childrenAsData?: boolean;
    maxCount?: number;
}
declare const SelectContext: React.Context<SelectContextProps>;
export default SelectContext;
