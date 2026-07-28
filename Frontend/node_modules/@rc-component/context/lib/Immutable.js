"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createImmutable;
var _ref = require("@rc-component/util/lib/ref");
var React = _interopRequireWildcard(require("react"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
/**
 * Create Immutable pair for `makeImmutable` and `responseImmutable`.
 */
function createImmutable() {
  const ImmutableContext = /*#__PURE__*/React.createContext(null);

  /**
   * Get render update mark by `makeImmutable` root.
   * Do not deps on the return value as render times
   * but only use for `useMemo` or `useCallback` deps.
   */
  function useImmutableMark() {
    return React.useContext(ImmutableContext);
  }

  /**
  * Wrapped Component will be marked as Immutable.
  * When Component parent trigger render,
  * it will notice children component (use with `responseImmutable`) node that parent has updated.
  * @param Component Passed Component
  * @param triggerRender Customize trigger `responseImmutable` children re-render logic. Default will always trigger re-render when this component re-render.
  */
  function makeImmutable(Component, shouldTriggerRender) {
    const refAble = (0, _ref.supportRef)(Component);
    const ImmutableComponent = (props, ref) => {
      const refProps = refAble ? {
        ref
      } : {};
      const renderTimesRef = React.useRef(0);
      const prevProps = React.useRef(props);

      // If parent has the context, we do not wrap it
      const mark = useImmutableMark();
      if (mark !== null) {
        return /*#__PURE__*/React.createElement(Component, _extends({}, props, refProps));
      }
      if (
      // Always trigger re-render if `shouldTriggerRender` is not provided
      !shouldTriggerRender || shouldTriggerRender(prevProps.current, props)) {
        renderTimesRef.current += 1;
      }
      prevProps.current = props;
      return /*#__PURE__*/React.createElement(ImmutableContext.Provider, {
        value: renderTimesRef.current
      }, /*#__PURE__*/React.createElement(Component, _extends({}, props, refProps)));
    };
    if (process.env.NODE_ENV !== 'production') {
      ImmutableComponent.displayName = `ImmutableRoot(${Component.displayName || Component.name})`;
    }
    return refAble ? /*#__PURE__*/React.forwardRef(ImmutableComponent) : ImmutableComponent;
  }

  /**
   * Wrapped Component with `React.memo`.
   * But will rerender when parent with `makeImmutable` rerender.
   */
  function responseImmutable(Component, propsAreEqual) {
    const refAble = (0, _ref.supportRef)(Component);
    const ImmutableComponent = (props, ref) => {
      const refProps = refAble ? {
        ref
      } : {};
      useImmutableMark();
      return /*#__PURE__*/React.createElement(Component, _extends({}, props, refProps));
    };
    if (process.env.NODE_ENV !== 'production') {
      ImmutableComponent.displayName = `ImmutableResponse(${Component.displayName || Component.name})`;
    }
    return /*#__PURE__*/React.memo(refAble ? /*#__PURE__*/React.forwardRef(ImmutableComponent) : ImmutableComponent, propsAreEqual);
  }
  return {
    makeImmutable,
    responseImmutable,
    useImmutableMark
  };
}