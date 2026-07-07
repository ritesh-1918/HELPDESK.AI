"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = require("react");
var _reactDom = _interopRequireDefault(require("react-dom"));
var _canUseDom = _interopRequireDefault(require("./Dom/canUseDom"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const Portal = /*#__PURE__*/(0, _react.forwardRef)((props, ref) => {
  const {
    didUpdate,
    getContainer,
    children
  } = props;
  const parentRef = (0, _react.useRef)(null);
  const containerRef = (0, _react.useRef)(null);

  // Ref return nothing, only for wrapper check exist
  (0, _react.useImperativeHandle)(ref, () => ({}));

  // Create container in client side with sync to avoid useEffect not get ref
  const initRef = (0, _react.useRef)(false);
  if (!initRef.current && (0, _canUseDom.default)()) {
    containerRef.current = getContainer();
    parentRef.current = containerRef.current.parentNode;
    initRef.current = true;
  }

  // [Legacy] Used by `rc-trigger`
  (0, _react.useEffect)(() => {
    didUpdate?.(props);
  });
  (0, _react.useEffect)(() => {
    // Restore container to original place
    // React 18 StrictMode will unmount first and mount back for effect test:
    // https://reactjs.org/blog/2022/03/29/react-v18.html#new-strict-mode-behaviors
    if (containerRef.current.parentNode === null && parentRef.current !== null) {
      parentRef.current.appendChild(containerRef.current);
    }
    return () => {
      // [Legacy] This should not be handle by Portal but parent PortalWrapper instead.
      // Since some component use `Portal` directly, we have to keep the logic here.
      containerRef.current?.parentNode?.removeChild(containerRef.current);
    };
  }, []);
  return containerRef.current ? /*#__PURE__*/_reactDom.default.createPortal(children, containerRef.current) : null;
});
var _default = exports.default = Portal;