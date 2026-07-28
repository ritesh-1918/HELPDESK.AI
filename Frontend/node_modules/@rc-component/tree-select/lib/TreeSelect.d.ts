import type { BaseSelectPropsWithoutPrivate, BaseSelectRef } from '@rc-component/select';
import type { BaseSelectSemanticName } from '@rc-component/select/lib/BaseSelect';
import type { IconType } from '@rc-component/tree/lib/interface';
import type { ExpandAction } from '@rc-component/tree/lib/Tree';
import * as React from 'react';
import TreeNode from './TreeNode';
import type { CheckedStrategy } from './utils/strategyUtil';
import { SHOW_ALL, SHOW_CHILD, SHOW_PARENT } from './utils/strategyUtil';
import type { SafeKey, DataNode, SimpleModeConfig, ChangeEventExtra, FieldNames, LegacyDataNode } from './interface';
export type SemanticName = BaseSelectSemanticName;
export type PopupSemantic = 'item' | 'itemTitle';
export interface SearchConfig {
    searchValue?: string;
    onSearch?: (value: string) => void;
    autoClearSearchValue?: boolean;
    filterTreeNode?: boolean | ((inputValue: string, treeNode: DataNode) => boolean);
    treeNodeFilterProp?: string;
}
export interface TreeSelectProps<ValueType = any, OptionType extends DataNode = DataNode> extends Omit<BaseSelectPropsWithoutPrivate, 'mode' | 'classNames' | 'styles' | 'showSearch'> {
    prefixCls?: string;
    id?: string;
    children?: React.ReactNode;
    styles?: Partial<Record<SemanticName, React.CSSProperties>> & {
        popup?: Partial<Record<PopupSemantic, React.CSSProperties>>;
    };
    classNames?: Partial<Record<SemanticName, string>> & {
        popup?: Partial<Record<PopupSemantic, string>>;
    };
    value?: ValueType;
    defaultValue?: ValueType;
    onChange?: (value: ValueType, labelList: React.ReactNode[], extra: ChangeEventExtra) => void;
    showSearch?: boolean | SearchConfig;
    /** @deprecated Use `showSearch.searchValue` instead */
    searchValue?: string;
    /** @deprecated Use `showSearch.searchValue` instead */
    inputValue?: string;
    /** @deprecated Use `showSearch.onSearch` instead */
    onSearch?: (value: string) => void;
    /** @deprecated Use `showSearch.autoClearSearchValue` instead */
    autoClearSearchValue?: boolean;
    /** @deprecated Use `showSearch.filterTreeNode` instead */
    filterTreeNode?: boolean | ((inputValue: string, treeNode: DataNode) => boolean);
    /** @deprecated Use `showSearch.treeNodeFilterProp` instead */
    treeNodeFilterProp?: string;
    onSelect?: (value: ValueType, option: OptionType) => void;
    onDeselect?: (value: ValueType, option: OptionType) => void;
    showCheckedStrategy?: CheckedStrategy;
    treeNodeLabelProp?: string;
    fieldNames?: FieldNames;
    multiple?: boolean;
    treeCheckable?: boolean | React.ReactNode;
    treeCheckStrictly?: boolean;
    labelInValue?: boolean;
    maxCount?: number;
    treeData?: OptionType[];
    treeDataSimpleMode?: boolean | SimpleModeConfig;
    loadData?: (dataNode: LegacyDataNode) => Promise<unknown>;
    treeLoadedKeys?: SafeKey[];
    onTreeLoad?: (loadedKeys: SafeKey[]) => void;
    treeDefaultExpandAll?: boolean;
    treeExpandedKeys?: SafeKey[];
    treeDefaultExpandedKeys?: SafeKey[];
    onTreeExpand?: (expandedKeys: SafeKey[]) => void;
    treeExpandAction?: ExpandAction;
    virtual?: boolean;
    listHeight?: number;
    listItemHeight?: number;
    listItemScrollOffset?: number;
    onPopupVisibleChange?: (open: boolean) => void;
    treeTitleRender?: (node: OptionType) => React.ReactNode;
    treeLine?: boolean;
    treeIcon?: IconType;
    showTreeIcon?: boolean;
    switcherIcon?: IconType;
    treeMotion?: any;
}
declare const GenericTreeSelect: (<ValueType = any, OptionType extends DataNode = DataNode>(props: React.PropsWithChildren<TreeSelectProps<ValueType, OptionType>> & {
    ref?: React.Ref<BaseSelectRef>;
}) => React.ReactElement) & {
    TreeNode: typeof TreeNode;
    SHOW_ALL: typeof SHOW_ALL;
    SHOW_PARENT: typeof SHOW_PARENT;
    SHOW_CHILD: typeof SHOW_CHILD;
};
export default GenericTreeSelect;
