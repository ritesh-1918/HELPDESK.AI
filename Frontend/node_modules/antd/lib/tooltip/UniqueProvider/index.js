"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireDefault(require("react"));
var _trigger = require("@rc-component/trigger");
var _MotionContent = _interopRequireDefault(require("./MotionContent"));
const cachedPlacements = [null, null];
function uniqueBuiltinPlacements(ori) {
  if (cachedPlacements[0] !== ori) {
    const target = {};
    Object.keys(ori).forEach(placement => {
      target[placement] = {
        ...ori[placement],
        dynamicInset: false
      };
    });
    cachedPlacements[0] = ori;
    cachedPlacements[1] = target;
  }
  return cachedPlacements[1];
}
const UniqueProvider = ({
  children
}) => {
  const renderPopup = options => {
    const {
      id,
      builtinPlacements,
      popup
    } = options;
    const popupEle = typeof popup === 'function' ? popup() : popup;
    const parsedPlacements = uniqueBuiltinPlacements(builtinPlacements);
    return {
      ...options,
      getPopupContainer: null,
      arrow: false,
      popup: /*#__PURE__*/_react.default.createElement(_MotionContent.default, {
        key: id
      }, popupEle),
      builtinPlacements: parsedPlacements
    };
  };
  return /*#__PURE__*/_react.default.createElement(_trigger.UniqueProvider, {
    postTriggerProps: renderPopup
  }, children);
};
var _default = exports.default = UniqueProvider;