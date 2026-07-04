import * as React from 'react';
export var SharedPanelContext = /*#__PURE__*/React.createContext(null);
/** Used for each single Panel. e.g. DatePanel */
export var PanelContext = /*#__PURE__*/React.createContext(null);
export function usePanelContext() {
  return React.useContext(PanelContext);
}

/**
 * Get shared props for the SharedPanelProps interface.
 */
export function useInfo(props, panelType) {
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
export var PickerHackContext = /*#__PURE__*/React.createContext({});
if (process.env.NODE_ENV !== 'production') {
  PickerHackContext.displayName = 'PickerHackContext';
}