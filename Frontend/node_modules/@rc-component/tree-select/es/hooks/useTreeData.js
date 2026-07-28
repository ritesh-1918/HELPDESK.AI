import * as React from 'react';
import { convertChildrenToData } from "../utils/legacyUtil";
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
export default function useTreeData(treeData, children, simpleMode) {
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
    return convertChildrenToData(children);
  }, [children, simpleMode, treeData]);
}