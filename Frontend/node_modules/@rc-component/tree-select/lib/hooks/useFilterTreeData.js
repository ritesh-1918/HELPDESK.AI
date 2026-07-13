"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _legacyUtil = require("../utils/legacyUtil");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const useFilterTreeData = (treeData, searchValue, options) => {
  const {
    fieldNames,
    treeNodeFilterProp,
    filterTreeNode
  } = options;
  const {
    children: fieldChildren
  } = fieldNames;
  return React.useMemo(() => {
    if (!searchValue || filterTreeNode === false) {
      return treeData;
    }
    const filterOptionFunc = typeof filterTreeNode === 'function' ? filterTreeNode : (_, dataNode) => String(dataNode[treeNodeFilterProp]).toUpperCase().includes(searchValue.toUpperCase());
    const filterTreeNodes = (nodes, keepAll = false) => nodes.reduce((filtered, node) => {
      const children = node[fieldChildren];
      const isMatch = keepAll || filterOptionFunc(searchValue, (0, _legacyUtil.fillLegacyProps)(node));
      const filteredChildren = filterTreeNodes(children || [], isMatch);
      if (isMatch || filteredChildren.length) {
        filtered.push({
          ...node,
          isLeaf: undefined,
          [fieldChildren]: filteredChildren
        });
      }
      return filtered;
    }, []);
    return filterTreeNodes(treeData);
  }, [treeData, searchValue, fieldChildren, treeNodeFilterProp, filterTreeNode]);
};
var _default = exports.default = useFilterTreeData;