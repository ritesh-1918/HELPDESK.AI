"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useClosable = useClosable;
var React = _interopRequireWildcard(require("react"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function isConfigObj(closable) {
  return closable !== null && typeof closable === 'object';
}
/**
 * Convert `closable` to ClosableConfig.
 * When `preset` is true, will auto fill ClosableConfig with default value.
 */
function getClosableConfig(closable, closeIcon, preset) {
  if (closable === false || closeIcon === false && (!isConfigObj(closable) || !closable.closeIcon)) {
    return null;
  }
  const mergedCloseIcon = typeof closeIcon !== 'boolean' ? closeIcon : undefined;
  if (isConfigObj(closable)) {
    return {
      ...closable,
      closeIcon: closable.closeIcon ?? mergedCloseIcon
    };
  }

  // When StepClosable no need auto fill, but RootClosable need this.
  return preset || closable || closeIcon ? {
    closeIcon: mergedCloseIcon
  } : 'empty';
}
function useClosable(stepClosable, stepCloseIcon, closable, closeIcon) {
  return React.useMemo(() => {
    const stepClosableConfig = getClosableConfig(stepClosable, stepCloseIcon, false);
    const rootClosableConfig = getClosableConfig(closable, closeIcon, true);
    if (stepClosableConfig !== 'empty') {
      return stepClosableConfig;
    }
    return rootClosableConfig;
  }, [closable, closeIcon, stepClosable, stepCloseIcon]);
}