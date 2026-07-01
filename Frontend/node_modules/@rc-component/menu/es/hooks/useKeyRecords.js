import * as React from 'react';
import { useRef, useCallback } from 'react';
import warning from "@rc-component/util/es/warning";
import { nextSlice } from "../utils/timeUtil";
const PATH_SPLIT = '__RC_UTIL_PATH_SPLIT__';
const getPathStr = keyPath => keyPath.join(PATH_SPLIT);
const getPathKeys = keyPathStr => keyPathStr.split(PATH_SPLIT);
export const OVERFLOW_KEY = 'rc-menu-more';
export default function useKeyRecords() {
  const [, internalForceUpdate] = React.useState({});
  const key2pathRef = useRef(new Map());
  const path2keyRef = useRef(new Map());
  const [overflowKeys, setOverflowKeys] = React.useState([]);
  const updateRef = useRef(0);
  const destroyRef = useRef(false);
  const forceUpdate = () => {
    if (!destroyRef.current) {
      internalForceUpdate({});
    }
  };
  const registerPath = useCallback((key, keyPath) => {
    // Warning for invalidate or duplicated `key`
    if (process.env.NODE_ENV !== 'production') {
      warning(!key2pathRef.current.has(key), `Duplicated key '${key}' used in Menu by path [${keyPath.join(' > ')}]`);
    }

    // Fill map
    const connectedPath = getPathStr(keyPath);
    path2keyRef.current.set(connectedPath, key);
    key2pathRef.current.set(key, connectedPath);
    updateRef.current += 1;
    const id = updateRef.current;
    nextSlice(() => {
      if (id === updateRef.current) {
        forceUpdate();
      }
    });
  }, []);
  const unregisterPath = useCallback((key, keyPath) => {
    const connectedPath = getPathStr(keyPath);
    path2keyRef.current.delete(connectedPath);
    key2pathRef.current.delete(key);
  }, []);
  const refreshOverflowKeys = useCallback(keys => {
    setOverflowKeys(keys);
  }, []);
  const getKeyPath = useCallback((eventKey, includeOverflow) => {
    const fullPath = key2pathRef.current.get(eventKey) || '';
    const keys = getPathKeys(fullPath);
    if (includeOverflow && overflowKeys.includes(keys[0])) {
      keys.unshift(OVERFLOW_KEY);
    }
    return keys;
  }, [overflowKeys]);
  const isSubPathKey = useCallback((pathKeys, eventKey) => pathKeys.filter(item => item !== undefined).some(pathKey => {
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
  const getSubPathKeys = useCallback(key => {
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