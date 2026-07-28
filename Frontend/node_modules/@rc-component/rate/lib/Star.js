"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireDefault(require("react"));
var _KeyCode = _interopRequireDefault(require("@rc-component/util/lib/KeyCode"));
var _clsx = require("clsx");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function Star(props, ref) {
  const {
    disabled,
    prefixCls,
    character,
    characterRender,
    index,
    count,
    value,
    allowHalf,
    focused,
    onHover,
    onClick
  } = props;

  // =========================== Events ===========================
  const onInternalHover = e => {
    onHover(e, index);
  };
  const onInternalClick = e => {
    onClick(e, index);
  };
  const onInternalKeyDown = e => {
    if (e.keyCode === _KeyCode.default.ENTER) {
      onClick(e, index);
    }
  };

  // =========================== Render ===========================
  // >>>>> ClassName
  const starValue = index + 1;
  const classNameList = new Set([prefixCls]);

  // TODO: Current we just refactor from CC to FC. This logic seems can be optimized.
  if (value === 0 && index === 0 && focused) {
    classNameList.add(`${prefixCls}-focused`);
  } else if (allowHalf && value + 0.5 >= starValue && value < starValue) {
    classNameList.add(`${prefixCls}-half`);
    classNameList.add(`${prefixCls}-active`);
    if (focused) {
      classNameList.add(`${prefixCls}-focused`);
    }
  } else {
    if (starValue <= value) {
      classNameList.add(`${prefixCls}-full`);
    } else {
      classNameList.add(`${prefixCls}-zero`);
    }
    if (starValue === value && focused) {
      classNameList.add(`${prefixCls}-focused`);
    }
  }

  // >>>>> Node
  const characterNode = typeof character === 'function' ? character(props) : character;
  let start = /*#__PURE__*/_react.default.createElement("li", {
    className: (0, _clsx.clsx)(Array.from(classNameList)),
    ref: ref
  }, /*#__PURE__*/_react.default.createElement("div", {
    onClick: disabled ? null : onInternalClick,
    onKeyDown: disabled ? null : onInternalKeyDown,
    onMouseMove: disabled ? null : onInternalHover,
    role: "radio",
    "aria-checked": value > index ? 'true' : 'false',
    "aria-posinset": index + 1,
    "aria-setsize": count,
    tabIndex: disabled ? -1 : 0
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: `${prefixCls}-first`
  }, characterNode), /*#__PURE__*/_react.default.createElement("div", {
    className: `${prefixCls}-second`
  }, characterNode)));
  if (characterRender) {
    start = characterRender(start, props);
  }
  return start;
}
var _default = exports.default = /*#__PURE__*/_react.default.forwardRef(Star);