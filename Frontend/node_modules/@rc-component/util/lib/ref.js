"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useComposeRef = exports.supportRef = exports.supportNodeRef = exports.getNodeRef = exports.fillRef = exports.composeRef = void 0;
var _react = require("react");
var _reactIs = require("react-is");
var _useMemo = _interopRequireDefault(require("./hooks/useMemo"));
var _isFragment = _interopRequireDefault(require("./React/isFragment"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const ReactMajorVersion = Number(_react.version.split('.')[0]);
const fillRef = (ref, node) => {
  if (typeof ref === 'function') {
    ref(node);
  } else if (typeof ref === 'object' && ref && 'current' in ref) {
    ref.current = node;
  }
};

/**
 * Merge refs into one ref function to support ref passing.
 */
exports.fillRef = fillRef;
const composeRef = (...refs) => {
  const refList = refs.filter(Boolean);
  if (refList.length <= 1) {
    return refList[0];
  }
  return node => {
    refs.forEach(ref => {
      fillRef(ref, node);
    });
  };
};
exports.composeRef = composeRef;
const useComposeRef = (...refs) => {
  return (0, _useMemo.default)(() => composeRef(...refs),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  refs, (prev, next) => prev.length !== next.length || prev.every((ref, i) => ref !== next[i]));
};
exports.useComposeRef = useComposeRef;
const supportRef = nodeOrComponent => {
  if (!nodeOrComponent) {
    return false;
  }

  // React 19 no need `forwardRef` anymore. So just pass if is a React element.
  if (isReactElement(nodeOrComponent) && ReactMajorVersion >= 19) {
    return true;
  }
  const type = (0, _reactIs.isMemo)(nodeOrComponent) ? nodeOrComponent.type.type : nodeOrComponent.type;

  // Function component node
  if (typeof type === 'function' && !type.prototype?.render && type.$$typeof !== _reactIs.ForwardRef) {
    return false;
  }

  // Class component
  if (typeof nodeOrComponent === 'function' && !nodeOrComponent.prototype?.render && nodeOrComponent.$$typeof !== _reactIs.ForwardRef) {
    return false;
  }
  return true;
};
exports.supportRef = supportRef;
function isReactElement(node) {
  return /*#__PURE__*/(0, _react.isValidElement)(node) && !(0, _isFragment.default)(node);
}
const supportNodeRef = node => {
  return isReactElement(node) && supportRef(node);
};

/**
 * In React 19. `ref` is not a property from node.
 * But a property from `props.ref`.
 * To check if `props.ref` exist or fallback to `ref`.
 */
exports.supportNodeRef = supportNodeRef;
const getNodeRef = node => {
  if (node && isReactElement(node)) {
    const ele = node;

    // Source from:
    // https://github.com/mui/material-ui/blob/master/packages/mui-utils/src/getReactNodeRef/getReactNodeRef.ts
    return ele.props.propertyIsEnumerable('ref') ? ele.props.ref : ele.ref;
  }
  return null;
};
exports.getNodeRef = getNodeRef;