"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _treeUtil = require("@rc-component/tree/lib/utils/treeUtil");
var _commonUtil = require("../utils/commonUtil");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
/** Lazy parse options data into conduct-able info to avoid perf issue in single mode */
var _default = (options, fieldNames) => {
  const cacheRef = React.useRef({
    options: [],
    info: {
      keyEntities: {},
      pathKeyEntities: {}
    }
  });
  const getEntities = React.useCallback(() => {
    if (cacheRef.current.options !== options) {
      cacheRef.current.options = options;
      cacheRef.current.info = (0, _treeUtil.convertDataToEntities)(options, {
        fieldNames: fieldNames,
        initWrapper: wrapper => ({
          ...wrapper,
          pathKeyEntities: {}
        }),
        processEntity: (entity, wrapper) => {
          const pathKey = entity.nodes.map(node => node[fieldNames.value]).join(_commonUtil.VALUE_SPLIT);
          wrapper.pathKeyEntities[pathKey] = entity;

          // Overwrite origin key.
          // this is very hack but we need let conduct logic work with connect path
          entity.key = pathKey;
        }
      });
    }
    return cacheRef.current.info.pathKeyEntities;
  }, [fieldNames, options]);
  return getEntities;
};
exports.default = _default;