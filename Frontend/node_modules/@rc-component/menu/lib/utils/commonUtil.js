"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseChildren = parseChildren;
var _toArray = _interopRequireDefault(require("@rc-component/util/lib/Children/toArray"));
var React = _interopRequireWildcard(require("react"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function parseChildren(children, keyPath) {
  return (0, _toArray.default)(children).map((child, index) => {
    if ( /*#__PURE__*/React.isValidElement(child)) {
      const {
        key
      } = child;
      let eventKey = child.props?.eventKey ?? key;
      const emptyKey = eventKey === null || eventKey === undefined;
      if (emptyKey) {
        eventKey = `tmp_key-${[...keyPath, index].join('-')}`;
      }
      const cloneProps = {
        key: eventKey,
        eventKey
      };
      if (process.env.NODE_ENV !== 'production' && emptyKey) {
        cloneProps.warnKey = true;
      }
      return /*#__PURE__*/React.cloneElement(child, cloneProps);
    }
    return child;
  });
}