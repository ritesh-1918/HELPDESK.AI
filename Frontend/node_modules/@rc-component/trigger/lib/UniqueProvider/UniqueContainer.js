"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireDefault(require("react"));
var _useOffsetStyle = _interopRequireDefault(require("../hooks/useOffsetStyle"));
var _clsx = require("clsx");
var _motion = _interopRequireDefault(require("@rc-component/motion"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
const UniqueContainer = props => {
  const {
    prefixCls,
    isMobile,
    ready,
    open,
    align,
    offsetR,
    offsetB,
    offsetX,
    offsetY,
    arrowPos,
    popupSize,
    motion,
    uniqueContainerClassName,
    uniqueContainerStyle
  } = props;
  const containerCls = `${prefixCls}-unique-container`;
  const [motionVisible, setMotionVisible] = _react.default.useState(false);

  // ========================= Styles =========================
  const offsetStyle = (0, _useOffsetStyle.default)(isMobile, ready, open, align, offsetR, offsetB, offsetX, offsetY);

  // Cache for offsetStyle when ready is true
  const cachedOffsetStyleRef = _react.default.useRef(offsetStyle);

  // Update cached offset style when ready is true
  if (ready) {
    cachedOffsetStyleRef.current = offsetStyle;
  }

  // Apply popup size if available
  const sizeStyle = {};
  if (popupSize) {
    sizeStyle.width = popupSize.width;
    sizeStyle.height = popupSize.height;
  }

  // ========================= Render =========================
  return /*#__PURE__*/_react.default.createElement(_motion.default, _extends({
    motionAppear: true,
    motionEnter: true,
    motionLeave: true,
    removeOnLeave: false,
    leavedClassName: `${containerCls}-hidden`
  }, motion, {
    visible: open,
    onVisibleChanged: nextVisible => {
      setMotionVisible(nextVisible);
    }
  }), ({
    className: motionClassName,
    style: motionStyle
  }) => {
    const cls = (0, _clsx.clsx)(containerCls, motionClassName, uniqueContainerClassName, {
      [`${containerCls}-visible`]: motionVisible
    });
    return /*#__PURE__*/_react.default.createElement("div", {
      className: cls,
      style: {
        '--arrow-x': `${arrowPos?.x || 0}px`,
        '--arrow-y': `${arrowPos?.y || 0}px`,
        ...cachedOffsetStyleRef.current,
        ...sizeStyle,
        ...motionStyle,
        ...uniqueContainerStyle
      }
    });
  });
};
var _default = exports.default = UniqueContainer;