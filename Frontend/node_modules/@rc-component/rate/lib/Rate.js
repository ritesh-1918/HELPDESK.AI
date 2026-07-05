"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _useControlledState = _interopRequireDefault(require("@rc-component/util/lib/hooks/useControlledState"));
var _KeyCode = _interopRequireDefault(require("@rc-component/util/lib/KeyCode"));
var _pickAttrs = _interopRequireDefault(require("@rc-component/util/lib/pickAttrs"));
var _clsx = require("clsx");
var _react = _interopRequireDefault(require("react"));
var _Star = _interopRequireDefault(require("./Star"));
var _useRefs = _interopRequireDefault(require("./useRefs"));
var _util = require("./util");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
function Rate(props, ref) {
  const {
    // Base
    prefixCls = 'rc-rate',
    className,
    // Value
    defaultValue,
    value: propValue,
    count = 5,
    allowHalf = false,
    allowClear = true,
    keyboard = true,
    // Display
    character = '★',
    characterRender,
    // Meta
    disabled,
    direction = 'ltr',
    tabIndex = 0,
    autoFocus,
    // Events
    onHoverChange,
    onChange,
    onFocus,
    onBlur,
    onKeyDown,
    onMouseLeave,
    ...restProps
  } = props;
  const [getStarRef, setStarRef] = (0, _useRefs.default)();
  const rateRef = _react.default.useRef(null);

  // ============================ Ref =============================
  const triggerFocus = () => {
    if (!disabled) {
      rateRef.current?.focus();
    }
  };
  _react.default.useImperativeHandle(ref, () => ({
    focus: triggerFocus,
    blur: () => {
      if (!disabled) {
        rateRef.current?.blur();
      }
    }
  }));

  // =========================== Value ============================
  const [value, setValue] = (0, _useControlledState.default)(defaultValue || 0, propValue);
  const [cleanedValue, setCleanedValue] = (0, _useControlledState.default)(null);
  const getStarValue = (index, x) => {
    const reverse = direction === 'rtl';
    let starValue = index + 1;
    if (allowHalf) {
      const starEle = getStarRef(index);
      const leftDis = (0, _util.getOffsetLeft)(starEle);
      const width = starEle.clientWidth;
      if (reverse && x - leftDis > width / 2) {
        starValue -= 0.5;
      } else if (!reverse && x - leftDis < width / 2) {
        starValue -= 0.5;
      }
    }
    return starValue;
  };

  // >>>>> Change
  const changeValue = nextValue => {
    setValue(nextValue);
    onChange?.(nextValue);
  };

  // =========================== Focus ============================
  const [focused, setFocused] = _react.default.useState(false);
  const onInternalFocus = () => {
    setFocused(true);
    onFocus?.();
  };
  const onInternalBlur = () => {
    setFocused(false);
    onBlur?.();
  };

  // =========================== Hover ============================
  const [hoverValue, setHoverValue] = _react.default.useState(null);
  const onHover = (event, index) => {
    const nextHoverValue = getStarValue(index, event.pageX);
    if (nextHoverValue !== cleanedValue) {
      setHoverValue(nextHoverValue);
      setCleanedValue(null);
    }
    onHoverChange?.(nextHoverValue);
  };
  const onMouseLeaveCallback = event => {
    if (!disabled) {
      setHoverValue(null);
      setCleanedValue(null);
      onHoverChange?.(undefined);
    }
    if (event) {
      onMouseLeave?.(event);
    }
  };

  // =========================== Click ============================
  const onClick = (event, index) => {
    const newValue = getStarValue(index, event.pageX);
    let isReset = false;
    if (allowClear) {
      isReset = newValue === value;
    }
    onMouseLeaveCallback();
    changeValue(isReset ? 0 : newValue);
    setCleanedValue(isReset ? newValue : null);
  };
  const onInternalKeyDown = event => {
    const {
      keyCode
    } = event;
    const reverse = direction === 'rtl';
    const step = allowHalf ? 0.5 : 1;
    if (keyboard) {
      if (keyCode === _KeyCode.default.RIGHT && value < count && !reverse) {
        changeValue(value + step);
        event.preventDefault();
      } else if (keyCode === _KeyCode.default.LEFT && value > 0 && !reverse) {
        changeValue(value - step);
        event.preventDefault();
      } else if (keyCode === _KeyCode.default.RIGHT && value > 0 && reverse) {
        changeValue(value - step);
        event.preventDefault();
      } else if (keyCode === _KeyCode.default.LEFT && value < count && reverse) {
        changeValue(value + step);
        event.preventDefault();
      }
    }
    onKeyDown?.(event);
  };

  // =========================== Effect ===========================

  _react.default.useEffect(() => {
    if (autoFocus && !disabled) {
      triggerFocus();
    }
  }, []);

  // =========================== Render ===========================
  // >>> Star
  const starNodes = new Array(count).fill(0).map((item, index) => /*#__PURE__*/_react.default.createElement(_Star.default, {
    ref: setStarRef(index),
    index: index,
    count: count,
    disabled: disabled,
    prefixCls: `${prefixCls}-star`,
    allowHalf: allowHalf,
    value: hoverValue === null ? value : hoverValue,
    onClick: onClick,
    onHover: onHover,
    key: item || index,
    character: character,
    characterRender: characterRender,
    focused: focused
  }));
  const classString = (0, _clsx.clsx)(prefixCls, className, {
    [`${prefixCls}-disabled`]: disabled,
    [`${prefixCls}-rtl`]: direction === 'rtl'
  });

  // >>> Node
  return /*#__PURE__*/_react.default.createElement("ul", _extends({
    className: classString,
    onMouseLeave: onMouseLeaveCallback,
    tabIndex: disabled ? -1 : tabIndex,
    onFocus: disabled ? null : onInternalFocus,
    onBlur: disabled ? null : onInternalBlur,
    onKeyDown: disabled ? null : onInternalKeyDown,
    ref: rateRef
  }, (0, _pickAttrs.default)(restProps, {
    aria: true,
    data: true,
    attr: true
  })), starNodes);
}
var _default = exports.default = /*#__PURE__*/_react.default.forwardRef(Rate);