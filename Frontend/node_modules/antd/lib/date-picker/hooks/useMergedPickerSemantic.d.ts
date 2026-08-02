import * as React from 'react';
import type { AnyObject } from '../../_util/type';
declare const useMergedPickerSemantic: <P extends AnyObject = AnyObject>(pickerType: "timePicker" | "datePicker", classNames?: P["classNames"], styles?: P["styles"], popupClassName?: string, popupStyle?: React.CSSProperties, mergedProps?: P) => readonly [classNames: import("..").DatePickerSemanticClassNames & {
    popup: import("..").DatePickerPanelSemanticClassNames;
}, styles: import("..").DatePickerSemanticStyles & {
    popup: import("..").DatePickerPanelSemanticStyles;
}];
export default useMergedPickerSemantic;
