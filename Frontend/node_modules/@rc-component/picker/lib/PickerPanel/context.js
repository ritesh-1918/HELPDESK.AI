"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SharedPanelContext = exports.PickerHackContext = exports.PanelContext = void 0;
exports.useInfo = useInfo;
exports.usePanelContext = usePanelContext;
var React = _interopRequireWildcard(require("react"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
var SharedPanelContext = exports.SharedPanelContext = /*#__PURE__*/React.createContext(null);
/** Used for each single Panel. e.g. DatePanel */
var PanelContext = exports.PanelContext = /*#__PURE__*/React.createContext(null);
function usePanelContext() {
  return React.useContext(PanelContext);
}

/**
 * Get shared props for the SharedPanelProps interface.
 */
function useInfo(props, panelType) {
  // TODO: this is not good to get from each props.
  // Should move to `SharedPanelContext` instead.
  var prefixCls = props.prefixCls,
    generateConfig = props.generateConfig,
    locale = props.locale,
    disabledDate = props.disabledDate,
    minDate = props.minDate,
    maxDate = props.maxDate,
    cellRender = props.cellRender,
    hoverValue = props.hoverValue,
    hoverRangeValue = props.hoverRangeValue,
    onHover = props.onHover,
    values = props.values,
    pickerValue = props.pickerValue,
    onSelect = props.onSelect,
    prevIcon = props.prevIcon,
    nextIcon = props.nextIcon,
    superPrevIcon = props.superPrevIcon,
    superNextIcon = props.superNextIcon;

  // ======================= Context ========================
  var _React$useContext = React.useContext(SharedPanelContext),
    classNames = _React$useContext.classNames,
    styles = _React$useContext.styles;

  // ========================= MISC =========================
  var now = generateConfig.getNow();

  // ========================= Info =========================
  var info = {
    now: now,
    values: values,
    pickerValue: pickerValue,
    prefixCls: prefixCls,
    classNames: classNames,
    styles: styles,
    disabledDate: disabledDate,
    minDate: minDate,
    maxDate: maxDate,
    cellRender: cellRender,
    hoverValue: hoverValue,
    hoverRangeValue: hoverRangeValue,
    onHover: onHover,
    locale: locale,
    generateConfig: generateConfig,
    onSelect: onSelect,
    panelType: panelType,
    // Icons
    prevIcon: prevIcon,
    nextIcon: nextIcon,
    superPrevIcon: superPrevIcon,
    superNextIcon: superNextIcon
  };
  return [info, now];
}

// ============================== Internal ==============================

/**
 * Internal usage for RangePicker to not to show the operation arrow
 */
var PickerHackContext = exports.PickerHackContext = /*#__PURE__*/React.createContext({});
if (process.env.NODE_ENV !== 'production') {
  PickerHackContext.displayName = 'PickerHackContext';
}