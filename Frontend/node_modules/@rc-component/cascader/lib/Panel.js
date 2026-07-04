"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = Panel;
var _clsx = require("clsx");
var _util = require("@rc-component/util");
var React = _interopRequireWildcard(require("react"));
var _context = _interopRequireDefault(require("./context"));
var _useMissingValues = _interopRequireDefault(require("./hooks/useMissingValues"));
var _useOptions = _interopRequireDefault(require("./hooks/useOptions"));
var _useSelect = _interopRequireDefault(require("./hooks/useSelect"));
var _useValues = _interopRequireDefault(require("./hooks/useValues"));
var _List = _interopRequireDefault(require("./OptionList/List"));
var _commonUtil = require("./utils/commonUtil");
var _treeUtil = require("./utils/treeUtil");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function noop() {}
function Panel(props) {
  const {
    prefixCls = 'rc-cascader',
    style,
    className,
    options,
    checkable,
    defaultValue,
    value,
    fieldNames,
    changeOnSelect,
    onChange,
    showCheckedStrategy,
    loadData,
    expandTrigger,
    expandIcon = '>',
    loadingIcon,
    direction,
    notFoundContent = 'Not Found',
    disabled,
    optionRender
  } = props;

  // ======================== Multiple ========================
  const multiple = !!checkable;

  // ========================= Values =========================
  const [interanlRawValues, setRawValues] = (0, _util.useControlledState)(defaultValue, value);
  const rawValues = (0, _commonUtil.toRawValues)(interanlRawValues);

  // ========================= FieldNames =========================
  const mergedFieldNames = React.useMemo(() => (0, _commonUtil.fillFieldNames)(fieldNames), /* eslint-disable react-hooks/exhaustive-deps */
  [JSON.stringify(fieldNames)]
  /* eslint-enable react-hooks/exhaustive-deps */);

  // =========================== Option ===========================
  const [mergedOptions, getPathKeyEntities, getValueByKeyPath] = (0, _useOptions.default)(mergedFieldNames, options);

  // ========================= Values =========================
  const getMissingValues = (0, _useMissingValues.default)(mergedOptions, mergedFieldNames);

  // Fill `rawValues` with checked conduction values
  const [checkedValues, halfCheckedValues, missingCheckedValues] = (0, _useValues.default)(multiple, rawValues, getPathKeyEntities, getValueByKeyPath, getMissingValues);

  // =========================== Change ===========================
  const triggerChange = (0, _util.useEvent)(nextValues => {
    setRawValues(nextValues);

    // Save perf if no need trigger event
    if (onChange) {
      const nextRawValues = (0, _commonUtil.toRawValues)(nextValues);
      const valueOptions = nextRawValues.map(valueCells => (0, _treeUtil.toPathOptions)(valueCells, mergedOptions, mergedFieldNames).map(valueOpt => valueOpt.option));
      const triggerValues = multiple ? nextRawValues : nextRawValues[0];
      const triggerOptions = multiple ? valueOptions : valueOptions[0];
      onChange(triggerValues, triggerOptions);
    }
  });

  // =========================== Select ===========================
  const handleSelection = (0, _useSelect.default)(multiple, triggerChange, checkedValues, halfCheckedValues, missingCheckedValues, getPathKeyEntities, getValueByKeyPath, showCheckedStrategy);
  const onInternalSelect = (0, _util.useEvent)(valuePath => {
    handleSelection(valuePath);
  });

  // ======================== Context =========================
  const cascaderContext = React.useMemo(() => ({
    options: mergedOptions,
    fieldNames: mergedFieldNames,
    values: checkedValues,
    halfValues: halfCheckedValues,
    changeOnSelect,
    onSelect: onInternalSelect,
    checkable,
    searchOptions: [],
    popupPrefixCls: undefined,
    loadData,
    expandTrigger,
    expandIcon,
    loadingIcon,
    popupMenuColumnStyle: undefined,
    optionRender
  }), [mergedOptions, mergedFieldNames, checkedValues, halfCheckedValues, changeOnSelect, onInternalSelect, checkable, loadData, expandTrigger, expandIcon, loadingIcon, optionRender]);

  // ========================= Render =========================
  const panelPrefixCls = `${prefixCls}-panel`;
  const isEmpty = !mergedOptions.length;
  return /*#__PURE__*/React.createElement(_context.default.Provider, {
    value: cascaderContext
  }, /*#__PURE__*/React.createElement("div", {
    className: (0, _clsx.clsx)(panelPrefixCls, {
      [`${panelPrefixCls}-rtl`]: direction === 'rtl',
      [`${panelPrefixCls}-empty`]: isEmpty
    }, className),
    style: style
  }, isEmpty ? notFoundContent : /*#__PURE__*/React.createElement(_List.default, {
    prefixCls: prefixCls,
    searchValue: "",
    multiple: multiple,
    toggleOpen: noop,
    open: true,
    direction: direction,
    disabled: disabled
  })));
}