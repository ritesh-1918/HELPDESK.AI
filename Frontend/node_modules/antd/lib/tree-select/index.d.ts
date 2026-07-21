import * as React from 'react';
import type { BaseSelectRef } from '@rc-component/select';
import type { TreeSelectProps as RcTreeSelectProps } from '@rc-component/tree-select';
import { SHOW_ALL, SHOW_CHILD, SHOW_PARENT, TreeNode } from '@rc-component/tree-select';
import type { DataNode } from '@rc-component/tree-select/lib/interface';
import type { SemanticClassNamesType, SemanticStylesType } from '../_util/hooks';
import type { SelectCommonPlacement } from '../_util/motion';
import type { InputStatus } from '../_util/statusUtils';
import type { Variant } from '../config-provider';
import type { SizeType } from '../config-provider/SizeContext';
import type { TreeProps } from '../tree';
import type { SwitcherIcon } from '../tree/Tree';
type RawValue = string | number;
export interface LabeledValue {
    key?: string;
    value: RawValue;
    label: React.ReactNode;
}
export type SelectValue = RawValue | RawValue[] | LabeledValue | LabeledValue[];
export type TreeSelectSemanticName = keyof TreeSelectSemanticClassNames & keyof TreeSelectSemanticStyles;
export type TreeSelectSemanticClassNames = {
    root?: string;
    prefix?: string;
    input?: string;
    suffix?: string;
    content?: string;
    placeholder?: string;
    item?: string;
    itemContent?: string;
    itemRemove?: string;
};
export type TreeSelectSemanticStyles = {
    root?: React.CSSProperties;
    prefix?: React.CSSProperties;
    input?: React.CSSProperties;
    suffix?: React.CSSProperties;
    content?: React.CSSProperties;
    placeholder?: React.CSSProperties;
    item?: React.CSSProperties;
    itemContent?: React.CSSProperties;
    itemRemove?: React.CSSProperties;
};
export type TreeSelectPopupSemanticName = keyof TreeSelectPopupSemanticClassNames & keyof TreeSelectPopupSemanticStyles;
export type TreeSelectPopupSemanticClassNames = {
    root?: string;
    item?: string;
    itemTitle?: string;
};
export type TreeSelectPopupSemanticStyles = {
    root?: React.CSSProperties;
    item?: React.CSSProperties;
    itemTitle?: React.CSSProperties;
};
export type TreeSelectClassNamesType = SemanticClassNamesType<TreeSelectProps, TreeSelectSemanticClassNames> & {
    popup?: TreeSelectPopupSemanticClassNames;
};
export type TreeSelectStylesType = SemanticStylesType<TreeSelectProps, TreeSelectSemanticStyles> & {
    popup?: TreeSelectPopupSemanticStyles;
};
interface BaseTreeSelectProps<ValueType = any, OptionType extends DataNode = DataNode> extends React.AriaAttributes, Omit<RcTreeSelectProps<ValueType, OptionType>, 'showTreeIcon' | 'treeMotion' | 'mode' | 'getInputElement' | 'backfill' | 'treeLine' | 'switcherIcon' | 'classNames' | 'styles'> {
    size?: SizeType;
    disabled?: boolean;
    status?: InputStatus;
    variant?: Variant;
}
export interface TreeSelectProps<ValueType = any, OptionType extends DataNode = DataNode> extends BaseTreeSelectProps<ValueType, OptionType> {
    styles?: TreeSelectStylesType;
    classNames?: TreeSelectClassNamesType;
    suffixIcon?: React.ReactNode;
    size?: SizeType;
    disabled?: boolean;
    placement?: SelectCommonPlacement;
    /** @deprecated Please use `classNames.popup.root` instead */
    popupClassName?: string;
    /** @deprecated Please use `classNames.popup.root` instead */
    dropdownClassName?: string;
    /** @deprecated Please use `popupRender` instead */
    dropdownRender?: (menu: React.ReactElement) => React.ReactElement;
    popupRender?: (menu: React.ReactElement) => React.ReactElement;
    /** @deprecated Please use `styles.popup.root` instead */
    dropdownStyle?: React.CSSProperties;
    /** @deprecated Please use `onOpenChange` instead */
    onDropdownVisibleChange?: (visible: boolean) => void;
    onOpenChange?: (open: boolean) => void;
    /** @deprecated Use `variant` instead. */
    bordered?: boolean;
    treeLine?: TreeProps['showLine'];
    status?: InputStatus;
    switcherIcon?: SwitcherIcon | RcTreeSelectProps<ValueType, OptionType>['switcherIcon'];
    rootClassName?: string;
    /** @deprecated Please use `popupMatchSelectWidth` instead */
    dropdownMatchSelectWidth?: boolean | number;
    popupMatchSelectWidth?: boolean | number;
    /**
     * @deprecated `showArrow` is deprecated which will be removed in next major version. It will be a
     *   default behavior, you can hide it by setting `suffixIcon` to null.
     */
    showArrow?: boolean;
    /**
     * @since 5.13.0
     * @default "outlined"
     */
    variant?: Variant;
}
declare const TreeSelectRef: <ValueType = any, OptionType extends DataNode = DataNode>(props: React.PropsWithChildren<TreeSelectProps<ValueType, OptionType>> & React.RefAttributes<BaseSelectRef>) => React.ReactElement;
type InternalTreeSelectType = typeof TreeSelectRef;
type CompoundedComponent = InternalTreeSelectType & {
    displayName?: string;
    TreeNode: typeof TreeNode;
    SHOW_ALL: typeof SHOW_ALL;
    SHOW_PARENT: typeof SHOW_PARENT;
    SHOW_CHILD: typeof SHOW_CHILD;
    _InternalPanelDoNotUseOrYouWillBeFired: typeof PurePanel;
};
declare const TreeSelect: CompoundedComponent;
declare const PurePanel: (props: import("../_util/type").AnyObject) => React.JSX.Element;
export { TreeNode };
export default TreeSelect;
