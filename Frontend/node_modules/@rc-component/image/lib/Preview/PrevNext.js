"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = PrevNext;
var _clsx = require("clsx");
var React = _interopRequireWildcard(require("react"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function PrevNext(props) {
  const {
    prefixCls,
    onActive,
    current,
    count,
    icons: {
      left,
      right,
      prev,
      next
    }
  } = props;
  const switchCls = `${prefixCls}-switch`;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: (0, _clsx.clsx)(switchCls, `${switchCls}-prev`, {
      [`${switchCls}-disabled`]: current === 0
    }),
    onClick: () => onActive(-1)
  }, prev ?? left), /*#__PURE__*/React.createElement("div", {
    className: (0, _clsx.clsx)(switchCls, `${switchCls}-next`, {
      [`${switchCls}-disabled`]: current === count - 1
    }),
    onClick: () => onActive(1)
  }, next ?? right));
}