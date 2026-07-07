function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
/* eslint-disable no-lonely-if */
/**
 * Legacy code. Should avoid to use if you are new to import these code.
 */

import warning from "@rc-component/util/es/warning";
import React from 'react';
import TreeNode from "./TreeNode";
import getEntity from "./utils/keyUtil";
export { getPosition, isTreeNode } from "./utils/treeUtil";
export function arrDel(list, value) {
  if (!list) return [];
  const clone = list.slice();
  const index = clone.indexOf(value);
  if (index >= 0) {
    clone.splice(index, 1);
  }
  return clone;
}
export function arrAdd(list, value) {
  const clone = (list || []).slice();
  if (clone.indexOf(value) === -1) {
    clone.push(value);
  }
  return clone;
}
export function posToArr(pos) {
  return pos.split('-');
}
export function getDragChildrenKeys(dragNodeKey, keyEntities) {
  // not contains self
  // self for left or right drag
  const dragChildrenKeys = [];
  const entity = getEntity(keyEntities, dragNodeKey);
  function dig(list = []) {
    list.forEach(({
      key,
      children
    }) => {
      dragChildrenKeys.push(key);
      dig(children);
    });
  }
  dig(entity.children);
  return dragChildrenKeys;
}
export function isLastChild(treeNodeEntity) {
  if (treeNodeEntity.parent) {
    const posArr = posToArr(treeNodeEntity.pos);
    return Number(posArr[posArr.length - 1]) === treeNodeEntity.parent.children.length - 1;
  }
  return false;
}
export function isFirstChild(treeNodeEntity) {
  const posArr = posToArr(treeNodeEntity.pos);
  return Number(posArr[posArr.length - 1]) === 0;
}

// Only used when drag, not affect SSR.
export function calcDropPosition(event, dragNodeProps, targetNodeProps, indent, startMousePosition, allowDrop, flattenedNodes, keyEntities, expandKeys, direction) {
  const {
    clientX,
    clientY
  } = event;
  const {
    top,
    height
  } = event.target.getBoundingClientRect();
  // optional chain for testing
  const horizontalMouseOffset = (direction === 'rtl' ? -1 : 1) * ((startMousePosition?.x || 0) - clientX);
  const rawDropLevelOffset = (horizontalMouseOffset - 12) / indent;

  // Filter the expanded keys to exclude the node that not has children currently (like async nodes).
  const filteredExpandKeys = expandKeys.filter(key => keyEntities[key]?.children?.length);

  // find abstract drop node by horizontal offset
  let abstractDropNodeEntity = getEntity(keyEntities, targetNodeProps.eventKey);
  if (clientY < top + height / 2) {
    // first half, set abstract drop node to previous node
    const nodeIndex = flattenedNodes.findIndex(flattenedNode => flattenedNode.key === abstractDropNodeEntity.key);
    const prevNodeIndex = nodeIndex <= 0 ? 0 : nodeIndex - 1;
    const prevNodeKey = flattenedNodes[prevNodeIndex].key;
    abstractDropNodeEntity = getEntity(keyEntities, prevNodeKey);
  }
  const initialAbstractDropNodeKey = abstractDropNodeEntity.key;
  const abstractDragOverEntity = abstractDropNodeEntity;
  const dragOverNodeKey = abstractDropNodeEntity.key;
  let dropPosition = 0;
  let dropLevelOffset = 0;

  // Only allow cross level drop when dragging on a non-expanded node
  if (!filteredExpandKeys.includes(initialAbstractDropNodeKey)) {
    for (let i = 0; i < rawDropLevelOffset; i += 1) {
      if (isLastChild(abstractDropNodeEntity)) {
        abstractDropNodeEntity = abstractDropNodeEntity.parent;
        dropLevelOffset += 1;
      } else {
        break;
      }
    }
  }
  const abstractDragDataNode = dragNodeProps.data;
  const abstractDropDataNode = abstractDropNodeEntity.node;
  let dropAllowed = true;
  if (isFirstChild(abstractDropNodeEntity) && abstractDropNodeEntity.level === 0 && clientY < top + height / 2 && allowDrop({
    dragNode: abstractDragDataNode,
    dropNode: abstractDropDataNode,
    dropPosition: -1
  }) && abstractDropNodeEntity.key === targetNodeProps.eventKey) {
    // first half of first node in first level
    dropPosition = -1;
  } else if ((abstractDragOverEntity.children || []).length && filteredExpandKeys.includes(dragOverNodeKey)) {
    // drop on expanded node
    // only allow drop inside
    if (allowDrop({
      dragNode: abstractDragDataNode,
      dropNode: abstractDropDataNode,
      dropPosition: 0
    })) {
      dropPosition = 0;
    } else {
      dropAllowed = false;
    }
  } else if (dropLevelOffset === 0) {
    if (rawDropLevelOffset > -1.5) {
      // | Node     | <- abstractDropNode
      // | -^-===== | <- mousePosition
      // 1. try drop after
      // 2. do not allow drop
      if (allowDrop({
        dragNode: abstractDragDataNode,
        dropNode: abstractDropDataNode,
        dropPosition: 1
      })) {
        dropPosition = 1;
      } else {
        dropAllowed = false;
      }
    } else {
      // | Node     | <- abstractDropNode
      // | ---==^== | <- mousePosition
      // whether it has children or doesn't has children
      // always
      // 1. try drop inside
      // 2. try drop after
      // 3. do not allow drop
      if (allowDrop({
        dragNode: abstractDragDataNode,
        dropNode: abstractDropDataNode,
        dropPosition: 0
      })) {
        dropPosition = 0;
      } else if (allowDrop({
        dragNode: abstractDragDataNode,
        dropNode: abstractDropDataNode,
        dropPosition: 1
      })) {
        dropPosition = 1;
      } else {
        dropAllowed = false;
      }
    }
  } else {
    // | Node1 | <- abstractDropNode
    //      |  Node2  |
    // --^--|----=====| <- mousePosition
    // 1. try insert after Node1
    // 2. do not allow drop
    if (allowDrop({
      dragNode: abstractDragDataNode,
      dropNode: abstractDropDataNode,
      dropPosition: 1
    })) {
      dropPosition = 1;
    } else {
      dropAllowed = false;
    }
  }
  return {
    dropPosition,
    dropLevelOffset,
    dropTargetKey: abstractDropNodeEntity.key,
    dropTargetPos: abstractDropNodeEntity.pos,
    dragOverNodeKey,
    dropContainerKey: dropPosition === 0 ? null : abstractDropNodeEntity.parent?.key || null,
    dropAllowed
  };
}

