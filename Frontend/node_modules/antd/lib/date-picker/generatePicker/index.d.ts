import type { GenerateConfig } from '@rc-component/picker/generate/index';
import type { AnyObject } from '../../_util/type';
export type { DatePickerPanelSemanticClassNames, DatePickerPanelSemanticName, DatePickerPanelSemanticStyles, DatePickerSemanticClassNames, DatePickerSemanticName, DatePickerSemanticStyles, PickerLocale, PickerProps, } from './interface';
declare const generatePicker: <DateType extends AnyObject = AnyObject>(generateConfig: GenerateConfig<DateType>) => (<ValueType = DateType, IsMultiple extends boolean = false>(props: import("./interface").PickerPropsWithMultiple<DateType, import("./interface").PickerProps<DateType>, ValueType, IsMultiple>) => React.ReactElement) & {
    displayName?: string;
} & {
    displayName?: string;
    WeekPicker: (<ValueType = DateType, IsMultiple extends boolean = false>(props: import("./interface").PickerPropsWithMultiple<DateType, Omit<import("./interface").PickerProps<DateType>, "picker">, ValueType, IsMultiple>) => React.ReactElement) & {
        displayName?: string;
    };
    MonthPicker: (<ValueType = DateType, IsMultiple extends boolean = false>(props: import("./interface").PickerPropsWithMultiple<DateType, Omit<import("./interface").PickerProps<DateType>, "picker">, ValueType, IsMultiple>) => React.ReactElement) & {
        displayName?: string;
    };
    YearPicker: (<ValueType = DateType, IsMultiple extends boolean = false>(props: import("./interface").PickerPropsWithMultiple<DateType, Omit<import("./interface").PickerProps<DateType>, "picker">, ValueType, IsMultiple>) => React.ReactElement) & {
        displayName?: string;
    };
    RangePicker: import("react").ForwardRefExoticComponent<Omit<import("@rc-component/picker").RangePickerProps<DateType>, "classNames" | "styles" | "locale" | "generateConfig" | "hideHeader"> & {
        locale?: import("./interface").PickerLocale;
        size?: import("../../button").ButtonSize;
        placement?: "bottomLeft" | "bottomRight" | "topLeft" | "topRight";
        bordered?: boolean;
        status?: import("../../_util/statusUtils").InputStatus;
        variant?: import("../../config-provider").Variant;
        dropdownClassName?: string;
        popupClassName?: string;
        rootClassName?: string;
        popupStyle?: React.CSSProperties;
        classNames?: import("./interface").DatePickerPickerClassNames<import("@rc-component/picker").RangePickerProps<DateType>> | undefined;
        styles?: import("./interface").DatePickerStylesType<import("@rc-component/picker").RangePickerProps<DateType>> | undefined;
    } & import("react").RefAttributes<import("@rc-component/picker").PickerRef>>;
    TimePicker: (<ValueType = DateType, IsMultiple extends boolean = false>(props: import("./interface").PickerPropsWithMultiple<DateType, Omit<import("./interface").GenericTimePickerProps<DateType>, "picker">, ValueType, IsMultiple>) => React.ReactElement) & {
        displayName?: string;
    };
    QuarterPicker: (<ValueType = DateType, IsMultiple extends boolean = false>(props: import("./interface").PickerPropsWithMultiple<DateType, Omit<import("./interface").PickerProps<DateType>, "picker">, ValueType, IsMultiple>) => React.ReactElement) & {
        displayName?: string;
    };
};
export default generatePicker;
