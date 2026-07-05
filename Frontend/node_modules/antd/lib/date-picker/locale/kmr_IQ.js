"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _kmr_IQ = _interopRequireDefault(require("@rc-component/picker/locale/kmr_IQ"));
var _kmr_IQ2 = _interopRequireDefault(require("../../time-picker/locale/kmr_IQ"));
// Merge into a locale object
const locale = {
  lang: {
    placeholder: 'Dîrok hilbijêre',
    rangePlaceholder: ['Dîroka destpêkê', 'Dîroka dawîn'],
    ..._kmr_IQ.default
  },
  timePickerLocale: {
    ..._kmr_IQ2.default
  }
};
// All settings at:
// https://github.com/ant-design/ant-design/blob/master/components/date-picker/locale/example.json
var _default = exports.default = locale;