/**
 * Return selectedKeys according with multiple prop
 * @param selectedKeys
 * @param props
 * @returns [string]
 */
export function calcSelectedKeys(selectedKeys, props) {
  if (!selectedKeys) return undefined;
  const {
    multiple
  } = props;
  if (multiple) {
    return selectedKeys.slice();
  }
  if (selectedKeys.length) {
    return [selectedKeys[0]];
  }
  return selectedKeys;
}
const internalProcessProps = props => props;
export function convertDataToTree(treeData, processor) {
  if (!treeData) return [];
  const {
    processProps = internalProcessProps
  } = processor || {};
  const list = Array.isArray(treeData) ? treeData : [treeData];
  return list.map(({
    children,
    ...props
  }) => {
    const childrenNodes = convertDataToTree(children, processor);
    return /*#__PURE__*/React.createElement(TreeNode, _extends({
      key: props.key
    }, processProps(props)), childrenNodes);
  });
}

/**
 * Parse `checkedKeys` to { checkedKeys, halfCheckedKeys } style
 */
export function parseCheckedKeys(keys) {
  if (!keys) {
    return null;
  }

  // Convert keys to object format
  let keyProps;
  if (Array.isArray(keys)) {
    // [Legacy] Follow the api doc
    keyProps = {
      checkedKeys: keys,
      halfCheckedKeys: undefined
    };
  } else if (typeof keys === 'object') {
    keyProps = {
      checkedKeys: keys.checked || undefined,
      halfCheckedKeys: keys.halfChecked || undefined
    };
  } else {
    warning(false, '`checkedKeys` is not an array or an object');
    return null;
  }
  return keyProps;
}

/**
 * If user use `autoExpandParent` we should get the list of parent node
 * @param keyList
 * @param keyEntities
 */
export function conductExpandParent(keyList, keyEntities) {
  const expandedKeys = new Set();
  function conductUp(key) {
    if (expandedKeys.has(key)) return;
    const entity = getEntity(keyEntities, key);
    if (!entity) return;
    expandedKeys.add(key);
    const {
      parent,
      node
    } = entity;
    if (node.disabled) return;
    if (parent) {
      conductUp(parent.key);
    }
  }
  (keyList || []).forEach(key => {
    conductUp(key);
  });
  return [...expandedKeys];
}