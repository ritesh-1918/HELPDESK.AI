"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _select = require("@rc-component/select");
var _useId = _interopRequireDefault(require("@rc-component/util/lib/hooks/useId"));
var _useEvent = _interopRequireDefault(require("@rc-component/util/lib/hooks/useEvent"));
var _useControlledState = _interopRequireDefault(require("@rc-component/util/lib/hooks/useControlledState"));
var React = _interopRequireWildcard(require("react"));
var _context = _interopRequireDefault(require("./context"));
var _useDisplayValues = _interopRequireDefault(require("./hooks/useDisplayValues"));
var _useMissingValues = _interopRequireDefault(require("./hooks/useMissingValues"));
var _useOptions = _interopRequireDefault(require("./hooks/useOptions"));
var _useSearchConfig = _interopRequireDefault(require("./hooks/useSearchConfig"));
var _useSearchOptions = _interopRequireDefault(require("./hooks/useSearchOptions"));
var _useSelect = _interopRequireDefault(require("./hooks/useSelect"));
var _useValues = _interopRequireDefault(require("./hooks/useValues"));
var _OptionList = _interopRequireDefault(require("./OptionList"));
var _Panel = _interopRequireDefault(require("./Panel"));
var _commonUtil = require("./utils/commonUtil");
var _treeUtil = require("./utils/treeUtil");
var _warningPropsUtil = require("./utils/warningPropsUtil");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
const Cascader = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    // MISC
    id,
    prefixCls = 'rc-cascader',
    fieldNames,
    // Value
    defaultValue,
    value,
    changeOnSelect,
    onChange,
    displayRender,
    checkable,
    // Search
    showSearch,
    // Trigger
    expandTrigger,
    // Options
    options,
    popupPrefixCls,
    loadData,
    open,
    popupClassName,
    popupMenuColumnStyle,
    popupStyle: customPopupStyle,
    classNames,
    styles,
    placement,
    onPopupVisibleChange,
    // Icon
    expandIcon = '>',
    loadingIcon,
    // Children
    children,
    popupMatchSelectWidth = false,
    showCheckedStrategy = _commonUtil.SHOW_PARENT,
    optionRender,
    ...restProps
  } = props;
  const mergedId = (0, _useId.default)(id);
  const multiple = !!checkable;

  // =========================== Values ===========================
  const [interanlRawValues, setRawValues] = (0, _useControlledState.default)(defaultValue, value);
  const rawValues = (0, _commonUtil.toRawValues)(interanlRawValues);

  // ========================= FieldNames =========================
  const mergedFieldNames = React.useMemo(() => (0, _commonUtil.fillFieldNames)(fieldNames), /* eslint-disable react-hooks/exhaustive-deps */
  [JSON.stringify(fieldNames)]
  /* eslint-enable react-hooks/exhaustive-deps */);

  // =========================== Option ===========================
  const [mergedOptions, getPathKeyEntities, getValueByKeyPath] = (0, _useOptions.default)(mergedFieldNames, options);

  // =========================== Search ===========================
  const [mergedShowSearch, searchConfig] = (0, _useSearchConfig.default)(showSearch, props);
  const {
    autoClearSearchValue = true,
    searchValue,
    onSearch
  } = searchConfig;
  const [internalSearchValue, setSearchValue] = (0, _useControlledState.default)('', searchValue);
  const mergedSearchValue = internalSearchValue || '';
  const onInternalSearch = (searchText, info) => {
    setSearchValue(searchText);
    if (info.source !== 'blur' && onSearch) {
      onSearch(searchText);
    }
  };
  const searchOptions = (0, _useSearchOptions.default)(mergedSearchValue, mergedOptions, mergedFieldNames, popupPrefixCls || prefixCls, searchConfig, changeOnSelect || multiple);

  // =========================== Values ===========================
  const getMissingValues = (0, _useMissingValues.default)(mergedOptions, mergedFieldNames);

  // Fill `rawValues` with checked conduction values
  const [checkedValues, halfCheckedValues, missingCheckedValues] = (0, _useValues.default)(multiple, rawValues, getPathKeyEntities, getValueByKeyPath, getMissingValues);
  const deDuplicatedValues = React.useMemo(() => {
    const checkedKeys = (0, _commonUtil.toPathKeys)(checkedValues);
    const deduplicateKeys = (0, _treeUtil.formatStrategyValues)(checkedKeys, getPathKeyEntities, showCheckedStrategy);
    return [...missingCheckedValues, ...getValueByKeyPath(deduplicateKeys)];
  }, [checkedValues, getPathKeyEntities, getValueByKeyPath, missingCheckedValues, showCheckedStrategy]);
  const displayValues = (0, _useDisplayValues.default)(deDuplicatedValues, mergedOptions, mergedFieldNames, multiple, displayRender);

  // =========================== Change ===========================
  const triggerChange = (0, _useEvent.default)(nextValues => {
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
  const onInternalSelect = (0, _useEvent.default)(valuePath => {
    if (!multiple || autoClearSearchValue) {
      setSearchValue('');
    }
    handleSelection(valuePath);
  });

  // Display Value change logic
  const onDisplayValuesChange = (_, info) => {
    if (info.type === 'clear') {
      triggerChange([]);
      return;
    }

    // Cascader do not support `add` type. Only support `remove`
    const {
      valueCells
    } = info.values[0];
    onInternalSelect(valueCells);
  };
  const onInternalPopupVisibleChange = nextVisible => {
    onPopupVisibleChange?.(nextVisible);
  };

  // ========================== Warning ===========================
  if (process.env.NODE_ENV !== 'production') {
    (0, _warningPropsUtil.warningNullOptions)(mergedOptions, mergedFieldNames);
  }

  // ========================== Context ===========================
  const cascaderContext = React.useMemo(() => ({
    classNames,
    styles,
    options: mergedOptions,
    fieldNames: mergedFieldNames,
    values: checkedValues,
    halfValues: halfCheckedValues,
    changeOnSelect,
    onSelect: onInternalSelect,
    checkable,
    searchOptions,
    popupPrefixCls,
    loadData,
    expandTrigger,
    expandIcon,
    loadingIcon,
    popupMenuColumnStyle,
    optionRender
  }), [classNames, styles, mergedOptions, mergedFieldNames, checkedValues, halfCheckedValues, changeOnSelect, onInternalSelect, checkable, searchOptions, popupPrefixCls, loadData, expandTrigger, expandIcon, loadingIcon, popupMenuColumnStyle, optionRender]);

  // ==============================================================
  // ==                          Render                          ==
  // ==============================================================
  const emptyOptions = !(mergedSearchValue ? searchOptions : mergedOptions).length;
  const popupStyle =
  // Search to match width
  mergedSearchValue && searchConfig.matchInputWidth ||
  // Empty keep the width
  emptyOptions ? {} : {
    minWidth: 'auto'
  };
  return /*#__PURE__*/React.createElement(_context.default.Provider, {
    value: cascaderContext
  }, /*#__PURE__*/React.createElement(_select.BaseSelect, _extends({}, restProps, {
    // MISC
    ref: ref,
    id: mergedId,
    prefixCls: prefixCls,
    autoClearSearchValue: autoClearSearchValue,
    popupMatchSelectWidth: popupMatchSelectWidth,
    classNames: classNames,
    styles: styles,
    popupStyle: {
      ...popupStyle,
      ...customPopupStyle
    }
    // Value
    ,
    displayValues: displayValues,
    onDisplayValuesChange: onDisplayValuesChange,
    mode: multiple ? 'multiple' : undefined
    // Search
    ,
    searchValue: mergedSearchValue,
    onSearch: onInternalSearch,
    showSearch: mergedShowSearch
    // Options
    ,
    OptionList: _OptionList.default,
    emptyOptions: emptyOptions
    // Open
    ,
    open: open,
    popupClassName: popupClassName,
    placement: placement,
    onPopupVisibleChange: onInternalPopupVisibleChange
    // Children
    ,
    getRawInputElement: () => children
  })));
});
if (process.env.NODE_ENV !== 'production') {
  Cascader.displayName = 'Cascader';
}
Cascader.SHOW_PARENT = _commonUtil.SHOW_PARENT;
Cascader.SHOW_CHILD = _commonUtil.SHOW_CHILD;
Cascader.Panel = _Panel.default;
var _default = exports.default = Cascader;