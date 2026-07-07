"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _util = require("@rc-component/util");
var _PurePanel = _interopRequireDefault(require("../_util/PurePanel"));
var _select = _interopRequireDefault(require("../select"));
var _AutoComplete = _interopRequireDefault(require("./AutoComplete"));
const {
  Option
} = _select.default;
// We don't care debug panel
/* istanbul ignore next */
const PurePanel = (0, _PurePanel.default)(_AutoComplete.default, 'popupAlign', props => (0, _util.omit)(props, ['visible']));
const AutoComplete = _AutoComplete.default;
AutoComplete.Option = Option;
AutoComplete._InternalPanelDoNotUseOrYouWillBeFired = PurePanel;
var _default = exports.default = AutoComplete;