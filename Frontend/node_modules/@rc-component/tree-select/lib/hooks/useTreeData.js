"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useTreeData;
var React = _interopRequireWildcard(require("react"));
var _legacyUtil = require("../utils/legacyUtil");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function buildTreeStructure(nodes, config) {
  const {
    id,
    pId,
    rootPId
  } = config;
  const nodeMap = new Map();
  const rootNodes = [];
  nodes.forEach(node => {
    const nodeKey = node[id];
    const clonedNode = {
      ...node,
      key: node.key || nodeKey
    };
    nodeMap.set(nodeKey, clonedNode);
  });
  nodeMap.forEach(node => {
    const parentKey = node[pId];
    const parent = nodeMap.get(parentKey);
    if (parent) {
      parent.children = parent.children || [];
      parent.children.push(node);
    } else if (parentKey === rootPId || rootPId === null) {
      rootNodes.push(node);
    }
  });
  return rootNodes;
}

/**
 * 将 `treeData` 或 `children` 转换为格式化的 `treeData`。
 * 如果 `treeData` 或 `children` 没有变化，则不会重新计算。
 */
function useTreeData(treeData, children, simpleMode) {
  return React.useMemo(() => {
    if (treeData) {
      if (simpleMode) {
        const config = {
          id: 'id',
          pId: 'pId',
          rootPId: null,
          ...(typeof simpleMode === 'object' ? simpleMode : {})
        };
        return buildTreeStructure(treeData, config);
      }
      return treeData;
    }
    return (0, _legacyUtil.convertChildrenToData)(children);
  }, [children, simpleMode, treeData]);
}