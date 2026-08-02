"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _clsx = require("clsx");
var _KeyCode = _interopRequireDefault(require("@rc-component/util/lib/KeyCode"));
var React = _interopRequireWildcard(require("react"));
var _context = _interopRequireDefault(require("../context"));
var _util = require("../util");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
const Handle = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    prefixCls,
    value,
    valueIndex,
    onStartMove,
    onDelete,
    style,
    render,
    dragging,
    draggingDelete,
    onOffsetChange,
    onChangeComplete,
    onFocus,
    onMouseEnter,
    ...restProps
  } = props;
  const {
    min,
    max,
    direction,
    disabled,
    keyboard,
    range,
    tabIndex,
    ariaLabelForHandle,
    ariaLabelledByForHandle,
    ariaRequired,
    ariaValueTextFormatterForHandle,
    styles,
    classNames
  } = React.useContext(_context.default);
  const handlePrefixCls = `${prefixCls}-handle`;

  // ============================ Events ============================
  const onInternalStartMove = e => {
    if (!disabled) {
      onStartMove(e, valueIndex);
    }
  };
  const onInternalFocus = e => {
    onFocus?.(e, valueIndex);
  };
  const onInternalMouseEnter = e => {
    onMouseEnter(e, valueIndex);
  };

  // =========================== Keyboard ===========================
  const onKeyDown = e => {
    if (!disabled && keyboard) {
      let offset = null;

      // Change the value
      switch (e.which || e.keyCode) {
        case _KeyCode.default.LEFT:
          offset = direction === 'ltr' || direction === 'btt' ? -1 : 1;
          break;
        case _KeyCode.default.RIGHT:
          offset = direction === 'ltr' || direction === 'btt' ? 1 : -1;
          break;

        // Up is plus
        case _KeyCode.default.UP:
          offset = direction !== 'ttb' ? 1 : -1;
          break;

        // Down is minus
        case _KeyCode.default.DOWN:
          offset = direction !== 'ttb' ? -1 : 1;
          break;
        case _KeyCode.default.HOME:
          offset = 'min';
          break;
        case _KeyCode.default.END:
          offset = 'max';
          break;
        case _KeyCode.default.PAGE_UP:
          offset = 2;
          break;
        case _KeyCode.default.PAGE_DOWN:
          offset = -2;
          break;
        case _KeyCode.default.BACKSPACE:
        case _KeyCode.default.DELETE:
          onDelete?.(valueIndex);
          break;
      }
      if (offset !== null) {
        e.preventDefault();
        onOffsetChange(offset, valueIndex);
      }
    }
  };
  const handleKeyUp = e => {
    switch (e.which || e.keyCode) {
      case _KeyCode.default.LEFT:
      case _KeyCode.default.RIGHT:
      case _KeyCode.default.UP:
      case _KeyCode.default.DOWN:
      case _KeyCode.default.HOME:
      case _KeyCode.default.END:
      case _KeyCode.default.PAGE_UP:
      case _KeyCode.default.PAGE_DOWN:
        onChangeComplete?.();
        break;
    }
  };

  // ============================ Offset ============================
  const positionStyle = (0, _util.getDirectionStyle)(direction, value, min, max);

  // ============================ Render ============================
  let divProps = {};
  if (valueIndex !== null) {
    divProps = {
      tabIndex: disabled ? null : (0, _util.getIndex)(tabIndex, valueIndex),
      role: 'slider',
      'aria-valuemin': min,
      'aria-valuemax': max,
      'aria-valuenow': value,
      'aria-disabled': disabled,
      'aria-label': (0, _util.getIndex)(ariaLabelForHandle, valueIndex),
      'aria-labelledby': (0, _util.getIndex)(ariaLabelledByForHandle, valueIndex),
      'aria-required': (0, _util.getIndex)(ariaRequired, valueIndex),
      'aria-valuetext': (0, _util.getIndex)(ariaValueTextFormatterForHandle, valueIndex)?.(value),
      'aria-orientation': direction === 'ltr' || direction === 'rtl' ? 'horizontal' : 'vertical',
      onMouseDown: onInternalStartMove,
      onTouchStart: onInternalStartMove,
      onFocus: onInternalFocus,
      onMouseEnter: onInternalMouseEnter,
      onKeyDown,
      onKeyUp: handleKeyUp
    };
  }
  let handleNode = /*#__PURE__*/React.createElement("div", _extends({
    ref: ref,
    className: (0, _clsx.clsx)(handlePrefixCls, {
      [`${handlePrefixCls}-${valueIndex + 1}`]: valueIndex !== null && range,
      [`${handlePrefixCls}-dragging`]: dragging,
      [`${handlePrefixCls}-dragging-delete`]: draggingDelete
    }, classNames.handle),
    style: {
      ...positionStyle,
      ...style,
      ...styles.handle
    }
  }, divProps, restProps));

  // Customize
  if (render) {
    handleNode = render(handleNode, {
      index: valueIndex,
      prefixCls,
      value,
      dragging,
      draggingDelete
    });
  }
  return handleNode;
});
if (process.env.NODE_ENV !== 'production') {
  Handle.displayName = 'Handle';
}
var _default = exports.default = Handle;