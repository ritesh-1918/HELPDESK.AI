"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _useColorDrag = _interopRequireDefault(require("../hooks/useColorDrag"));
var _Palette = _interopRequireDefault(require("./Palette"));
var _util = require("@rc-component/util");
var _clsx = require("clsx");
var _color = require("../color");
var _util2 = require("../util");
var _Gradient = _interopRequireDefault(require("./Gradient"));
var _Handler = _interopRequireDefault(require("./Handler"));
var _Transform = _interopRequireDefault(require("./Transform"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const Slider = props => {
  const {
    prefixCls,
    colors,
    disabled,
    onChange,
    onChangeComplete,
    color,
    type
  } = props;
  const sliderRef = (0, _react.useRef)(null);
  const transformRef = (0, _react.useRef)(null);
  const colorRef = (0, _react.useRef)(color);
  const getValue = c => {
    return type === 'hue' ? c.getHue() : c.a * 100;
  };
  const onDragChange = (0, _util.useEvent)(offsetValue => {
    const calcColor = (0, _util2.calculateColor)({
      offset: offsetValue,
      targetRef: transformRef,
      containerRef: sliderRef,
      color,
      type
    });
    colorRef.current = calcColor;
    onChange(getValue(calcColor));
  });
  const [offset, dragStartHandle] = (0, _useColorDrag.default)({
    color,
    targetRef: transformRef,
    containerRef: sliderRef,
    calculate: () => (0, _util2.calcOffset)(color, type),
    onDragChange,
    onDragChangeComplete() {
      onChangeComplete(getValue(colorRef.current));
    },
    direction: 'x',
    disabledDrag: disabled
  });
  const handleColor = _react.default.useMemo(() => {
    if (type === 'hue') {
      const hsb = color.toHsb();
      hsb.s = 1;
      hsb.b = 1;
      hsb.a = 1;
      const lightColor = new _color.Color(hsb);
      return lightColor;
    }
    return color;
  }, [color, type]);

  // ========================= Gradient =========================
  const gradientList = _react.default.useMemo(() => colors.map(info => `${info.color} ${info.percent}%`), [colors]);

  // ========================== Render ==========================
  return /*#__PURE__*/_react.default.createElement("div", {
    ref: sliderRef,
    className: (0, _clsx.clsx)(`${prefixCls}-slider`, `${prefixCls}-slider-${type}`),
    onMouseDown: dragStartHandle,
    onTouchStart: dragStartHandle
  }, /*#__PURE__*/_react.default.createElement(_Palette.default, {
    prefixCls: prefixCls
  }, /*#__PURE__*/_react.default.createElement(_Transform.default, {
    x: offset.x,
    y: offset.y,
    ref: transformRef
  }, /*#__PURE__*/_react.default.createElement(_Handler.default, {
    size: "small",
    color: handleColor.toHexString(),
    prefixCls: prefixCls
  })), /*#__PURE__*/_react.default.createElement(_Gradient.default, {
    colors: gradientList,
    type: type,
    prefixCls: prefixCls
  })));
};
var _default = exports.default = Slider;