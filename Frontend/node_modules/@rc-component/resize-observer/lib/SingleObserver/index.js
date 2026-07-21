"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _findDOMNode = require("@rc-component/util/lib/Dom/findDOMNode");
var _ref = require("@rc-component/util/lib/ref");
var React = _interopRequireWildcard(require("react"));
var _Collection = require("../Collection");
var _useResizeObserver = _interopRequireDefault(require("../useResizeObserver"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function SingleObserver(props, ref) {
  const {
    children,
    disabled,
    onResize,
    data
  } = props;
  const elementRef = React.useRef(null);
  const onCollectionResize = React.useContext(_Collection.CollectionContext);

  // =========================== Children ===========================
  const isRenderProps = typeof children === 'function';
  const mergedChildren = isRenderProps ? children(elementRef) : children;

  // ============================= Ref ==============================
  const canRef = !isRenderProps && /*#__PURE__*/React.isValidElement(mergedChildren) && (0, _ref.supportRef)(mergedChildren);
  const originRef = canRef ? (0, _ref.getNodeRef)(mergedChildren) : null;
  const mergedRef = (0, _ref.useComposeRef)(originRef, elementRef);
  const getDomElement = () => {
    return (0, _findDOMNode.getDOM)(elementRef.current);
  };
  React.useImperativeHandle(ref, () => getDomElement());

  // =========================== Observe ============================
  (0, _useResizeObserver.default)(!disabled, getDomElement, onResize, (sizeInfo, target) => {
    onCollectionResize?.(sizeInfo, target, data);
  });

  // ============================ Render ============================
  return canRef ? /*#__PURE__*/React.cloneElement(mergedChildren, {
    ref: mergedRef
  }) : mergedChildren;
}
const RefSingleObserver = /*#__PURE__*/React.forwardRef(SingleObserver);
if (process.env.NODE_ENV !== 'production') {
  RefSingleObserver.displayName = 'SingleObserver';
}
var _default = exports.default = RefSingleObserver;