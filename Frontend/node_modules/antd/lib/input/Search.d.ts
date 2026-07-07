import * as React from 'react';
import type { SemanticClassNamesType, SemanticStylesType } from '../_util/hooks';
import type { ButtonSemanticClassNames, ButtonSemanticStyles } from '../button/Button';
import type { InputProps, InputRef } from './Input';
export type InputSearchSemanticName = keyof InputSearchSemanticClassNames & keyof InputSearchSemanticStyles;
export type InputSearchSemanticClassNames = {
    root?: string;
    input?: string;
    prefix?: string;
    suffix?: string;
    count?: string;
};
export type InputSearchSemanticStyles = {
    root?: React.CSSProperties;
    input?: React.CSSProperties;
    prefix?: React.CSSProperties;
    suffix?: React.CSSProperties;
    count?: React.CSSProperties;
};
export type InputSearchClassNamesType = SemanticClassNamesType<SearchProps, InputSearchSemanticClassNames> & {
    button?: ButtonSemanticClassNames;
};
export type InputSearchStylesType = SemanticStylesType<SearchProps, InputSearchSemanticStyles> & {
    button?: ButtonSemanticStyles;
};
export interface SearchProps extends InputProps {
    inputPrefixCls?: string;
    onSearch?: (value: string, event?: React.ChangeEvent<HTMLInputElement> | React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLInputElement>, info?: {
        source?: 'clear' | 'input';
    }) => void;
    enterButton?: React.ReactNode;
    loading?: boolean;
    onPressEnter?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    classNames?: InputSearchClassNamesType;
    styles?: InputSearchStylesType;
}
declare const Search: React.ForwardRefExoticComponent<SearchProps & React.RefAttributes<InputRef>>;
export default Search;
