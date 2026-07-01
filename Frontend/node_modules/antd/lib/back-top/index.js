"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireDefault(require("react"));
var _VerticalAlignTopOutlined = _interopRequireDefault(require("@ant-design/icons/VerticalAlignTopOutlined"));
var _motion = _interopRequireDefault(require("@rc-component/motion"));
var _omit = _interopRequireDefault(require("@rc-component/util/lib/omit"));
var _clsx = require("clsx");
var _getScroll = _interopRequireDefault(require("../_util/getScroll"));
var _reactNode = require("../_util/reactNode");
var _scrollTo = _interopRequireDefault(require("../_util/scrollTo"));
var _throttleByAnimationFrame = _interopRequireDefault(require("../_util/throttleByAnimationFrame"));
var _warning = require("../_util/warning");
var _configProvider = require("../config-provider");
var _useCSSVarCls = _interopRequireDefault(require("../config-provider/hooks/useCSSVarCls"));
var _style = _interopRequireDefault(require("./style"));
/**
 * @deprecated Please use `FloatButton.BackTop` instead.
 */
const BackTop = props => {
  const {
    prefixCls: customizePrefixCls,
    className,
    rootClassName,
    visibilityHeight = 400,
    target,
    onClick,
    duration = 450,
    children
  } = props;
  const [visible, setVisible] = _react.default.useState(visibilityHeight === 0);
  const ref = _react.default.useRef(null);
  const getDefaultTarget = () => ref.current?.ownerDocument || window;
  const handleScroll = (0, _throttleByAnimationFrame.default)(e => {
    const scrollTop = (0, _getScroll.default)(e.target);
    setVisible(scrollTop >= visibilityHeight);
  });
  if (process.env.NODE_ENV !== 'production') {
    const warning = (0, _warning.devUseWarning)('BackTop');
    warning.deprecated(false, 'BackTop', 'FloatButton.BackTop');
  }
  _react.default.useEffect(() => {
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
    getPrefixCls,
    direction
  } = _react.default.useContext(_configProvider.ConfigContext);
  const prefixCls = getPrefixCls('back-top', customizePrefixCls);
  const rootPrefixCls = getPrefixCls();
  const rootCls = (0, _useCSSVarCls.default)(prefixCls);
  const [hashId, cssVarCls] = (0, _style.default)(prefixCls, rootCls);
  const classString = (0, _clsx.clsx)(hashId, cssVarCls, prefixCls, {
    [`${prefixCls}-rtl`]: direction === 'rtl'
  }, className, rootClassName);
  // fix https://fb.me/react-unknown-prop
  const divProps = (0, _omit.default)(props, ['prefixCls', 'className', 'rootClassName', 'children', 'visibilityHeight', 'target']);
  const defaultElement = /*#__PURE__*/_react.default.createElement("div", {
    className: `${prefixCls}-content`
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: `${prefixCls}-icon`
  }, /*#__PURE__*/_react.default.createElement(_VerticalAlignTopOutlined.default, null)));
  return /*#__PURE__*/_react.default.createElement("div", {
    ...divProps,
    className: classString,
    onClick: scrollToTop,
    ref: ref
  }, /*#__PURE__*/_react.default.createElement(_motion.default, {
    visible: visible,
    motionName: `${rootPrefixCls}-fade`
  }, ({
    className: motionClassName
  }) => (0, _reactNode.cloneElement)(children || defaultElement, ({
    className: cloneCls
  }) => ({
    className: (0, _clsx.clsx)(motionClassName, cloneCls)
  }))));
};
if (process.env.NODE_ENV !== 'production') {
  BackTop.displayName = 'Deprecated.BackTop';
}
var _default = exports.default = BackTop;