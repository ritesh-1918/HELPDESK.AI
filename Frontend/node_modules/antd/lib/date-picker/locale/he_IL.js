"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _he_IL = _interopRequireDefault(require("@rc-component/picker/locale/he_IL"));
var _he_IL2 = _interopRequireDefault(require("../../time-picker/locale/he_IL"));
// Merge into a locale object
const locale = {
  lang: {
    placeholder: 'בחר תאריך',
    rangePlaceholder: ['תאריך התחלה', 'תאריך סיום'],
    ..._he_IL.default
  },
  timePickerLocale: {
    ..._he_IL2.default
  }
};
// All settings at:
// https://github.com/ant-design/ant-design/blob/master/components/date-picker/locale/example.json
var _default = exports.default = locale;