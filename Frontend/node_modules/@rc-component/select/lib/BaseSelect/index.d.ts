import type { AlignType, BuildInPlacements } from '@rc-component/trigger/lib/interface';
import type { ScrollConfig, ScrollTo } from '@rc-component/virtual-list/lib/List';
import * as React from 'react';
import type { DisplayInfoType, DisplayValueType, Mode, Placement, RawValueType, RenderDOMFunc, RenderNode } from '../interface';
import type { ComponentsConfig } from '../hooks/useComponents';
export type BaseSelectSemanticName = 'prefix' | 'suffix' | 'input' | 'clear' | 'placeholder' | 'content' | 'item' | 'itemContent' | 'itemRemove';
/**
 * ZombieJ:
 * We are currently refactoring the semantic structure of the component. Changelog:
 * - Remove `suffixIcon` and change to `suffix`.
 * - Add `components.root` for replacing response element.
 *   - Remove `getInputElement` and `getRawInputElement` since we can use `components.input` instead.
 */
export type { DisplayInfoType, DisplayValueType, Mode, Placement, RenderDOMFunc, RenderNode, RawValueType, };
export interface RefOptionListProps {
    onKeyDown: React.KeyboardEventHandler;
    onKeyUp: React.KeyboardEventHandler;
    scrollTo?: (args: number | ScrollConfig) => void;
}
export type CustomTagProps = {
    label: React.ReactNode;
    value: any;
    disabled: boolean;
    onClose: (event?: React.MouseEvent<HTMLElement, MouseEvent>) => void;
    closable: boolean;
    isMaxTag: boolean;
    index: number;
};
export interface BaseSelectRef {
    focus: (options?: FocusOptions) => void;
    blur: () => void;
    scrollTo: ScrollTo;
    nativeElement: HTMLElement;
}
export interface BaseSelectPrivateProps {
    id: string;
    prefixCls: string;
    omitDomProps?: string[];
    displayValues: DisplayValueType[];
    onDisplayValuesChange: (values: DisplayValueType[], info: {
        type: DisplayInfoType;
        values: DisplayValueType[];
    }) => void;
    /** Current dropdown list active item string value */
    activeValue?: string;
    /** Link search input with target element */
    activeDescendantId?: string;
    onActiveValueChange?: (value: string | null) => void;
    searchValue: string;
    autoClearSearchValue?: boolean;
    /** Trigger onSearch, return false to prevent trigger open event */
    onSearch: (searchValue: string, info: {
        source: 'typing' | 'effect' | 'submit' | 'blur';
    }) => void;
    /** Trigger when search text match the `tokenSeparators`. Will provide split content */
    onSearchSplit?: (words: string[]) => void;
    OptionList: React.ForwardRefExoticComponent<React.PropsWithoutRef<any> & React.RefAttributes<RefOptionListProps>>;
    /** Tell if provided `options` is empty */
    emptyOptions: boolean;
}
export type BaseSelectPropsWithoutPrivate = Omit<BaseSelectProps, keyof BaseSelectPrivateProps>;
export interface BaseSelectProps extends BaseSelectPrivateProps, React.AriaAttributes, Pick<React.HTMLAttributes<HTMLElement>, 'role'> {
    className?: string;
    style?: React.CSSProperties;
    classNames?: Partial<Record<BaseSelectSemanticName, string>>;
    styles?: Partial<Record<BaseSelectSemanticName, React.CSSProperties>>;
    showSearch?: boolean;
    tagRender?: (props: CustomTagProps) => React.ReactElement;
    direction?: 'ltr' | 'rtl';
    autoFocus?: boolean;
    placeholder?: React.ReactNode;
    maxCount?: number;
    title?: string;
    tabIndex?: number;
    notFoundContent?: React.ReactNode;
    onClear?: () => void;
    maxLength?: number;
    showScrollBar?: boolean | 'optional';
    choiceTransitionName?: string;
    mode?: Mode;
    disabled?: boolean;
    loading?: boolean;
    open?: boolean;
    defaultOpen?: boolean;
    onPopupVisibleChange?: (open: boolean) => void;
    /** @private Internal usage. Do not use in your production. */
    getInputElement?: () => JSX.Element;
    /** @private Internal usage. Do not use in your production. */
    getRawInputElement?: () => JSX.Element;
    maxTagTextLength?: number;
    maxTagCount?: number | 'responsive';
    maxTagPlaceholder?: React.ReactNode | ((omittedValues: DisplayValueType[]) => React.ReactNode);
    tokenSeparators?: string[];
    allowClear?: boolean | {
        clearIcon?: React.ReactNode;
    };
    prefix?: React.ReactNode;
    /** @deprecated Please use `suffix` instead. */
    suffixIcon?: RenderNode;
    suffix?: RenderNode;
    /**
     * Clear all icon
     * @deprecated Please use `allowClear` instead
     **/
    clearIcon?: React.ReactNode;
    /** Selector remove icon */
    removeIcon?: RenderNode;
    animation?: string;
    transitionName?: string;
    popupStyle?: React.CSSProperties;
    popupClassName?: string;
    popupMatchSelectWidth?: boolean | number;
    popupRender?: (menu: React.ReactElement) => React.ReactElement;
    popupAlign?: AlignType;
    placement?: Placement;
    builtinPlacements?: BuildInPlacements;
    getPopupContainer?: RenderDOMFunc;
    showAction?: ('focus' | 'click')[];
    onBlur?: React.FocusEventHandler<HTMLElement>;
    onFocus?: React.FocusEventHandler<HTMLElement>;
    onKeyUp?: React.KeyboardEventHandler<HTMLDivElement>;
    onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
    onMouseDown?: React.MouseEventHandler<HTMLDivElement>;
    onPopupScroll?: React.UIEventHandler<HTMLDivElement>;
    onInputKeyDown?: React.KeyboardEventHandler<HTMLInputElement | HTMLTextAreaElement>;
    onMouseEnter?: React.MouseEventHandler<HTMLDivElement>;
    onMouseLeave?: React.MouseEventHandler<HTMLDivElement>;
    onClick?: React.MouseEventHandler<HTMLDivElement>;
    components?: ComponentsConfig;
}
export declare const isMultiple: (mode: Mode) => boolean;
declare const BaseSelect: React.ForwardRefExoticComponent<BaseSelectProps & React.RefAttributes<BaseSelectRef>>;
export default BaseSelect;
