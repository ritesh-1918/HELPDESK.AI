"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _clsx = require("clsx");
var _motion = _interopRequireDefault(require("@rc-component/motion"));
var _useLayoutEffect = _interopRequireDefault(require("@rc-component/util/lib/hooks/useLayoutEffect"));
var React = _interopRequireWildcard(require("react"));
var _contextTypes = require("./contextTypes");
var _TreeNode = _interopRequireDefault(require("./TreeNode"));
var _useUnmount = _interopRequireDefault(require("./useUnmount"));
var _treeUtil = require("./utils/treeUtil");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
const MotionTreeNode = /*#__PURE__*/React.forwardRef((oriProps, ref) => {
  const {
    className,
    style,
    motion,
    motionNodes,
    motionType,
    onMotionStart: onOriginMotionStart,
    onMotionEnd: onOriginMotionEnd,
    active,
    treeNodeRequiredProps,
    ...props
  } = oriProps;
  const [visible, setVisible] = React.useState(true);
  const {
    prefixCls
  } = React.useContext(_contextTypes.TreeContext);

  // Calculate target visible here.
  // And apply in effect to make `leave` motion work.
  const targetVisible = motionNodes && motionType !== 'hide';
  (0, _useLayoutEffect.default)(() => {
    if (motionNodes) {
      if (targetVisible !== visible) {
        setVisible(targetVisible);
      }
    }
  }, [motionNodes]);
  const triggerMotionStart = () => {
    if (motionNodes) {
      onOriginMotionStart();
    }
  };

  // Should only trigger once
  const triggerMotionEndRef = React.useRef(false);
  const triggerMotionEnd = () => {
    if (motionNodes && !triggerMotionEndRef.current) {
      triggerMotionEndRef.current = true;
      onOriginMotionEnd();
    }
  };

  // Effect if unmount
  (0, _useUnmount.default)(triggerMotionStart, triggerMotionEnd);

  // Motion end event
  const onVisibleChanged = nextVisible => {
    if (targetVisible === nextVisible) {
      triggerMotionEnd();
    }
  };
  if (motionNodes) {
    return /*#__PURE__*/React.createElement(_motion.default, _extends({
      ref: ref,
      visible: visible
    }, motion, {
      motionAppear: motionType === 'show',
      onVisibleChanged: onVisibleChanged
    }), ({
      className: motionClassName,
      style: motionStyle
    }, motionRef) => /*#__PURE__*/React.createElement("div", {
      ref: motionRef,
      className: (0, _clsx.clsx)(`${prefixCls}-treenode-motion`, motionClassName),
      style: motionStyle
    }, motionNodes.map(treeNode => {
      const {
        data: {
          ...restProps
        },
        title,
        key,
        isStart,
        isEnd
      } = treeNode;
      delete restProps.children;
      const treeNodeProps = (0, _treeUtil.getTreeNodeProps)(key, treeNodeRequiredProps);
      return /*#__PURE__*/React.createElement(_TreeNode.default, _extends({}, restProps, treeNodeProps, {
        title: title,
        active: active,
        data: treeNode.data,
        key: key,
        isStart: isStart,
        isEnd: isEnd
      }));
    })));
  }
  return /*#__PURE__*/React.createElement(_TreeNode.default, _extends({
    domRef: ref,
    className: className,
    style: style
  }, props, {
    active: active
  }));
});
if (process.env.NODE_ENV !== 'production') {
  MotionTreeNode.displayName = 'MotionTreeNode';
}
var _default = exports.default = MotionTreeNode;