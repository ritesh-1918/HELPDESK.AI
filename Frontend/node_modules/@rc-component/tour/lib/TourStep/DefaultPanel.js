"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = DefaultPanel;
var React = _interopRequireWildcard(require("react"));
var _clsx = require("clsx");
var _pickAttrs = _interopRequireDefault(require("@rc-component/util/lib/pickAttrs"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
function DefaultPanel(props) {
  const {
    prefixCls,
    current,
    total,
    title,
    description,
    onClose,
    onPrev,
    onNext,
    onFinish,
    className,
    closable,
    classNames: tourClassNames,
    styles
  } = props;
  const ariaProps = (0, _pickAttrs.default)(closable || {}, true);
  const closeIcon = closable?.closeIcon ?? /*#__PURE__*/React.createElement("span", {
    className: `${prefixCls}-close-x`
  }, "\xD7");
  const mergedClosable = !!closable;
  return /*#__PURE__*/React.createElement("div", {
    className: (0, _clsx.clsx)(`${prefixCls}-panel`, className)
  }, /*#__PURE__*/React.createElement("div", {
    className: (0, _clsx.clsx)(`${prefixCls}-section`, tourClassNames?.section),
    style: styles?.section
  }, mergedClosable && /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    onClick: onClose,
    "aria-label": "Close"
  }, ariaProps, {
    className: `${prefixCls}-close`
  }), closeIcon), /*#__PURE__*/React.createElement("div", {
    className: (0, _clsx.clsx)(`${prefixCls}-header`, tourClassNames?.header),
    style: styles?.header
  }, /*#__PURE__*/React.createElement("div", {
    className: (0, _clsx.clsx)(`${prefixCls}-title`, tourClassNames?.title),
    style: styles?.title
  }, title)), /*#__PURE__*/React.createElement("div", {
    className: (0, _clsx.clsx)(`${prefixCls}-description`, tourClassNames?.description),
    style: styles?.description
  }, description), /*#__PURE__*/React.createElement("div", {
    className: (0, _clsx.clsx)(`${prefixCls}-footer`, tourClassNames?.footer),
    style: styles?.footer
  }, /*#__PURE__*/React.createElement("div", {
    className: `${prefixCls}-sliders`
  }, total > 1 ? [...Array.from({
    length: total
  }).keys()].map((item, index) => {
    return /*#__PURE__*/React.createElement("span", {
      key: item,
      className: index === current ? 'active' : ''
    });
  }) : null), /*#__PURE__*/React.createElement("div", {
    className: (0, _clsx.clsx)(`${prefixCls}-actions`, tourClassNames?.actions),
    style: styles?.actions
  }, current !== 0 ? /*#__PURE__*/React.createElement("button", {
    className: `${prefixCls}-prev-btn`,
    onClick: onPrev
  }, "Prev") : null, current === total - 1 ? /*#__PURE__*/React.createElement("button", {
    className: `${prefixCls}-finish-btn`,
    onClick: onFinish
  }, "Finish") : /*#__PURE__*/React.createElement("button", {
    className: `${prefixCls}-next-btn`,
    onClick: onNext
  }, "Next")))));
}