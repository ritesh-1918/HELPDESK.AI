"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _findDOMNode = require("@rc-component/util/lib/Dom/findDOMNode");
var _useEvent = _interopRequireDefault(require("@rc-component/util/lib/hooks/useEvent"));
var _useLayoutEffect = _interopRequireDefault(require("@rc-component/util/lib/hooks/useLayoutEffect"));
var _ref = require("@rc-component/util/lib/ref");
var _react = _interopRequireDefault(require("react"));
var _useMutateObserver = _interopRequireDefault(require("./useMutateObserver"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const MutateObserver = props => {
  const {
    children,
    options,
    onMutate = () => {}
  } = props;
  const callback = (0, _useEvent.default)(onMutate);
  const elementRef = _react.default.useRef(null);
  const canRef = (0, _ref.supportNodeRef)(children);
  const mergedRef = (0, _ref.useComposeRef)(elementRef, (0, _ref.getNodeRef)(children));
  const [target, setTarget] = _react.default.useState(null);
  (0, _useMutateObserver.default)(target, callback, options);

  // =========================== Effect ===========================
  (0, _useLayoutEffect.default)(() => {
    // Set target based on the refs
    if (canRef && elementRef.current) {
      setTarget((0, _findDOMNode.getDOM)(elementRef.current));
    }
  }, [canRef]);

  // =========================== Render ===========================
  if (!children) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('MutationObserver need children props');
    }
    return null;
  }
  return canRef ? /*#__PURE__*/_react.default.cloneElement(children, {
    ref: mergedRef
  }) : children;
};
var _default = exports.default = MutateObserver;