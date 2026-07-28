"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _clsx = require("clsx");
var _common = require("../common");
var _useId = _interopRequireDefault(require("@rc-component/util/lib/hooks/useId"));
var _PtgCircle = _interopRequireDefault(require("./PtgCircle"));
var _util = require("./util");
var _getIndeterminateCircle = _interopRequireDefault(require("../utils/getIndeterminateCircle"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
function toArray(value) {
  const mergedValue = value ?? [];
  return Array.isArray(mergedValue) ? mergedValue : [mergedValue];
}
const Circle = props => {
  const {
    id,
    prefixCls,
    classNames = {},
    styles = {},
    steps,
    strokeWidth,
    railWidth,
    gapDegree = 0,
    gapPosition,
    railColor,
    strokeLinecap,
    style,
    className,
    strokeColor,
    percent,
    loading,
    ...restProps
  } = {
    ..._common.defaultProps,
    ...props
  };
  const halfSize = _util.VIEW_BOX_SIZE / 2;
  const mergedId = (0, _useId.default)(id);
  const gradientId = `${mergedId}-gradient`;
  const radius = halfSize - strokeWidth / 2;
  const perimeter = Math.PI * 2 * radius;
  const rotateDeg = gapDegree > 0 ? 90 + gapDegree / 2 : -90;
  const perimeterWithoutGap = perimeter * ((360 - gapDegree) / 360);
  const {
    count: stepCount,
    gap: stepGap
  } = typeof steps === 'object' ? steps : {
    count: steps,
    gap: 2
  };
  const percentList = toArray(percent);
  const strokeColorList = toArray(strokeColor);
  const gradient = strokeColorList.find(color => color && typeof color === 'object');
  const isConicGradient = gradient && typeof gradient === 'object';
  const mergedStrokeLinecap = isConicGradient ? 'butt' : strokeLinecap;
  const {
    indeterminateStyleProps,
    indeterminateStyleAnimation
  } = (0, _getIndeterminateCircle.default)({
    id: mergedId,
    loading
  });
  const circleStyle = (0, _util.getCircleStyle)(perimeter, perimeterWithoutGap, 0, 100, rotateDeg, gapDegree, gapPosition, railColor, mergedStrokeLinecap, strokeWidth);
  const paths = (0, _common.useTransitionDuration)();
  const getStokeList = () => {
    let stackPtg = 0;
    return percentList.map((ptg, index) => {
      const color = strokeColorList[index] || strokeColorList[strokeColorList.length - 1];
      const circleStyleForStack = (0, _util.getCircleStyle)(perimeter, perimeterWithoutGap, stackPtg, ptg, rotateDeg, gapDegree, gapPosition, color, mergedStrokeLinecap, strokeWidth);
      stackPtg += ptg;
      return /*#__PURE__*/React.createElement(_PtgCircle.default, {
        key: index,
        color: color,
        ptg: ptg,
        radius: radius,
        prefixCls: prefixCls,
        gradientId: gradientId,
        className: classNames.track,
        style: {
          ...circleStyleForStack,
          ...indeterminateStyleProps,
          ...styles.track
        },
        strokeLinecap: mergedStrokeLinecap,
        strokeWidth: strokeWidth,
        gapDegree: gapDegree,
        ref: elem => {
          // https://reactjs.org/docs/refs-and-the-dom.html#callback-refs
          // React will call the ref callback with the DOM element when the component mounts,
          // and call it with `null` when it unmounts.
          // Refs are guaranteed to be up-to-date before componentDidMount or componentDidUpdate fires.

          paths[index] = elem;
        },
        size: _util.VIEW_BOX_SIZE
      });
    }).reverse();
  };
  const getStepStokeList = () => {
    // only show the first percent when pass steps
    const current = Math.round(stepCount * (percentList[0] / 100));
    const stepPtg = 100 / stepCount;
    let stackPtg = 0;
    return new Array(stepCount).fill(null).map((_, index) => {
      const color = index <= current - 1 ? strokeColorList[0] : railColor;
      const stroke = color && typeof color === 'object' ? `url(#${gradientId})` : undefined;
      const circleStyleForStack = (0, _util.getCircleStyle)(perimeter, perimeterWithoutGap, stackPtg, stepPtg, rotateDeg, gapDegree, gapPosition, color, 'butt', strokeWidth, stepGap);
      stackPtg += (perimeterWithoutGap - circleStyleForStack.strokeDashoffset + stepGap) * 100 / perimeterWithoutGap;
      return /*#__PURE__*/React.createElement("circle", {
        key: index,
        className: (0, _clsx.clsx)(`${prefixCls}-circle-path`, classNames.track),
        r: radius,
        cx: halfSize,
        cy: halfSize,
        stroke: stroke,
        strokeWidth: strokeWidth,
        opacity: 1,
        style: {
          ...circleStyleForStack,
          ...styles.track
        },
        ref: elem => {
          paths[index] = elem;
        }
      });
    });
  };
  return /*#__PURE__*/React.createElement("svg", _extends({
    className: (0, _clsx.clsx)(`${prefixCls}-circle`, classNames.root, className),
    viewBox: `0 0 ${_util.VIEW_BOX_SIZE} ${_util.VIEW_BOX_SIZE}`,
    style: {
      ...styles.root,
      ...style
    },
    id: id,
    role: "presentation"
  }, restProps), !stepCount && /*#__PURE__*/React.createElement("circle", {
    className: (0, _clsx.clsx)(`${prefixCls}-circle-rail`, classNames.rail),
    r: radius,
    cx: halfSize,
    cy: halfSize,
    stroke: railColor,
    strokeLinecap: mergedStrokeLinecap,
    strokeWidth: railWidth || strokeWidth,
    style: {
      ...circleStyle,
      ...styles.rail
    }
  }), stepCount ? getStepStokeList() : getStokeList(), indeterminateStyleAnimation);
};
if (process.env.NODE_ENV !== 'production') {
  Circle.displayName = 'Circle';
}
var _default = exports.default = Circle;