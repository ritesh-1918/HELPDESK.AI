"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _treeUtil = require("@rc-component/tree/lib/utils/treeUtil");
var _warning = _interopRequireDefault(require("@rc-component/util/lib/warning"));
var _valueUtil = require("../utils/valueUtil");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
var _default = (treeData, fieldNames) => React.useMemo(() => {
  const collection = (0, _treeUtil.convertDataToEntities)(treeData, {
    fieldNames,
    initWrapper: wrapper => ({
      ...wrapper,
      valueEntities: new Map()
    }),
    processEntity: (entity, wrapper) => {
      const val = entity.node[fieldNames.value];

      // Check if exist same value
      if (process.env.NODE_ENV !== 'production') {
        const key = entity.node.key;
        (0, _warning.default)(!(0, _valueUtil.isNil)(val), 'TreeNode `value` is invalidate: undefined');
        (0, _warning.default)(!wrapper.valueEntities.has(val), `Same \`value\` exist in the tree: ${val}`);
        (0, _warning.default)(!key || String(key) === String(val), `\`key\` or \`value\` with TreeNode must be the same or you can remove one of them. key: ${key}, value: ${val}.`);
      }
      wrapper.valueEntities.set(val, entity);
    }
  });
  return collection;
}, [treeData, fieldNames]);
exports.default = _default;