"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _canUseDom = _interopRequireDefault(require("@rc-component/util/lib/Dom/canUseDom"));
var _ref = require("@rc-component/util/lib/ref");
var _warning = _interopRequireDefault(require("@rc-component/util/lib/warning"));
var React = _interopRequireWildcard(require("react"));
var _reactDom = require("react-dom");
var _Context = _interopRequireDefault(require("./Context"));
var _mock = require("./mock");
var _useDom = _interopRequireDefault(require("./useDom"));
var _useScrollLocker = _interopRequireDefault(require("./useScrollLocker"));
var _useEscKeyDown = _interopRequireDefault(require("./useEscKeyDown"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const getPortalContainer = getContainer => {
  if (getContainer === false) {
    return false;
  }
  if (!(0, _canUseDom.default)() || !getContainer) {
    return null;
  }
  if (typeof getContainer === 'string') {
    return document.querySelector(getContainer);
  }
  if (typeof getContainer === 'function') {
    return getContainer();
  }
  return getContainer;
};
const Portal = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    open,
    autoLock,
    getContainer,
    debug,
    autoDestroy = true,
    children,
    onEsc
  } = props;
  const [shouldRender, setShouldRender] = React.useState(open);
  const mergedRender = shouldRender || open;

  // ========================= Warning =========================
  if (process.env.NODE_ENV !== 'production') {
    (0, _warning.default)((0, _canUseDom.default)() || !open, `Portal only work in client side. Please call 'useEffect' to show Portal instead default render in SSR.`);
  }

  // ====================== Should Render ======================
  React.useEffect(() => {
    if (autoDestroy || open) {
      setShouldRender(open);
    }
  }, [open, autoDestroy]);

  // ======================== Container ========================
  const [innerContainer, setInnerContainer] = React.useState(() => getPortalContainer(getContainer));
  React.useEffect(() => {
    const customizeContainer = getPortalContainer(getContainer);

    // Tell component that we check this in effect which is safe to be `null`
    setInnerContainer(() =>
    // React do the state update even the value is the same,
    // Use function call to force React to compare update
    customizeContainer ?? null);
  });
  const [defaultContainer, queueCreate] = (0, _useDom.default)(mergedRender && !innerContainer, debug);
  const mergedContainer = innerContainer ?? defaultContainer;

  // ========================= Locker ==========================
  (0, _useScrollLocker.default)(autoLock && open && (0, _canUseDom.default)() && (mergedContainer === defaultContainer || mergedContainer === document.body));

  // ========================= Esc Keydown ==========================
  (0, _useEscKeyDown.default)(open, onEsc);

  // =========================== Ref ===========================
  let childRef = null;
  if (children && (0, _ref.supportRef)(children) && ref) {
    childRef = (0, _ref.getNodeRef)(children);
  }
  const mergedRef = (0, _ref.useComposeRef)(childRef, ref);

  // ========================= Render ==========================
  // Do not render when nothing need render
  // When innerContainer is `undefined`, it may not ready since user use ref in the same render
  if (!mergedRender || !(0, _canUseDom.default)() || innerContainer === undefined) {
    return null;
  }

  // Render inline
  const renderInline = mergedContainer === false || (0, _mock.inlineMock)();
  let reffedChildren = children;
  if (ref) {
    reffedChildren = /*#__PURE__*/React.cloneElement(children, {
      ref: mergedRef
    });
  }
  return /*#__PURE__*/React.createElement(_Context.default.Provider, {
    value: queueCreate
  }, renderInline ? reffedChildren : /*#__PURE__*/(0, _reactDom.createPortal)(reffedChildren, mergedContainer));
});
if (process.env.NODE_ENV !== 'production') {
  Portal.displayName = 'Portal';
}
var _default = exports.default = Portal;