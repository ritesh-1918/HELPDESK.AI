"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _ca_ES = _interopRequireDefault(require("@rc-component/picker/locale/ca_ES"));
var _ca_ES2 = _interopRequireDefault(require("../../time-picker/locale/ca_ES"));
// Merge into a locale object
const locale = {
  lang: {
    placeholder: 'Seleccionar data',
    rangePlaceholder: ['Data inicial', 'Data final'],
    ..._ca_ES.default
  },
  timePickerLocale: {
    ..._ca_ES2.default
  }
};
// All settings at:
// https://github.com/ant-design/ant-design/blob/master/components/date-picker/locale/example.json
var _default = exports.default = locale;