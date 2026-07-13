"use client";

import * as React from 'react';
import genPurePanel from '../_util/PurePanel';
import { devUseWarning } from '../_util/warning';
import DatePicker from '../date-picker';
import useMergedPickerSemantic from '../date-picker/hooks/useMergedPickerSemantic';
import useVariant from '../form/hooks/useVariants';
const {
  TimePicker: InternalTimePicker,
  RangePicker: InternalRangePicker
} = DatePicker;
const RangePicker = /*#__PURE__*/React.forwardRef((props, ref) => (/*#__PURE__*/React.createElement(InternalRangePicker, {
  ...props,
  picker: "time",
  mode: undefined,
  ref: ref
})));
const TimePicker = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    addon,
    renderExtraFooter,
    variant,
    bordered,
    classNames,
    styles,
    popupClassName,
    popupStyle,
    ...restProps
  } = props;
  // ====================== Warning =======================
  if (process.env.NODE_ENV !== 'production') {
    const warning = devUseWarning('TimePicker');
    warning.deprecated(!addon, 'addon', 'renderExtraFooter');
  }
  const [mergedVariant] = useVariant('timePicker', variant, bordered);
  const internalRenderExtraFooter = React.useMemo(() => {
    if (renderExtraFooter) {
      return renderExtraFooter;
    }
    if (addon) {
      return addon;
    }
    return undefined;
  }, [addon, renderExtraFooter]);
  // =========== Merged Props for Semantic ===========
  const mergedProps = {
    ...props,
    variant: mergedVariant
  };
  // =========== Merged Semantic ===========
  const [mergedClassNames, mergedStyles] = useMergedPickerSemantic('timePicker', classNames, styles, popupClassName, popupStyle, mergedProps);
  return /*#__PURE__*/React.createElement(InternalTimePicker, {
    ...restProps,
    mode: undefined,
    ref: ref,
    renderExtraFooter: internalRenderExtraFooter,
    variant: mergedVariant,
    classNames: mergedClassNames,
    styles: mergedStyles
  });
});
if (process.env.NODE_ENV !== 'production') {
  TimePicker.displayName = 'TimePicker';
}
// We don't care debug panel
/* istanbul ignore next */
const PurePanel = genPurePanel(TimePicker, 'popupAlign', undefined, 'picker');
TimePicker._InternalPanelDoNotUseOrYouWillBeFired = PurePanel;
TimePicker.RangePicker = RangePicker;
TimePicker._InternalPanelDoNotUseOrYouWillBeFired = PurePanel;
export default TimePicker;