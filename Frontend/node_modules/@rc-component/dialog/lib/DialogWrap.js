"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _portal = _interopRequireDefault(require("@rc-component/portal"));
var React = _interopRequireWildcard(require("react"));
var _context = require("./context");
var _Dialog = _interopRequireDefault(require("./Dialog"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
// fix issue #10656
/*
 * getContainer remarks
 * Custom container should not be return, because in the Portal component, it will remove the
 * return container element here, if the custom container is the only child of it's component,
 * like issue #10656, It will has a conflict with removeChild method in react-dom.
 * So here should add a child (div element) to custom container.
 * */

const DialogWrap = props => {
  const {
    visible,
    getContainer,
    forceRender,
    destroyOnHidden = false,
    afterClose,
    closable,
    panelRef,
    keyboard = true,
    onClose
  } = props;
  const [animatedVisible, setAnimatedVisible] = React.useState(visible);
  const refContext = React.useMemo(() => ({
    panel: panelRef
  }), [panelRef]);
  const onEsc = ({
    top,
    event
  }) => {
    if (top && keyboard) {
      event.stopPropagation();
      onClose?.(event);
      return;
    }
  };
  React.useEffect(() => {
    if (visible) {
      setAnimatedVisible(true);
    }
  }, [visible]);

  // Destroy on close will remove wrapped div
  if (!forceRender && destroyOnHidden && !animatedVisible) {
    return null;
  }
  return /*#__PURE__*/React.createElement(_context.RefContext.Provider, {
    value: refContext
  }, /*#__PURE__*/React.createElement(_portal.default, {
    open: visible || forceRender || animatedVisible,
    onEsc: onEsc,
    autoDestroy: false,
    getContainer: getContainer,
    autoLock: visible || animatedVisible
  }, /*#__PURE__*/React.createElement(_Dialog.default, _extends({}, props, {
    destroyOnHidden: destroyOnHidden,
    afterClose: () => {
      const closableObj = closable && typeof closable === 'object' ? closable : {};
      const {
        afterClose: closableAfterClose
      } = closableObj || {};
      closableAfterClose?.();
      afterClose?.();
      setAnimatedVisible(false);
    }
  }))));
};
if (process.env.NODE_ENV !== 'production') {
  DialogWrap.displayName = 'Dialog';
}
var _default = exports.default = DialogWrap;