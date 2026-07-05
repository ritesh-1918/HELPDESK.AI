import * as React from 'react';
import toArray from "@rc-component/util/es/Children/toArray";
import warning from "@rc-component/util/es/warning";
import TreeNode from "../TreeNode";
export function convertChildrenToData(nodes) {
  return toArray(nodes).map(node => {
    if (! /*#__PURE__*/React.isValidElement(node) || !node.type) {
      return null;
    }
    const {
      key,
      props: {
        children,
        value,
        ...restProps
      }
    } = node;
    const data = {
      key,
      value,
      ...restProps
    };
    const childData = convertChildrenToData(children);
    if (childData.length) {
      data.children = childData;
    }
    return data;
  }).filter(data => data);
}
export function fillLegacyProps(dataNode) {
  if (!dataNode) {
    return dataNode;
  }
  const cloneNode = {
    ...dataNode
  };
  if (!('props' in cloneNode)) {
    Object.defineProperty(cloneNode, 'props', {
      get() {
        warning(false, 'New `rc-tree-select` not support return node instance as argument anymore. Please consider to remove `props` access.');
        return cloneNode;
      }
    });
  }
  return cloneNode;
}
export function fillAdditionalInfo(extra, triggerValue, checkedValues, treeData, showPosition, fieldNames) {
  let triggerNode = null;
  let nodeList = null;
  function generateMap() {
    function dig(list, level = '0', parentIncluded = false) {
      return list.map((option, index) => {
        const pos = `${level}-${index}`;
        const value = option[fieldNames.value];
        const included = checkedValues.includes(value);
        const children = dig(option[fieldNames.children] || [], pos, included);
        const node = /*#__PURE__*/React.createElement(TreeNode, option, children.map(child => child.node));

        // Link with trigger node
        if (triggerValue === value) {
          triggerNode = node;
        }
        if (included) {
          const checkedNode = {
            pos,
            node,
            children
          };
          if (!parentIncluded) {
            nodeList.push(checkedNode);
          }
          return checkedNode;
        }
        return null;
      }).filter(node => node);
    }
    if (!nodeList) {
      nodeList = [];
      dig(treeData);

      // Sort to keep the checked node length
      nodeList.sort(({
        node: {
          props: {
            value: val1
          }
        }
      }, {
        node: {
          props: {
            value: val2
          }
        }
      }) => {
        const index1 = checkedValues.indexOf(val1);
        const index2 = checkedValues.indexOf(val2);
        return index1 - index2;
      });
    }
  }
  Object.defineProperty(extra, 'triggerNode', {
    get() {
      warning(false, '`triggerNode` is deprecated. Please consider decoupling data with node.');
      generateMap();
      return triggerNode;
    }
  });
  Object.defineProperty(extra, 'allCheckedNodes', {
    get() {
      warning(false, '`allCheckedNodes` is deprecated. Please consider decoupling data with node.');
      generateMap();
      if (showPosition) {
        return nodeList;
      }
      return nodeList.map(({
        node
      }) => node);
    }
  });
}