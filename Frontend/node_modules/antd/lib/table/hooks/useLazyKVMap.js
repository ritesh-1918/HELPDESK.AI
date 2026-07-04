"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
const useLazyKVMap = (data, childrenColumnName, getRowKey) => {
  const mapCacheRef = React.useRef({});
  function getRecordByKey(key) {
    if (!mapCacheRef.current || mapCacheRef.current.data !== data || mapCacheRef.current.childrenColumnName !== childrenColumnName || mapCacheRef.current.getRowKey !== getRowKey) {
      const kvMap = new Map();
      function dig(records) {
        records.forEach((record, index) => {
          const rowKey = getRowKey(record, index);
          kvMap.set(rowKey, record);
          if (record && typeof record === 'object' && childrenColumnName in record) {
            dig(record[childrenColumnName] || []);
          }
        });
      }
      dig(data);
      mapCacheRef.current = {
        data,
        childrenColumnName,
        kvMap,
        getRowKey
      };
    }
    return mapCacheRef.current.kvMap?.get(key);
  }
  return [getRecordByKey];
};
var _default = exports.default = useLazyKVMap;