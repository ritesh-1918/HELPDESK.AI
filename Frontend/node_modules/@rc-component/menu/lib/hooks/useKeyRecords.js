"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OVERFLOW_KEY = void 0;
exports.default = useKeyRecords;
var _react = _interopRequireWildcard(require("react"));
var React = _react;
var _warning = _interopRequireDefault(require("@rc-component/util/lib/warning"));
var _timeUtil = require("../utils/timeUtil");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const PATH_SPLIT = '__RC_UTIL_PATH_SPLIT__';
const getPathStr = keyPath => keyPath.join(PATH_SPLIT);
const getPathKeys = keyPathStr => keyPathStr.split(PATH_SPLIT);
const OVERFLOW_KEY = exports.OVERFLOW_KEY = 'rc-menu-more';
function useKeyRecords() {
  const [, internalForceUpdate] = React.useState({});
  const key2pathRef = (0, _react.useRef)(new Map());
  const path2keyRef = (0, _react.useRef)(new Map());
  const [overflowKeys, setOverflowKeys] = React.useState([]);
  const updateRef = (0, _react.useRef)(0);
  const destroyRef = (0, _react.useRef)(false);
  const forceUpdate = () => {
    if (!destroyRef.current) {
      internalForceUpdate({});
    }
  };
  const registerPath = (0, _react.useCallback)((key, keyPath) => {
    // Warning for invalidate or duplicated `key`
    if (process.env.NODE_ENV !== 'production') {
      (0, _warning.default)(!key2pathRef.current.has(key), `Duplicated key '${key}' used in Menu by path [${keyPath.join(' > ')}]`);
    }

    // Fill map
    const connectedPath = getPathStr(keyPath);
    path2keyRef.current.set(connectedPath, key);
    key2pathRef.current.set(key, connectedPath);
    updateRef.current += 1;
    const id = updateRef.current;
    (0, _timeUtil.nextSlice)(() => {
      if (id === updateRef.current) {
        forceUpdate();
      }
    });
  }, []);
  const unregisterPath = (0, _react.useCallback)((key, keyPath) => {
    const connectedPath = getPathStr(keyPath);
    path2keyRef.current.delete(connectedPath);
    key2pathRef.current.delete(key);
  }, []);
  const refreshOverflowKeys = (0, _react.useCallback)(keys => {
    setOverflowKeys(keys);
  }, []);
  const getKeyPath = (0, _react.useCallback)((eventKey, includeOverflow) => {
    const fullPath = key2pathRef.current.get(eventKey) || '';
    const keys = getPathKeys(fullPath);
    if (includeOverflow && overflowKeys.includes(keys[0])) {
      keys.unshift(OVERFLOW_KEY);
    }
    return keys;
  }, [overflowKeys]);
  const isSubPathKey = (0, _react.useCallback)((pathKeys, eventKey) => pathKeys.filter(item => item !== undefined).some(pathKey => {
    const pathKeyList = getKeyPath(pathKey, true);
    return pathKeyList.includes(eventKey);
  }), [getKeyPath]);
  const getKeys = () => {
    const keys = [...key2pathRef.current.keys()];
    if (overflowKeys.length) {
      keys.push(OVERFLOW_KEY);
    }
    return keys;
  };

  /**
   * Find current key related child path keys
   */
  const getSubPathKeys = (0, _react.useCallback)(key => {
    const connectedPath = `${key2pathRef.current.get(key)}${PATH_SPLIT}`;
    const pathKeys = new Set();
    [...path2keyRef.current.keys()].forEach(pathKey => {
      if (pathKey.startsWith(connectedPath)) {
        pathKeys.add(path2keyRef.current.get(pathKey));
      }
    });
    return pathKeys;
  }, []);
  React.useEffect(() => () => {
    destroyRef.current = true;
  }, []);
  return {
    // Register
    registerPath,
    unregisterPath,
    refreshOverflowKeys,
    // Util
    isSubPathKey,
    getKeyPath,
    getKeys,
    getSubPathKeys
  };
}