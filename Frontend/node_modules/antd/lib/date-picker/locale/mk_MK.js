"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _mk_MK = _interopRequireDefault(require("@rc-component/picker/locale/mk_MK"));
var _mk_MK2 = _interopRequireDefault(require("../../time-picker/locale/mk_MK"));
// Merge into a locale object
const locale = {
  lang: {
    placeholder: 'Избери датум',
    rangePlaceholder: ['Од датум', 'До датум'],
    ..._mk_MK.default
  },
  timePickerLocale: {
    ..._mk_MK2.default
  }
};
// All settings at:
// https://github.com/ant-design/ant-design/blob/master/components/date-picker/locale/example.json
var _default = exports.default = locale;