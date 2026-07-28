"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useDisabledBoundary;
var _util = require("@rc-component/util");
var _dateUtil = require("../../utils/dateUtil");
/**
 * Merge `disabledDate` with `minDate` & `maxDate`.
 */
function useDisabledBoundary(generateConfig, locale, disabledDate, minDate, maxDate) {
  var mergedDisabledDate = (0, _util.useEvent)(function (date, info) {
    if (disabledDate && disabledDate(date, info)) {
      return true;
    }
    if (minDate && generateConfig.isAfter(minDate, date) && !(0, _dateUtil.isSame)(generateConfig, locale, minDate, date, info.type)) {
      return true;
    }
    if (maxDate && generateConfig.isAfter(date, maxDate) && !(0, _dateUtil.isSame)(generateConfig, locale, maxDate, date, info.type)) {
      return true;
    }
    return false;
  });
  return mergedDisabledDate;
}