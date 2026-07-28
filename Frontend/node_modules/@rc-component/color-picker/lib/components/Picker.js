"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _useColorDrag = _interopRequireDefault(require("../hooks/useColorDrag"));
var _util = require("../util");
var _util2 = require("@rc-component/util");
var _Handler = _interopRequireDefault(require("./Handler"));
var _Palette = _interopRequireDefault(require("./Palette"));
var _Transform = _interopRequireDefault(require("./Transform"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const Picker = ({
  color,
  onChange,
  prefixCls,
  onChangeComplete,
  disabled
}) => {
  const pickerRef = (0, _react.useRef)();
  const transformRef = (0, _react.useRef)();
  const colorRef = (0, _react.useRef)(color);
  const onDragChange = (0, _util2.useEvent)(offsetValue => {
    const calcColor = (0, _util.calculateColor)({
      offset: offsetValue,
      targetRef: transformRef,
      containerRef: pickerRef,
      color
    });
    colorRef.current = calcColor;
    onChange(calcColor);
  });
  const [offset, dragStartHandle] = (0, _useColorDrag.default)({
    color,
    containerRef: pickerRef,
    targetRef: transformRef,
    calculate: () => (0, _util.calcOffset)(color),
    onDragChange,
    onDragChangeComplete: () => onChangeComplete?.(colorRef.current),
    disabledDrag: disabled
  });
  return /*#__PURE__*/_react.default.createElement("div", {
    ref: pickerRef,
    className: `${prefixCls}-select`,
    onMouseDown: dragStartHandle,
    onTouchStart: dragStartHandle
  }, /*#__PURE__*/_react.default.createElement(_Palette.default, {
    prefixCls: prefixCls
  }, /*#__PURE__*/_react.default.createElement(_Transform.default, {
    x: offset.x,
    y: offset.y,
    ref: transformRef
  }, /*#__PURE__*/_react.default.createElement(_Handler.default, {
    color: color.toRgbString(),
    prefixCls: prefixCls
  })), /*#__PURE__*/_react.default.createElement("div", {
    className: `${prefixCls}-saturation`,
    style: {
      backgroundColor: `hsl(${color.toHsb().h},100%, 50%)`,
      backgroundImage: 'linear-gradient(0deg, #000, transparent),linear-gradient(90deg, #fff, hsla(0, 0%, 100%, 0))'
    }
  })));
};
var _default = exports.default = Picker;