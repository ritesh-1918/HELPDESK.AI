"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
exports.genCSSMotion = genCSSMotion;
var _findDOMNode = require("@rc-component/util/lib/Dom/findDOMNode");
var _ref = require("@rc-component/util/lib/ref");
var _clsx = require("clsx");
var _react = _interopRequireWildcard(require("react"));
var React = _react;
var _context = require("./context");
var _useStatus = _interopRequireDefault(require("./hooks/useStatus"));
var _useStepQueue = require("./hooks/useStepQueue");
var _interface = require("./interface");
var _motion = require("./util/motion");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
/* eslint-disable react/default-props-match-prop-types, react/no-multi-comp, react/prop-types */

/**
 * `transitionSupport` is used for none transition test case.
 * Default we use browser transition event support check.
 */
function genCSSMotion(config) {
  let transitionSupport = config;
  if (typeof config === 'object') {
    ({
      transitionSupport
    } = config);
  }
  function isSupportTransition(props, contextMotion) {
    return !!(props.motionName && transitionSupport && contextMotion !== false);
  }
  const CSSMotion = /*#__PURE__*/React.forwardRef((props, ref) => {
    const {
      // Default config
      visible = true,
      removeOnLeave = true,
      forceRender,
      children,
      motionName,
      leavedClassName,
      eventProps
    } = props;
    const {
      motion: contextMotion
    } = React.useContext(_context.Context);
    const supportMotion = isSupportTransition(props, contextMotion);

    // Ref to the react node, it may be a HTMLElement
    const nodeRef = (0, _react.useRef)();
    function getDomElement() {
      return (0, _findDOMNode.getDOM)(nodeRef.current);
    }
    const [getStatus, statusStep, statusStyle, mergedVisible] = (0, _useStatus.default)(supportMotion, visible, getDomElement, props);
    const status = getStatus();

    // Record whether content has rendered
    // Will return null for un-rendered even when `removeOnLeave={false}`
    const renderedRef = React.useRef(mergedVisible);
    if (mergedVisible) {
      renderedRef.current = true;
    }

    // ====================== Refs ======================
    const refObj = React.useMemo(() => {
      const obj = {};
      Object.defineProperties(obj, {
        nativeElement: {
          enumerable: true,
          get: getDomElement
        },
        inMotion: {
          enumerable: true,
          get: () => () => getStatus() !== _interface.STATUS_NONE
        },
        enableMotion: {
          enumerable: true,
          get: () => () => supportMotion
        }
      });
      return obj;
    }, []);

    // We lock `deps` here since function return object
    // will repeat trigger ref from `refConfig` -> `null` -> `refConfig`
    React.useImperativeHandle(ref, () => refObj, []);

    // ===================== Render =====================
    let motionChildren;
    const mergedProps = {
      ...eventProps,
      visible
    };
    if (!children) {
      // No children
      motionChildren = null;
    } else if (status === _interface.STATUS_NONE) {
      // Stable children
      if (mergedVisible) {
        motionChildren = children({
          ...mergedProps
        }, nodeRef);
      } else if (!removeOnLeave && renderedRef.current && leavedClassName) {
        motionChildren = children({
          ...mergedProps,
          className: leavedClassName
        }, nodeRef);
      } else if (forceRender || !removeOnLeave && !leavedClassName) {
        motionChildren = children({
          ...mergedProps,
          style: {
            display: 'none'
          }
        }, nodeRef);
      } else {
        motionChildren = null;
      }
    } else {
      // In motion
      let statusSuffix;
      if (statusStep === _interface.STEP_PREPARE) {
        statusSuffix = 'prepare';
      } else if ((0, _useStepQueue.isActive)(statusStep)) {
        statusSuffix = 'active';
      } else if (statusStep === _interface.STEP_START) {
        statusSuffix = 'start';
      }
      const motionCls = (0, _motion.getTransitionName)(motionName, `${status}-${statusSuffix}`);
      motionChildren = children({
        ...mergedProps,
        className: (0, _clsx.clsx)((0, _motion.getTransitionName)(motionName, status), {
          [motionCls]: motionCls && statusSuffix,
          [motionName]: typeof motionName === 'string'
        }),
        style: statusStyle
      }, nodeRef);
    }

    // Auto inject ref if child node not have `ref` props
    if ( /*#__PURE__*/React.isValidElement(motionChildren) && (0, _ref.supportRef)(motionChildren)) {
      const originNodeRef = (0, _ref.getNodeRef)(motionChildren);
      if (!originNodeRef) {
        motionChildren = /*#__PURE__*/React.cloneElement(motionChildren, {
          ref: nodeRef
        });
      }
    }
    return motionChildren;
  });
  CSSMotion.displayName = 'CSSMotion';
  return CSSMotion;
}
var _default = exports.default = genCSSMotion(_motion.supportTransition);