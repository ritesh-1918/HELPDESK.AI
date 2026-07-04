import type { CommonInputProps } from '@rc-component/input/lib/interface';
import type { TextAreaProps } from '@rc-component/textarea';
import React from 'react';
import type { OptionProps } from './Option';
import Option from './Option';
import { filterOption as defaultFilterOption, validateSearch as defaultValidateSearch } from './util';
type BaseTextareaAttrs = Omit<TextAreaProps, 'prefix' | 'onChange' | 'onSelect' | 'showCount' | 'classNames'>;
export type Placement = 'top' | 'bottom';
export type Direction = 'ltr' | 'rtl';
export interface DataDrivenOptionProps extends Omit<OptionProps, 'children'> {
    label?: React.ReactNode;
}
export interface MentionsProps extends BaseTextareaAttrs {
    id?: string;
    autoFocus?: boolean;
    className?: string;
    defaultValue?: string;
    notFoundContent?: React.ReactNode;
    split?: string;
    style?: React.CSSProperties;
    transitionName?: string;
    placement?: Placement;
    direction?: Direction;
    prefix?: string | string[];
    prefixCls?: string;
    value?: string;
    silent?: boolean;
    filterOption?: false | typeof defaultFilterOption;
    validateSearch?: typeof defaultValidateSearch;
    onChange?: (text: string) => void;
    onSelect?: (option: OptionProps, prefix: string) => void;
    onSearch?: (text: string, prefix: string) => void;
    onFocus?: React.FocusEventHandler<HTMLTextAreaElement>;
    onBlur?: React.FocusEventHandler<HTMLTextAreaElement>;
    getPopupContainer?: () => HTMLElement;
    popupClassName?: string;
    children?: React.ReactNode;
    options?: DataDrivenOptionProps[];
    classNames?: CommonInputProps['classNames'] & {
        mentions?: string;
        textarea?: string;
        popup?: string;
    };
    styles?: {
        suffix?: React.CSSProperties;
        textarea?: React.CSSProperties;
        popup?: React.CSSProperties;
    };
    onPopupScroll?: (event: React.UIEvent<HTMLDivElement>) => void;
}
export interface MentionsRef {
    focus: VoidFunction;
    blur: VoidFunction;
    /** @deprecated It may not work as expected */
    textarea: HTMLTextAreaElement | null;
    nativeElement: HTMLElement;
}
declare const Mentions: React.ForwardRefExoticComponent<MentionsProps & React.RefAttributes<MentionsRef>> & {
    Option: typeof Option;
};
export default Mentions;
