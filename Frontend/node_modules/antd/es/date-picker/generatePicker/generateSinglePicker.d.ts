import * as React from 'react';
import type { GenerateConfig } from '@rc-component/picker/generate/index';
import type { AnyObject } from '../../_util/type';
import type { GenericTimePickerProps, PickerProps, PickerPropsWithMultiple } from './interface';
declare const generatePicker: <DateType extends AnyObject = AnyObject>(generateConfig: GenerateConfig<DateType>) => {
    DatePicker: (<ValueType = DateType, IsMultiple extends boolean = false>(props: PickerPropsWithMultiple<DateType, PickerProps<DateType>, ValueType, IsMultiple>) => React.ReactElement) & {
        displayName?: string;
    };
    WeekPicker: (<ValueType = DateType, IsMultiple extends boolean = false>(props: PickerPropsWithMultiple<DateType, Omit<PickerProps<DateType>, "picker">, ValueType, IsMultiple>) => React.ReactElement) & {
        displayName?: string;
    };
    MonthPicker: (<ValueType = DateType, IsMultiple extends boolean = false>(props: PickerPropsWithMultiple<DateType, Omit<PickerProps<DateType>, "picker">, ValueType, IsMultiple>) => React.ReactElement) & {
        displayName?: string;
    };
    YearPicker: (<ValueType = DateType, IsMultiple extends boolean = false>(props: PickerPropsWithMultiple<DateType, Omit<PickerProps<DateType>, "picker">, ValueType, IsMultiple>) => React.ReactElement) & {
        displayName?: string;
    };
    TimePicker: (<ValueType = DateType, IsMultiple extends boolean = false>(props: PickerPropsWithMultiple<DateType, Omit<GenericTimePickerProps<DateType>, "picker">, ValueType, IsMultiple>) => React.ReactElement) & {
        displayName?: string;
    };
    QuarterPicker: (<ValueType = DateType, IsMultiple extends boolean = false>(props: PickerPropsWithMultiple<DateType, Omit<PickerProps<DateType>, "picker">, ValueType, IsMultiple>) => React.ReactElement) & {
        displayName?: string;
    };
};
export default generatePicker;
