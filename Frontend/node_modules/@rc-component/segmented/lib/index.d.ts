import * as React from 'react';
export type SemanticName = 'item' | 'label';
export type SegmentedValue = string | number;
export type SegmentedRawOption = SegmentedValue;
export interface SegmentedLabeledOption<ValueType = SegmentedRawOption> {
    className?: string;
    disabled?: boolean;
    label: React.ReactNode;
    value: ValueType;
    /**
     * html `title` property for label
     */
    title?: string;
}
type ItemRender = (node: React.ReactNode, info: {
    item: SegmentedLabeledOption;
}) => React.ReactNode;
type SegmentedOptions<T = SegmentedRawOption> = (T | SegmentedLabeledOption<T>)[];
export interface SegmentedProps<ValueType = SegmentedValue> extends Omit<React.HTMLProps<HTMLDivElement>, 'defaultValue' | 'value' | 'onChange'> {
    options: SegmentedOptions<ValueType>;
    defaultValue?: ValueType;
    value?: ValueType;
    onChange?: (value: ValueType) => void;
    disabled?: boolean;
    prefixCls?: string;
    direction?: 'ltr' | 'rtl';
    motionName?: string;
    vertical?: boolean;
    name?: string;
    classNames?: Partial<Record<SemanticName, string>>;
    styles?: Partial<Record<SemanticName, React.CSSProperties>>;
    itemRender?: ItemRender;
}
declare const Segmented: React.ForwardRefExoticComponent<Omit<SegmentedProps<SegmentedValue>, "ref"> & React.RefAttributes<HTMLDivElement>>;
declare const TypedSegmented: <ValueType>(props: SegmentedProps<ValueType> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
}) => ReturnType<typeof Segmented>;
export default TypedSegmented;
