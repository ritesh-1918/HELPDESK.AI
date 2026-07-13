"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _mr_IN = _interopRequireDefault(require("@rc-component/picker/locale/mr_IN"));
var _mr_IN2 = _interopRequireDefault(require("../../time-picker/locale/mr_IN"));
// Merge into a locale object
const locale = {
  lang: {
    placeholder: 'दिनांक निवडा',
    yearPlaceholder: 'वर्ष निवडा',
    quarterPlaceholder: 'तिमाही निवडा',
    monthPlaceholder: 'महिना निवडा',
    weekPlaceholder: 'आठवडा निवडा',
    rangePlaceholder: ['प्रारंभ तारीख', 'शेवटची तारीख'],
    rangeYearPlaceholder: ['प्रारंभ वर्ष', 'शेवटचे वर्ष'],
    rangeQuarterPlaceholder: ['सुरुवातीचा तिमाही', 'शेवटचा तिमाही'],
    rangeMonthPlaceholder: ['सुरुवातीचा महिना', 'शेवटचा महिना'],
    rangeWeekPlaceholder: ['सुरुवातीचा आठवडा', 'शेवटचा आठवडा'],
    ..._mr_IN.default
  },
  timePickerLocale: {
    ..._mr_IN2.default
  }
};
// All settings at:
// https://github.com/ant-design/ant-design/blob/master/components/date-picker/locale/example.json
var _default = exports.default = locale;