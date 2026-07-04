import React from 'react';
import type { ReactNode } from 'react';
import type { SemanticClassNamesType, SemanticStylesType } from '../_util/hooks';
export type CheckableTagOption<CheckableTagValue> = {
    value: CheckableTagValue;
    label: ReactNode;
};
interface CheckableTagGroupSingleProps<CheckableTagValue> {
    multiple?: false;
    value?: CheckableTagValue | null;
    defaultValue?: CheckableTagValue | null;
    onChange?: (value: CheckableTagValue | null) => void;
}
interface CheckableTagGroupMultipleProps<CheckableTagValue> {
    multiple: true;
    value?: CheckableTagValue[];
    defaultValue?: CheckableTagValue[];
    onChange?: (value: CheckableTagValue[]) => void;
}
export type SemanticName = keyof TagGroupSemanticClassNames & keyof TagGroupSemanticStyles;
export type TagGroupSemanticClassNames = {
    root?: string;
    item?: string;
};
export type TagGroupSemanticStyles = {
    root?: React.CSSProperties;
    item?: React.CSSProperties;
};
type CheckableTagGroupBaseProps<CheckableTagValue> = {
    prefixCls?: string;
    rootClassName?: string;
    options?: (CheckableTagOption<CheckableTagValue> | CheckableTagValue)[];
    disabled?: boolean;
} & (CheckableTagGroupSingleProps<CheckableTagValue> | CheckableTagGroupMultipleProps<CheckableTagValue>) & Pick<React.HTMLAttributes<HTMLDivElement>, 'className' | 'style' | 'id' | 'role'> & {
    [key: `data-${string}`]: any;
    [key: `aria-${string}`]: any;
};
export type CheckableTagGroupClassNamesType = SemanticClassNamesType<CheckableTagGroupBaseProps<any>, TagGroupSemanticClassNames>;
export type CheckableTagGroupStylesType = SemanticStylesType<CheckableTagGroupBaseProps<any>, TagGroupSemanticStyles>;
export type CheckableTagGroupProps<CheckableTagValue> = CheckableTagGroupBaseProps<CheckableTagValue> & {
    classNames?: CheckableTagGroupClassNamesType;
    styles?: CheckableTagGroupStylesType;
};
export interface CheckableTagGroupRef {
    nativeElement: HTMLDivElement;
}
declare const ForwardCheckableTagGroup: (<CheckableTagValue extends string | number>(props: CheckableTagGroupProps<CheckableTagValue> & {
    ref?: React.Ref<CheckableTagGroupRef>;
}) => React.ReactElement) & {
    displayName?: string;
};
export default ForwardCheckableTagGroup;
