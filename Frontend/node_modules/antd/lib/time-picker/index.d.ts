import * as React from 'react';
import type { PickerRef } from '@rc-component/picker';
import type { Dayjs } from 'dayjs';
import type { SemanticClassNamesType, SemanticStylesType } from '../_util/hooks';
import type { InputStatus } from '../_util/statusUtils';
import type { AnyObject } from '../_util/type';
import type { GenericTimePickerProps, PickerPropsWithMultiple, RangePickerProps } from '../date-picker/generatePicker/interface';
export type TimePickerSemanticName = keyof TimePickerSemanticClassNames & keyof TimePickerSemanticStyles;
export type TimePickerSemanticClassNames = {
    root?: string;
    prefix?: string;
    input?: string;
    suffix?: string;
};
export type TimePickerSemanticStyles = {
    root?: React.CSSProperties;
    prefix?: React.CSSProperties;
    input?: React.CSSProperties;
    suffix?: React.CSSProperties;
};
export type TimePickerPanelSemanticName = keyof TimePickerPanelSemanticClassNames & keyof TimePickerPanelSemanticStyles;
export type TimePickerPanelSemanticClassNames = {
    root?: string;
    content?: string;
    item?: string;
    footer?: string;
    container?: string;
};
export type TimePickerPanelSemanticStyles = {
    root?: React.CSSProperties;
    content?: React.CSSProperties;
    item?: React.CSSProperties;
    footer?: React.CSSProperties;
    container?: React.CSSProperties;
};
export type TimePickerClassNames = SemanticClassNamesType<TimePickerProps, TimePickerSemanticClassNames, {
    popup?: string | TimePickerPanelSemanticClassNames;
}>;
export type TimePickerStyles = SemanticStylesType<TimePickerProps, TimePickerSemanticStyles, {
    popup?: TimePickerPanelSemanticStyles;
}>;
export type PickerTimeProps<DateType extends AnyObject> = PickerPropsWithMultiple<DateType, GenericTimePickerProps<DateType>>;
export type RangePickerTimeProps<DateType extends AnyObject> = Omit<RangePickerProps<DateType>, 'showTime' | 'picker'>;
export interface TimePickerLocale {
    placeholder?: string;
    rangePlaceholder?: [string, string];
}
export interface TimeRangePickerProps extends Omit<RangePickerTimeProps<Dayjs>, 'picker'> {
    /** @deprecated Please use `classNames.popup` instead */
    popupClassName?: string;
    /** @deprecated Please use `styles.popup` instead */
    popupStyle?: React.CSSProperties;
}
declare const RangePicker: React.ForwardRefExoticComponent<TimeRangePickerProps & React.RefAttributes<PickerRef>>;
export interface TimePickerProps extends Omit<PickerTimeProps<Dayjs>, 'picker' | 'classNames' | 'styles'> {
    addon?: () => React.ReactNode;
    status?: InputStatus;
    /** @deprecated Please use `classNames.popup` instead */
    popupClassName?: string;
    /** @deprecated Please use `styles.popup` instead */
    popupStyle?: React.CSSProperties;
    rootClassName?: string;
    classNames?: TimePickerClassNames;
    styles?: TimePickerStyles;
}
declare const TimePicker: React.ForwardRefExoticComponent<Omit<TimePickerProps, "ref"> & React.RefAttributes<PickerRef>>;
declare const PurePanel: (props: AnyObject) => React.JSX.Element;
type MergedTimePicker = typeof TimePicker & {
    RangePicker: typeof RangePicker;
    _InternalPanelDoNotUseOrYouWillBeFired: typeof PurePanel;
};
declare const _default: MergedTimePicker;
export default _default;
