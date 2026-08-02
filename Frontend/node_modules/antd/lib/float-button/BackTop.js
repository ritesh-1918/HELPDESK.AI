"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _VerticalAlignTopOutlined = _interopRequireDefault(require("@ant-design/icons/VerticalAlignTopOutlined"));
var _motion = _interopRequireDefault(require("@rc-component/motion"));
var _ref = require("@rc-component/util/lib/ref");
var _clsx = require("clsx");
var _getScroll = _interopRequireDefault(require("../_util/getScroll"));
var _scrollTo = _interopRequireDefault(require("../_util/scrollTo"));
var _throttleByAnimationFrame = _interopRequireDefault(require("../_util/throttleByAnimationFrame"));
var _configProvider = require("../config-provider");
var _context = require("../config-provider/context");
var _context2 = require("./context");
var _FloatButton = _interopRequireWildcard(require("./FloatButton"));
const defaultIcon = /*#__PURE__*/_react.default.createElement(_VerticalAlignTopOutlined.default, null);
const BackTop = /*#__PURE__*/_react.default.forwardRef((props, ref) => {
  const {
    backTopIcon: contextIcon
  } = (0, _context.useComponentConfig)('floatButton');
  const {
    prefixCls: customizePrefixCls,
    className,
    type = 'default',
    shape = 'circle',
    visibilityHeight = 400,
    icon,
    target,
    onClick,
    duration = 450,
    ...restProps
  } = props;
  const mergedIcon = icon ?? contextIcon ?? defaultIcon;
  const [visible, setVisible] = (0, _react.useState)(visibilityHeight === 0);
  const internalRef = _react.default.useRef(null);
  _react.default.useImperativeHandle(ref, () => ({
    nativeElement: internalRef.current
  }));
  const getDefaultTarget = () => internalRef.current?.ownerDocument || window;
  const handleScroll = (0, _throttleByAnimationFrame.default)(e => {
    const scrollTop = (0, _getScroll.default)(e.target);
    setVisible(scrollTop >= visibilityHeight);
  });
  (0, _react.useEffect)(() => {
    const getTarget = target || getDefaultTarget;
    const container = getTarget();
    handleScroll({
      target: container
    });
    container?.addEventListener('scroll', handleScroll);
    return () => {
      handleScroll.cancel();
      container?.removeEventListener('scroll', handleScroll);
    };
  }, [target]);
  const scrollToTop = e => {
    (0, _scrollTo.default)(0, {
      getContainer: target || getDefaultTarget,
      duration
    });
    onClick?.(e);
  };
  const {
    getPrefixCls
  } = (0, _react.useContext)(_configProvider.ConfigContext);
  const prefixCls = getPrefixCls(_FloatButton.floatButtonPrefixCls, customizePrefixCls);
  const rootPrefixCls = getPrefixCls();
  const groupShape = (0, _react.useContext)(_context2.GroupContext)?.shape;
  const mergedShape = groupShape || shape;
  const contentProps = {
    prefixCls,
    icon: mergedIcon,
    type,
    shape: mergedShape,
    ...restProps
  };
  return /*#__PURE__*/_react.default.createElement(_motion.default, {
    visible: visible,
    motionName: `${rootPrefixCls}-fade`
  }, ({
    className: motionClassName
  }, setRef) => (/*#__PURE__*/_react.default.createElement(_FloatButton.default, {
    ref: (0, _ref.composeRef)(internalRef, setRef),
    ...contentProps,
    onClick: scrollToTop,
    className: (0, _clsx.clsx)(className, motionClassName)
  })));
});
if (process.env.NODE_ENV !== 'production') {
  BackTop.displayName = 'FloatButton.BackTop';
}
var _default = exports.default = BackTop;