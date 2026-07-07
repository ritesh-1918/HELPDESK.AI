"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _clsx = require("clsx");
var _ref = require("@rc-component/util/lib/ref");
var _focus = require("@rc-component/util/lib/Dom/focus");
var _react = _interopRequireWildcard(require("react"));
var _context = require("../../context");
var _MemoChildren = _interopRequireDefault(require("./MemoChildren"));
var _pickAttrs = _interopRequireDefault(require("@rc-component/util/lib/pickAttrs"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
const Panel = /*#__PURE__*/_react.default.forwardRef((props, ref) => {
  const {
    prefixCls,
    className,
    style,
    title,
    ariaId,
    footer,
    closable,
    closeIcon,
    onClose,
    children,
    bodyStyle,
    bodyProps,
    modalRender,
    onMouseDown,
    onMouseUp,
    holderRef,
    visible,
    forceRender,
    width,
    height,
    classNames: modalClassNames,
    styles: modalStyles,
    isFixedPos,
    focusTrap
  } = props;

  // ================================= Refs =================================
  const {
    panel: panelRef
  } = _react.default.useContext(_context.RefContext);
  const internalRef = (0, _react.useRef)(null);
  const mergedRef = (0, _ref.useComposeRef)(holderRef, panelRef, internalRef);
  const [ignoreElement] = (0, _focus.useLockFocus)(visible && isFixedPos && focusTrap !== false, () => internalRef.current);
  _react.default.useImperativeHandle(ref, () => ({
    focus: () => {
      internalRef.current?.focus({
        preventScroll: true
      });
    }
  }));

  // ================================ Style =================================
  const contentStyle = {};
  if (width !== undefined) {
    contentStyle.width = width;
  }
  if (height !== undefined) {
    contentStyle.height = height;
  }
  // ================================ Render ================================
  const footerNode = footer ? /*#__PURE__*/_react.default.createElement("div", {
    className: (0, _clsx.clsx)(`${prefixCls}-footer`, modalClassNames?.footer),
    style: {
      ...modalStyles?.footer
    }
  }, footer) : null;
  const headerNode = title ? /*#__PURE__*/_react.default.createElement("div", {
    className: (0, _clsx.clsx)(`${prefixCls}-header`, modalClassNames?.header),
    style: {
      ...modalStyles?.header
    }
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: (0, _clsx.clsx)(`${prefixCls}-title`, modalClassNames?.title),
    id: ariaId,
    style: {
      ...modalStyles?.title
    }
  }, title)) : null;
  const closableObj = (0, _react.useMemo)(() => {
    if (typeof closable === 'object' && closable !== null) {
      return closable;
    }
    if (closable) {
      return {
        closeIcon: closeIcon ?? /*#__PURE__*/_react.default.createElement("span", {
          className: `${prefixCls}-close-x`
        })
      };
    }
    return {};
  }, [closable, closeIcon, prefixCls]);
  const ariaProps = (0, _pickAttrs.default)(closableObj, true);
  const closeBtnIsDisabled = typeof closable === 'object' && closable.disabled;
  const closerNode = closable ? /*#__PURE__*/_react.default.createElement("button", _extends({
    type: "button",
    onClick: onClose,
    "aria-label": "Close"
  }, ariaProps, {
    className: `${prefixCls}-close`,
    disabled: closeBtnIsDisabled
  }), closableObj.closeIcon) : null;
  const content = /*#__PURE__*/_react.default.createElement("div", {
    className: (0, _clsx.clsx)(`${prefixCls}-container`, modalClassNames?.container),
    style: modalStyles?.container
  }, closerNode, headerNode, /*#__PURE__*/_react.default.createElement("div", _extends({
    className: (0, _clsx.clsx)(`${prefixCls}-body`, modalClassNames?.body),
    style: {
      ...bodyStyle,
      ...modalStyles?.body
    }
  }, bodyProps), children), footerNode);
  return /*#__PURE__*/_react.default.createElement("div", {
    key: "dialog-element",
    role: "dialog",
    "aria-labelledby": title ? ariaId : null,
    "aria-modal": "true",
    ref: mergedRef,
    style: {
      ...style,
      ...contentStyle
    },
    className: (0, _clsx.clsx)(prefixCls, className),
    onMouseDown: onMouseDown,
    onMouseUp: onMouseUp,
    tabIndex: -1,
    onFocus: e => {
      ignoreElement(e.target);
    }
  }, /*#__PURE__*/_react.default.createElement(_MemoChildren.default, {
    shouldUpdate: visible || forceRender
  }, modalRender ? modalRender(content) : content));
});
if (process.env.NODE_ENV !== 'production') {
  Panel.displayName = 'Panel';
}
var _default = exports.default = Panel;