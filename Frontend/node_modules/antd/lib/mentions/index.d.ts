import * as React from 'react';
import type { DataDrivenOptionProps as MentionsOptionProps, MentionsProps as RcMentionsProps, MentionsRef as RcMentionsRef } from '@rc-component/mentions/lib/Mentions';
import type { SemanticClassNamesType, SemanticStylesType } from '../_util/hooks';
import type { InputStatus } from '../_util/statusUtils';
import type { Variant } from '../config-provider';
import type { SizeType } from '../config-provider/SizeContext';
export declare const Option: React.FC<import("@rc-component/mentions/lib/Option").OptionProps>;
export type MentionPlacement = 'top' | 'bottom';
export type { DataDrivenOptionProps as MentionsOptionProps } from '@rc-component/mentions/lib/Mentions';
export interface OptionProps {
    value: string;
    children: React.ReactNode;
    [key: string]: any;
}
export type MentionSemanticName = keyof MentionSemanticClassNames & keyof MentionSemanticStyles;
export type MentionSemanticClassNames = {
    root?: string;
    textarea?: string;
    popup?: string;
    suffix?: string;
};
export type MentionSemanticStyles = {
    root?: React.CSSProperties;
    textarea?: React.CSSProperties;
    popup?: React.CSSProperties;
    suffix?: React.CSSProperties;
};
export type MentionsClassNamesType = SemanticClassNamesType<MentionProps, MentionSemanticClassNames>;
export type MentionsStylesType = SemanticStylesType<MentionProps, MentionSemanticStyles>;
export interface MentionProps extends Omit<RcMentionsProps, 'suffix' | 'classNames' | 'styles'> {
    rootClassName?: string;
    loading?: boolean;
    status?: InputStatus;
    options?: MentionsOptionProps[];
    popupClassName?: string;
    /**
     * @since 5.13.0
     * @default "outlined"
     */
    variant?: Variant;
    classNames?: MentionsClassNamesType;
    styles?: MentionsStylesType;
    size?: SizeType;
}
export interface MentionsProps extends MentionProps {
}
export interface MentionsRef extends RcMentionsRef {
}
interface MentionsConfig {
    prefix?: string | string[];
    split?: string;
}
interface MentionsEntity {
    prefix: string;
    value: string;
}
declare const InternalMentions: React.ForwardRefExoticComponent<MentionProps & React.RefAttributes<MentionsRef>>;
type CompoundedComponent = typeof InternalMentions & {
    Option: typeof Option;
    _InternalPanelDoNotUseOrYouWillBeFired: typeof PurePanel;
    getMentions: (value: string, config?: MentionsConfig) => MentionsEntity[];
};
declare const Mentions: CompoundedComponent;
declare const PurePanel: (props: import("../_util/type").AnyObject) => React.JSX.Element;
export default Mentions;
