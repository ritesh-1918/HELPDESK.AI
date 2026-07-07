"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.convertChildrenToData = convertChildrenToData;
var React = _interopRequireWildcard(require("react"));
var _toArray = _interopRequireDefault(require("@rc-component/util/lib/Children/toArray"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function convertNodeToOption(node) {
  const {
    key,
    props: {
      children,
      value,
      ...restProps
    }
  } = node;
  return {
    key,
    value: value !== undefined ? value : key,
    children,
    ...restProps
  };
}
function convertChildrenToData(nodes, optionOnly = false) {
  return (0, _toArray.default)(nodes).map((node, index) => {
    if (! /*#__PURE__*/React.isValidElement(node) || !node.type) {
      return null;
    }
    const {
      type: {
        isSelectOptGroup
      },
      key,
      props: {
        children,
        ...restProps
      }
    } = node;
    if (optionOnly || !isSelectOptGroup) {
      return convertNodeToOption(node);
    }
    return {
      key: `__RC_SELECT_GRP__${key === null ? index : key}__`,
      label: key,
      ...restProps,
      options: convertChildrenToData(children)
    };
  }).filter(data => data);
}