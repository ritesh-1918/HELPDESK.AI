"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _clsx = require("clsx");
var _KeyCode = _interopRequireDefault(require("@rc-component/util/lib/KeyCode"));
var React = _interopRequireWildcard(require("react"));
var _pickAttrs = _interopRequireDefault(require("@rc-component/util/lib/pickAttrs"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
const Notify = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    prefixCls,
    style,
    className,
    duration = 4.5,
    showProgress,
    pauseOnHover = true,
    eventKey,
    content,
    closable,
    props: divProps,
    onClick,
    onNoticeClose,
    times,
    hovering: forcedHovering
  } = props;
  const [hovering, setHovering] = React.useState(false);
  const [percent, setPercent] = React.useState(0);
  const [spentTime, setSpentTime] = React.useState(0);
  const mergedHovering = forcedHovering || hovering;
  const mergedDuration = typeof duration === 'number' ? duration : 0;
  const mergedShowProgress = mergedDuration > 0 && showProgress;

  // ======================== Close =========================
  const onInternalClose = () => {
    onNoticeClose(eventKey);
  };
  const onCloseKeyDown = e => {
    if (e.key === 'Enter' || e.code === 'Enter' || e.keyCode === _KeyCode.default.ENTER) {
      onInternalClose();
    }
  };

  // ======================== Effect ========================
  React.useEffect(() => {
    if (!mergedHovering && mergedDuration > 0) {
      const start = Date.now() - spentTime;
      const timeout = setTimeout(() => {
        onInternalClose();
      }, mergedDuration * 1000 - spentTime);
      return () => {
        if (pauseOnHover) {
          clearTimeout(timeout);
        }
        setSpentTime(Date.now() - start);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mergedDuration, mergedHovering, times]);
  React.useEffect(() => {
    if (!mergedHovering && mergedShowProgress && (pauseOnHover || spentTime === 0)) {
      const start = performance.now();
      let animationFrame;
      const calculate = () => {
        cancelAnimationFrame(animationFrame);
        animationFrame = requestAnimationFrame(timestamp => {
          const runtime = timestamp + spentTime - start;
          const progress = Math.min(runtime / (mergedDuration * 1000), 1);
          setPercent(progress * 100);
          if (progress < 1) {
            calculate();
          }
        });
      };
      calculate();
      return () => {
        if (pauseOnHover) {
          cancelAnimationFrame(animationFrame);
        }
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mergedDuration, spentTime, mergedHovering, mergedShowProgress, times]);

  // ======================== Closable ========================
  const closableObj = React.useMemo(() => {
    if (typeof closable === 'object' && closable !== null) {
      return closable;
    }
    return {};
  }, [closable]);
  const ariaProps = (0, _pickAttrs.default)(closableObj, true);

  // ======================== Progress ========================
  const validPercent = 100 - (!percent || percent < 0 ? 0 : percent > 100 ? 100 : percent);

  // ======================== Render ========================
  const noticePrefixCls = `${prefixCls}-notice`;
  return /*#__PURE__*/React.createElement("div", _extends({}, divProps, {
    ref: ref,
    className: (0, _clsx.clsx)(noticePrefixCls, className, {
      [`${noticePrefixCls}-closable`]: closable
    }),
    style: style,
    onMouseEnter: e => {
      setHovering(true);
      divProps?.onMouseEnter?.(e);
    },
    onMouseLeave: e => {
      setHovering(false);
      divProps?.onMouseLeave?.(e);
    },
    onClick: onClick
  }), /*#__PURE__*/React.createElement("div", {
    className: `${noticePrefixCls}-content`
  }, content), closable && /*#__PURE__*/React.createElement("button", _extends({
    className: `${noticePrefixCls}-close`,
    onKeyDown: onCloseKeyDown,
    "aria-label": "Close"
  }, ariaProps, {
    onClick: e => {
      e.preventDefault();
      e.stopPropagation();
      onInternalClose();
    }
  }), closableObj.closeIcon ?? 'x'), mergedShowProgress && /*#__PURE__*/React.createElement("progress", {
    className: `${noticePrefixCls}-progress`,
    max: "100",
    value: validPercent
  }, validPercent + '%'));
});
var _default = exports.default = Notify;