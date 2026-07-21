"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _PurePanel = _interopRequireDefault(require("../_util/PurePanel"));
var _warning = require("../_util/warning");
var _datePicker = _interopRequireDefault(require("../date-picker"));
var _useMergedPickerSemantic = _interopRequireDefault(require("../date-picker/hooks/useMergedPickerSemantic"));
var _useVariants = _interopRequireDefault(require("../form/hooks/useVariants"));
const {
  TimePicker: InternalTimePicker,
  RangePicker: InternalRangePicker
} = _datePicker.default;
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
    const warning = (0, _warning.devUseWarning)('TimePicker');
    warning.deprecated(!addon, 'addon', 'renderExtraFooter');
  }
  const [mergedVariant] = (0, _useVariants.default)('timePicker', variant, bordered);
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
  const [mergedClassNames, mergedStyles] = (0, _useMergedPickerSemantic.default)('timePicker', classNames, styles, popupClassName, popupStyle, mergedProps);
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
const PurePanel = (0, _PurePanel.default)(TimePicker, 'popupAlign', undefined, 'picker');
TimePicker._InternalPanelDoNotUseOrYouWillBeFired = PurePanel;
TimePicker.RangePicker = RangePicker;
TimePicker._InternalPanelDoNotUseOrYouWillBeFired = PurePanel;
var _default = exports.default = TimePicker;