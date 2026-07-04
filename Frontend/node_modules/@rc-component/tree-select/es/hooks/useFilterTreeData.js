import * as React from 'react';
import { fillLegacyProps } from "../utils/legacyUtil";
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
      const isMatch = keepAll || filterOptionFunc(searchValue, fillLegacyProps(node));
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
export default useFilterTreeData;