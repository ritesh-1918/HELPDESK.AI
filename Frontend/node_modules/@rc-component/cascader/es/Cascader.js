function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
import { BaseSelect } from '@rc-component/select';
import useId from "@rc-component/util/es/hooks/useId";
import useEvent from "@rc-component/util/es/hooks/useEvent";
import useControlledState from "@rc-component/util/es/hooks/useControlledState";
import * as React from 'react';
import CascaderContext from "./context";
import useDisplayValues from "./hooks/useDisplayValues";
import useMissingValues from "./hooks/useMissingValues";
import useOptions from "./hooks/useOptions";
import useSearchConfig from "./hooks/useSearchConfig";
import useSearchOptions from "./hooks/useSearchOptions";
import useSelect from "./hooks/useSelect";
import useValues from "./hooks/useValues";
import OptionList from "./OptionList";
import Panel from "./Panel";
import { fillFieldNames, SHOW_CHILD, SHOW_PARENT, toPathKeys, toRawValues } from "./utils/commonUtil";
import { formatStrategyValues, toPathOptions } from "./utils/treeUtil";
import { warningNullOptions } from "./utils/warningPropsUtil";
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
    showCheckedStrategy = SHOW_PARENT,
    optionRender,
    ...restProps
  } = props;
  const mergedId = useId(id);
  const multiple = !!checkable;

  // =========================== Values ===========================
  const [interanlRawValues, setRawValues] = useControlledState(defaultValue, value);
  const rawValues = toRawValues(interanlRawValues);

  // ========================= FieldNames =========================
  const mergedFieldNames = React.useMemo(() => fillFieldNames(fieldNames), /* eslint-disable react-hooks/exhaustive-deps */
  [JSON.stringify(fieldNames)]
  /* eslint-enable react-hooks/exhaustive-deps */);

  // =========================== Option ===========================
  const [mergedOptions, getPathKeyEntities, getValueByKeyPath] = useOptions(mergedFieldNames, options);

  // =========================== Search ===========================
  const [mergedShowSearch, searchConfig] = useSearchConfig(showSearch, props);
  const {
    autoClearSearchValue = true,
    searchValue,
    onSearch
  } = searchConfig;
  const [internalSearchValue, setSearchValue] = useControlledState('', searchValue);
  const mergedSearchValue = internalSearchValue || '';
  const onInternalSearch = (searchText, info) => {
    setSearchValue(searchText);
    if (info.source !== 'blur' && onSearch) {
      onSearch(searchText);
    }
  };
  const searchOptions = useSearchOptions(mergedSearchValue, mergedOptions, mergedFieldNames, popupPrefixCls || prefixCls, searchConfig, changeOnSelect || multiple);

  // =========================== Values ===========================
  const getMissingValues = useMissingValues(mergedOptions, mergedFieldNames);

  // Fill `rawValues` with checked conduction values
  const [checkedValues, halfCheckedValues, missingCheckedValues] = useValues(multiple, rawValues, getPathKeyEntities, getValueByKeyPath, getMissingValues);
  const deDuplicatedValues = React.useMemo(() => {
    const checkedKeys = toPathKeys(checkedValues);
    const deduplicateKeys = formatStrategyValues(checkedKeys, getPathKeyEntities, showCheckedStrategy);
    return [...missingCheckedValues, ...getValueByKeyPath(deduplicateKeys)];
  }, [checkedValues, getPathKeyEntities, getValueByKeyPath, missingCheckedValues, showCheckedStrategy]);
  const displayValues = useDisplayValues(deDuplicatedValues, mergedOptions, mergedFieldNames, multiple, displayRender);

  // =========================== Change ===========================
  const triggerChange = useEvent(nextValues => {
    setRawValues(nextValues);

    // Save perf if no need trigger event
    if (onChange) {
      const nextRawValues = toRawValues(nextValues);
      const valueOptions = nextRawValues.map(valueCells => toPathOptions(valueCells, mergedOptions, mergedFieldNames).map(valueOpt => valueOpt.option));
      const triggerValues = multiple ? nextRawValues : nextRawValues[0];
      const triggerOptions = multiple ? valueOptions : valueOptions[0];
      onChange(triggerValues, triggerOptions);
    }
  });

  // =========================== Select ===========================
  const handleSelection = useSelect(multiple, triggerChange, checkedValues, halfCheckedValues, missingCheckedValues, getPathKeyEntities, getValueByKeyPath, showCheckedStrategy);
  const onInternalSelect = useEvent(valuePath => {
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
    warningNullOptions(mergedOptions, mergedFieldNames);
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
  return /*#__PURE__*/React.createElement(CascaderContext.Provider, {
    value: cascaderContext
  }, /*#__PURE__*/React.createElement(BaseSelect, _extends({}, restProps, {
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
    OptionList: OptionList,
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
Cascader.SHOW_PARENT = SHOW_PARENT;
Cascader.SHOW_CHILD = SHOW_CHILD;
Cascader.Panel = Panel;
export default Cascader;