"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _lv_LV = _interopRequireDefault(require("@rc-component/picker/locale/lv_LV"));
var _lv_LV2 = _interopRequireDefault(require("../../time-picker/locale/lv_LV"));
// Merge into a locale object
const locale = {
  lang: {
    placeholder: 'Izvēlieties datumu',
    rangePlaceholder: ['Sākuma datums', 'Beigu datums'],
    ..._lv_LV.default
  },
  timePickerLocale: {
    ..._lv_LV2.default
  }
};
// All settings at:
// https://github.com/ant-design/ant-design/blob/master/components/date-picker/locale/example.json
var _default = exports.default = locale;