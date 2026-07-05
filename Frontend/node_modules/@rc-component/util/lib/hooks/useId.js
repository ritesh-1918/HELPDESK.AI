"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
exports.getId = getId;
exports.resetUuid = resetUuid;
var React = _interopRequireWildcard(require("react"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function getUseId() {
  // We need fully clone React function here to avoid webpack warning React 17 do not export `useId`
  const fullClone = {
    ...React
  };
  return fullClone.useId;
}
let uuid = 0;

/** @private Note only worked in develop env. Not work in production. */
function resetUuid() {
  if (process.env.NODE_ENV !== 'production') {
    uuid = 0;
  }
}

/**
 * Generate a valid HTML id from prefix and key.
 * Sanitizes the key by replacing invalid characters with hyphens.
 * @param prefix - The prefix for the id
 * @param key - The key from React element, may contain spaces or invalid characters
 * @returns A valid HTML id string
 */
function getId(prefix, key) {
  // React.Key can be string | number, convert to string first
  const keyStr = String(key);

  // Valid id characters: letters, digits, hyphen, underscore, colon, period
  // Replace all invalid characters (including spaces) with hyphens to preserve length
  const sanitizedKey = keyStr.replace(/[^a-zA-Z0-9_.:-]/g, '-');
  return `${prefix}-${sanitizedKey}`;
}
const useOriginId = getUseId();
var _default = exports.default = useOriginId ?
// Use React `useId`
function useId(id) {
  const reactId = useOriginId();

  // Developer passed id is single source of truth
  if (id) {
    return id;
  }

  // Test env always return mock id
  if (process.env.NODE_ENV === 'test') {
    return 'test-id';
  }
  return reactId;
} :
// Use compatible of `useId`
function useCompatId(id) {
  // Inner id for accessibility usage. Only work in client side
  const [innerId, setInnerId] = React.useState('ssr-id');
  React.useEffect(() => {
    const nextId = uuid;
    uuid += 1;
    setInnerId(`rc_unique_${nextId}`);
  }, []);

  // Developer passed id is single source of truth
  if (id) {
    return id;
  }

  // Test env always return mock id
  if (process.env.NODE_ENV === 'test') {
    return 'test-id';
  }

  // Return react native id or inner id
  return innerId;
};