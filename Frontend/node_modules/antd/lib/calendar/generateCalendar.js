"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _picker = require("@rc-component/picker");
var _util = require("@rc-component/util");
var _clsx = require("clsx");
var _hooks = require("../_util/hooks");
var _warning = require("../_util/warning");
var _context = require("../config-provider/context");
var _locale = require("../locale");
var _Header = _interopRequireDefault(require("./Header"));
var _en_US = _interopRequireDefault(require("./locale/en_US"));
var _style = _interopRequireDefault(require("./style"));
const isSameYear = (date1, date2, config) => {
  const {
    getYear
  } = config;
  return date1 && date2 && getYear(date1) === getYear(date2);
};
const isSameMonth = (date1, date2, config) => {
  const {
    getMonth
  } = config;
  return isSameYear(date1, date2, config) && getMonth(date1) === getMonth(date2);
};
const isSameDate = (date1, date2, config) => {
  const {
    getDate
  } = config;
  return isSameMonth(date1, date2, config) && getDate(date1) === getDate(date2);
};
const generateCalendar = generateConfig => {
  const Calendar = props => {
    const {
      prefixCls: customizePrefixCls,
      className,
      rootClassName,
      style,
      dateFullCellRender,
      dateCellRender,
      monthFullCellRender,
      monthCellRender,
      cellRender,
      fullCellRender,
      headerRender,
      value,
      defaultValue,
      disabledDate,
      mode,
      validRange,
      fullscreen = true,
      showWeek,
      onChange,
      onPanelChange,
      onSelect,
      styles,
      classNames
    } = props;
    const {
      getPrefixCls,
      direction,
      className: contextClassName,
      style: contextStyle,
      classNames: contextClassNames,
      styles: contextStyles
    } = (0, _context.useComponentConfig)('calendar');
    // =========== Merged Props for Semantic ===========
    const mergedProps = {
      ...props,
      mode,
      fullscreen,
      showWeek
    };
    const [mergedClassNames, mergedStyles] = (0, _hooks.useMergeSemantic)([contextClassNames, classNames], [contextStyles, styles], {
      props: mergedProps
    });
    const [rootCls, headerCls, panelClassNames, rootStyle, headerStyle, panelStyles] = React.useMemo(() => {
      const {
        root: nextRootClassName,
        header: nextHeaderClassName,
        ...nextPanelClassNames
      } = mergedClassNames;
      const {
        root: nextRootStyle,
        header: nextHeaderStyle,
        ...nextPanelStyles
      } = mergedStyles;
      return [nextRootClassName, nextHeaderClassName, nextPanelClassNames, nextRootStyle, nextHeaderStyle, nextPanelStyles];
    }, [mergedClassNames, mergedStyles]);
    const prefixCls = getPrefixCls('picker', customizePrefixCls);
    const calendarPrefixCls = `${prefixCls}-calendar`;
    const [hashId, cssVarCls] = (0, _style.default)(prefixCls, calendarPrefixCls);
    const today = generateConfig.getNow();
    // ====================== Warning =======================
    if (process.env.NODE_ENV !== 'production') {
      const warning = (0, _warning.devUseWarning)('Calendar');
      [['dateFullCellRender', 'fullCellRender'], ['dateCellRender', 'cellRender'], ['monthFullCellRender', 'fullCellRender'], ['monthCellRender', 'cellRender']].forEach(([deprecatedName, newName]) => {
        warning.deprecated(!(deprecatedName in props), deprecatedName, newName);
      });
    }
    // ====================== State =======================
    // Value
    const [mergedValue, setMergedValue] = (0, _util.useControlledState)(() => defaultValue || generateConfig.getNow(), value);
    // Mode
    const [mergedMode, setMergedMode] = (0, _util.useControlledState)('month', mode);
    const panelMode = React.useMemo(() => mergedMode === 'year' ? 'month' : 'date', [mergedMode]);
    // Disabled Date
    const mergedDisabledDate = React.useCallback(date => {
      const notInRange = validRange ? generateConfig.isAfter(validRange[0], date) || generateConfig.isAfter(date, validRange[1]) : false;
      return notInRange || !!disabledDate?.(date);
    }, [disabledDate, validRange]);
    // ====================== Events ======================
    const triggerPanelChange = (date, newMode) => {
      onPanelChange?.(date, newMode);
    };
    const triggerChange = date => {
      setMergedValue(date);
      if (!isSameDate(date, mergedValue, generateConfig)) {
        // Trigger when month panel switch month
        if (panelMode === 'date' && !isSameMonth(date, mergedValue, generateConfig) || panelMode === 'month' && !isSameYear(date, mergedValue, generateConfig)) {
          triggerPanelChange(date, mergedMode);
        }
        onChange?.(date);
      }
    };
    const triggerModeChange = newMode => {
      setMergedMode(newMode);
      triggerPanelChange(mergedValue, newMode);
    };
    const onInternalSelect = (date, source) => {
      triggerChange(date);
      onSelect?.(date, {
        source
      });
    };
    // ====================== Render ======================
    const dateRender = React.useCallback((date, info) => {
      if (fullCellRender) {
        return fullCellRender(date, info);
      }
      if (dateFullCellRender) {
        return dateFullCellRender(date);
      }
      return /*#__PURE__*/React.createElement("div", {
        className: (0, _clsx.clsx)(`${prefixCls}-cell-inner`, `${calendarPrefixCls}-date`, {
          [`${calendarPrefixCls}-date-today`]: isSameDate(today, date, generateConfig)
        })
      }, /*#__PURE__*/React.createElement("div", {
        className: `${calendarPrefixCls}-date-value`
      }, String(generateConfig.getDate(date)).padStart(2, '0')), /*#__PURE__*/React.createElement("div", {
        className: `${calendarPrefixCls}-date-content`
      }, typeof cellRender === 'function' ? cellRender(date, info) : dateCellRender?.(date)));
    }, [today, prefixCls, calendarPrefixCls, fullCellRender, dateFullCellRender, cellRender, dateCellRender]);
    const monthRender = React.useCallback((date, info) => {
      if (fullCellRender) {
        return fullCellRender(date, info);
      }
      if (monthFullCellRender) {
        return monthFullCellRender(date);
      }
      const months = info.locale.shortMonths || generateConfig.locale.getShortMonths(info.locale.locale);
      return /*#__PURE__*/React.createElement("div", {
        className: (0, _clsx.clsx)(`${prefixCls}-cell-inner`, `${calendarPrefixCls}-date`, {
          [`${calendarPrefixCls}-date-today`]: isSameMonth(today, date, generateConfig)
        })
      }, /*#__PURE__*/React.createElement("div", {
        className: `${calendarPrefixCls}-date-value`
      }, months[generateConfig.getMonth(date)]), /*#__PURE__*/React.createElement("div", {
        className: `${calendarPrefixCls}-date-content`
      }, typeof cellRender === 'function' ? cellRender(date, info) : monthCellRender?.(date)));
    }, [today, prefixCls, calendarPrefixCls, fullCellRender, monthFullCellRender, cellRender, monthCellRender]);
    const [contextLocale] = (0, _locale.useLocale)('Calendar', _en_US.default);
    const locale = (0, _util.merge)(contextLocale, props.locale || {});
    const mergedCellRender = (current, info) => {
      if (info.type === 'date') {
        return dateRender(current, info);
      }
      if (info.type === 'month') {
        return monthRender(current, {
          ...info,
          locale: locale?.lang
        });
      }
    };
    return /*#__PURE__*/React.createElement("div", {
      className: (0, _clsx.clsx)(calendarPrefixCls, {
        [`${calendarPrefixCls}-full`]: fullscreen,
        [`${calendarPrefixCls}-mini`]: !fullscreen,
        [`${calendarPrefixCls}-rtl`]: direction === 'rtl'
      }, contextClassName, className, rootClassName, rootCls, hashId, cssVarCls),
      style: {
        ...rootStyle,
        ...contextStyle,
        ...style
      }
    }, headerRender ? headerRender({
      value: mergedValue,
      type: mergedMode,
      onChange: nextDate => {
        onInternalSelect(nextDate, 'customize');
      },
      onTypeChange: triggerModeChange
    }) : (/*#__PURE__*/React.createElement(_Header.default, {
      className: headerCls,
      style: headerStyle,
      prefixCls: calendarPrefixCls,
      value: mergedValue,
      generateConfig: generateConfig,
      mode: mergedMode,
      fullscreen: fullscreen,
      locale: locale?.lang,
      validRange: validRange,
      onChange: onInternalSelect,
      onModeChange: triggerModeChange
    })), /*#__PURE__*/React.createElement(_picker.PickerPanel, {
      classNames: panelClassNames,
      styles: panelStyles,
      value: mergedValue,
      prefixCls: prefixCls,
      locale: locale?.lang,
      generateConfig: generateConfig,
      cellRender: mergedCellRender,
      onSelect: nextDate => {
        onInternalSelect(nextDate, panelMode);
      },
      mode: panelMode,
      picker: panelMode,
      disabledDate: mergedDisabledDate,
      hideHeader: true,
      showWeek: showWeek
    }));
  };
  if (process.env.NODE_ENV !== 'production') {
    Calendar.displayName = 'Calendar';
  }
  return Calendar;
};
var _default = exports.default = generateCalendar;