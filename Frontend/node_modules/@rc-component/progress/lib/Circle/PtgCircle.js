"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _clsx = require("clsx");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const Block = ({
  bg,
  children
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    width: '100%',
    height: '100%',
    background: bg
  }
}, children);
function getPtgColors(color, scale) {
  return Object.keys(color).map(key => {
    const parsedKey = parseFloat(key);
    const ptgKey = `${Math.floor(parsedKey * scale)}%`;
    return `${color[key]} ${ptgKey}`;
  });
}
const PtgCircle = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    prefixCls,
    color,
    gradientId,
    radius,
    className,
    style: circleStyleForStack,
    ptg,
    strokeLinecap,
    strokeWidth,
    size,
    gapDegree
  } = props;
  const isGradient = color && typeof color === 'object';
  const stroke = isGradient ? `#FFF` : undefined;

  // ========================== Circle ==========================
  const halfSize = size / 2;
  const circleNode = /*#__PURE__*/React.createElement("circle", {
    className: (0, _clsx.clsx)(`${prefixCls}-circle-path`, className),
    r: radius,
    cx: halfSize,
    cy: halfSize,
    stroke: stroke,
    strokeLinecap: strokeLinecap,
    strokeWidth: strokeWidth,
    opacity: ptg === 0 ? 0 : 1,
    style: circleStyleForStack,
    ref: ref
  });

  // ========================== Render ==========================
  if (!isGradient) {
    return circleNode;
  }
  const maskId = `${gradientId}-conic`;
  const fromDeg = gapDegree ? `${180 + gapDegree / 2}deg` : '0deg';
  const conicColors = getPtgColors(color, (360 - gapDegree) / 360);
  const linearColors = getPtgColors(color, 1);
  const conicColorBg = `conic-gradient(from ${fromDeg}, ${conicColors.join(', ')})`;
  const linearColorBg = `linear-gradient(to ${gapDegree ? 'bottom' : 'top'}, ${linearColors.join(', ')})`;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("mask", {
    id: maskId
  }, circleNode), /*#__PURE__*/React.createElement("foreignObject", {
    x: 0,
    y: 0,
    width: size,
    height: size,
    mask: `url(#${maskId})`
  }, /*#__PURE__*/React.createElement(Block, {
    bg: linearColorBg
  }, /*#__PURE__*/React.createElement(Block, {
    bg: conicColorBg
  }))));
});
if (process.env.NODE_ENV !== 'production') {
  PtgCircle.displayName = 'PtgCircle';
}
var _default = exports.default = PtgCircle;