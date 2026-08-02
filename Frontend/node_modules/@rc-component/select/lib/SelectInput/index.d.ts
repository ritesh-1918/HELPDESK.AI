import * as React from 'react';
import type { DisplayValueType, Mode, RenderNode } from '../interface';
import type { ComponentsConfig } from '../hooks/useComponents';
export interface SelectInputRef {
    focus: (options?: FocusOptions) => void;
    blur: () => void;
    nativeElement: HTMLDivElement;
}
export interface SelectInputProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'prefix'> {
    prefixCls: string;
    prefix?: React.ReactNode;
    suffix?: React.ReactNode;
    clearIcon?: React.ReactNode;
    removeIcon?: RenderNode;
    multiple?: boolean;
    displayValues: DisplayValueType[];
    placeholder?: React.ReactNode;
    searchValue?: string;
    activeValue?: string;
    mode?: Mode;
    autoClearSearchValue?: boolean;
    onSearch?: (searchText: string, fromTyping: boolean, isCompositing: boolean) => void;
    onSearchSubmit?: (searchText: string) => void;
    onInputBlur?: () => void;
    onClearMouseDown?: React.MouseEventHandler<HTMLElement>;
    onInputKeyDown?: React.KeyboardEventHandler<HTMLInputElement | HTMLTextAreaElement>;
    onSelectorRemove?: (value: DisplayValueType) => void;
    maxLength?: number;
    autoFocus?: boolean;
    /** Check if `tokenSeparators` contains `\n` or `\r\n` */
    tokenWithEnter?: boolean;
    className?: string;
    style?: React.CSSProperties;
    focused?: boolean;
    components: ComponentsConfig;
    children?: React.ReactElement;
}
declare const _default: React.ForwardRefExoticComponent<SelectInputProps & React.RefAttributes<SelectInputRef>>;
export default _default;
