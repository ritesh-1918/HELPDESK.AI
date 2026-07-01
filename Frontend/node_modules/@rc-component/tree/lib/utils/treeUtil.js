"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.convertDataToEntities = convertDataToEntities;
exports.convertNodePropsToEventData = convertNodePropsToEventData;
exports.convertTreeToData = convertTreeToData;
exports.fillFieldNames = fillFieldNames;
exports.flattenTreeData = flattenTreeData;
exports.getKey = getKey;
exports.getPosition = getPosition;
exports.getTreeNodeProps = getTreeNodeProps;
exports.isLeafNode = isLeafNode;
exports.isTreeNode = isTreeNode;
exports.traverseDataNodes = traverseDataNodes;
exports.warningWithoutKey = warningWithoutKey;
var _toArray = _interopRequireDefault(require("@rc-component/util/lib/Children/toArray"));
var _omit = _interopRequireDefault(require("@rc-component/util/lib/omit"));
var _warning = _interopRequireDefault(require("@rc-component/util/lib/warning"));
var _keyUtil = _interopRequireDefault(require("./keyUtil"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function getPosition(level, index) {
  return `${level}-${index}`;
}
function isTreeNode(node) {
  return node && node.type && node.type.isTreeNode;
}
function getKey(key, pos) {
  if (key !== null && key !== undefined) {
    return key;
  }
  return pos;
}
function fillFieldNames(fieldNames) {
  const {
    title,
    _title,
    key,
    children
  } = fieldNames || {};
  const mergedTitle = title || 'title';
  return {
    title: mergedTitle,
    _title: _title || [mergedTitle],
    key: key || 'key',
    children: children || 'children'
  };
}

/**
 * Warning if TreeNode do not provides key
 */
function warningWithoutKey(treeData, fieldNames) {
  const keys = new Map();
  function dig(list, path = '') {
    (list || []).forEach(treeNode => {
      const key = treeNode[fieldNames.key];
      const children = treeNode[fieldNames.children];
      (0, _warning.default)(key !== null && key !== undefined, `Tree node must have a certain key: [${path}${key}]`);
      const recordKey = String(key);
      (0, _warning.default)(!keys.has(recordKey) || key === null || key === undefined, `Same 'key' exist in the Tree: ${recordKey}`);
      keys.set(recordKey, true);
      dig(children, `${path}${recordKey} > `);
    });
  }
  dig(treeData);
}

/**
 * Convert `children` of Tree into `treeData` structure.
 */
function convertTreeToData(rootNodes) {
  function dig(node) {
    const treeNodes = (0, _toArray.default)(node);
    return treeNodes.map(treeNode => {
      // Filter invalidate node
      if (!isTreeNode(treeNode)) {
        (0, _warning.default)(!treeNode, 'Tree/TreeNode can only accept TreeNode as children.');
        return null;
      }
      const {
        key
      } = treeNode;
      const {
        children,
        ...rest
      } = treeNode.props;
      const dataNode = {
        key: key,
        ...rest
      };
      const parsedChildren = dig(children);
      if (parsedChildren.length) {
        dataNode.children = parsedChildren;
      }
      return dataNode;
    }).filter(dataNode => dataNode);
  }
  return dig(rootNodes);
}

/**
 * Flat nest tree data into flatten list. This is used for virtual list render.
 * @param treeNodeList Origin data node list
 * @param expandedKeys
 * need expanded keys, provides `true` means all expanded (used in `rc-tree-select`).
 */
function flattenTreeData(treeNodeList, expandedKeys, fieldNames) {
  const {
    _title: fieldTitles,
    key: fieldKey,
    children: fieldChildren
  } = fillFieldNames(fieldNames);
  const expandedKeySet = new Set(expandedKeys === true ? [] : expandedKeys);
  const flattenList = [];
  function dig(list, parent = null) {
    return list.map((treeNode, index) => {
      const pos = getPosition(parent ? parent.pos : '0', index);
      const mergedKey = getKey(treeNode[fieldKey], pos);

      // Pick matched title in field title list
      let mergedTitle;
      for (let i = 0; i < fieldTitles.length; i += 1) {
        const fieldTitle = fieldTitles[i];
        if (treeNode[fieldTitle] !== undefined) {
          mergedTitle = treeNode[fieldTitle];
          break;
        }
      }

      // Add FlattenDataNode into list
      // We use `Object.assign` here to save perf since babel's `objectSpread` has perf issue
      const flattenNode = Object.assign((0, _omit.default)(treeNode, [...fieldTitles, fieldKey, fieldChildren]), {
        title: mergedTitle,
        key: mergedKey,
        parent,
        pos,
        children: null,
        data: treeNode,
        isStart: [...(parent ? parent.isStart : []), index === 0],
        isEnd: [...(parent ? parent.isEnd : []), index === list.length - 1]
      });
      flattenList.push(flattenNode);

      // Loop treeNode children
      if (expandedKeys === true || expandedKeySet.has(mergedKey)) {
        flattenNode.children = dig(treeNode[fieldChildren] || [], flattenNode);
      } else {
        flattenNode.children = [];
      }
      return flattenNode;
    });
  }
  dig(treeNodeList);
  return flattenList;
}
/**
 * Traverse all the data by `treeData`.
 * Please not use it out of the `rc-tree` since we may refactor this code.
 */
function traverseDataNodes(dataNodes, callback,
// To avoid too many params, let use config instead of origin param
config) {
  let mergedConfig = {};
  if (typeof config === 'object') {
    mergedConfig = config;
  } else {
    mergedConfig = {
      externalGetKey: config
    };
  }
  mergedConfig = mergedConfig || {};

  // Init config
  const {
    childrenPropName,
    externalGetKey,
    fieldNames
  } = mergedConfig;
  const {
    key: fieldKey,
    children: fieldChildren
  } = fillFieldNames(fieldNames);
  const mergeChildrenPropName = childrenPropName || fieldChildren;

  // Get keys
  let syntheticGetKey;
  if (externalGetKey) {
    if (typeof externalGetKey === 'string') {
      syntheticGetKey = node => node[externalGetKey];
    } else if (typeof externalGetKey === 'function') {
      syntheticGetKey = node => externalGetKey(node);
    }
  } else {
    syntheticGetKey = (node, pos) => getKey(node[fieldKey], pos);
  }

  // Process
  function processNode(node, index, parent, pathNodes) {
    const children = node ? node[mergeChildrenPropName] : dataNodes;
    const pos = node ? getPosition(parent.pos, index) : '0';
    const connectNodes = node ? [...pathNodes, node] : [];

    // Process node if is not root
    if (node) {
      const key = syntheticGetKey(node, pos);
      const data = {
        node,
        index,
        pos,
        key,
        parentPos: parent.node ? parent.pos : null,
        level: parent.level + 1,
        nodes: connectNodes
      };
      callback(data);
    }

    // Process children node
    if (children) {
      children.forEach((subNode, subIndex) => {
        processNode(subNode, subIndex, {
          node,
          pos,
          level: parent ? parent.level + 1 : -1
        }, connectNodes);
      });
    }
  }
  processNode(null);
}
/**
 * Convert `treeData` into entity records.
 */
function convertDataToEntities(dataNodes, {
  initWrapper,
  processEntity,
  onProcessFinished,
  externalGetKey,
  childrenPropName,
  fieldNames
} = {}, /** @deprecated Use `config.externalGetKey` instead */
legacyExternalGetKey) {
  // Init config
  const mergedExternalGetKey = externalGetKey || legacyExternalGetKey;
  const posEntities = {};
  const keyEntities = {};
  let wrapper = {
    posEntities,
    keyEntities
  };
  if (initWrapper) {
    wrapper = initWrapper(wrapper) || wrapper;
  }
  traverseDataNodes(dataNodes, item => {
    const {
      node,
      index,
      pos,
      key,
      parentPos,
      level,
      nodes
    } = item;
    const entity = {
      node,
      nodes,
      index,
      key,
      pos,
      level
    };
    const mergedKey = getKey(key, pos);
    posEntities[pos] = entity;
    keyEntities[mergedKey] = entity;

    // Fill children
    entity.parent = posEntities[parentPos];
    if (entity.parent) {
      entity.parent.children = entity.parent.children || [];
      entity.parent.children.push(entity);
    }
    if (processEntity) {
      processEntity(entity, wrapper);
    }
  }, {
    externalGetKey: mergedExternalGetKey,
    childrenPropName,
    fieldNames
  });
  if (onProcessFinished) {
    onProcessFinished(wrapper);
  }
  return wrapper;
}
function isLeafNode(isLeaf, loadData, hasChildren, loaded) {
  if (isLeaf === false) {
    return false;
  }
  return isLeaf || !loadData && !hasChildren || loadData && loaded && !hasChildren;
}

/**
 * Get TreeNode props with Tree props.
 */
function getTreeNodeProps(key, {
  expandedKeys,
  selectedKeys,
  loadedKeys,
  loadingKeys,
  checkedKeys,
  halfCheckedKeys,
  dragOverNodeKey,
  dropPosition,
  keyEntities
}) {
  const entity = (0, _keyUtil.default)(keyEntities, key);
  const treeNodeProps = {
    eventKey: key,
    expanded: expandedKeys.indexOf(key) !== -1,
    selected: selectedKeys.indexOf(key) !== -1,
    loaded: loadedKeys.indexOf(key) !== -1,
    loading: loadingKeys.indexOf(key) !== -1,
    checked: checkedKeys.indexOf(key) !== -1,
    halfChecked: halfCheckedKeys.indexOf(key) !== -1,
    pos: String(entity ? entity.pos : ''),
    // [Legacy] Drag props
    // Since the interaction of drag is changed, the semantic of the props are
    // not accuracy, I think it should be finally removed
    dragOver: dragOverNodeKey === key && dropPosition === 0,
    dragOverGapTop: dragOverNodeKey === key && dropPosition === -1,
    dragOverGapBottom: dragOverNodeKey === key && dropPosition === 1
  };
  return treeNodeProps;
}
function convertNodePropsToEventData(props) {
  const {
    data,
    expanded,
    selected,
    checked,
    loaded,
    loading,
    halfChecked,
    dragOver,
    dragOverGapTop,
    dragOverGapBottom,
    pos,
    active,
    eventKey
  } = props;
  const eventData = {
    ...data,
    expanded,
    selected,
    checked,
    loaded,
    loading,
    halfChecked,
    dragOver,
    dragOverGapTop,
    dragOverGapBottom,
    pos,
    active,
    key: eventKey
  };
  if (!('props' in eventData)) {
    Object.defineProperty(eventData, 'props', {
      get() {
        (0, _warning.default)(false, 'Second param return from event is node data instead of TreeNode instance. Please read value directly instead of reading from `props`.');
        return props;
      }
    });
  }
  return eventData;
}