"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.convertChildrenToData = convertChildrenToData;
exports.fillAdditionalInfo = fillAdditionalInfo;
exports.fillLegacyProps = fillLegacyProps;
var React = _interopRequireWildcard(require("react"));
var _toArray = _interopRequireDefault(require("@rc-component/util/lib/Children/toArray"));
var _warning = _interopRequireDefault(require("@rc-component/util/lib/warning"));
var _TreeNode = _interopRequireDefault(require("../TreeNode"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function convertChildrenToData(nodes) {
  return (0, _toArray.default)(nodes).map(node => {
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
function fillLegacyProps(dataNode) {
  if (!dataNode) {
    return dataNode;
  }
  const cloneNode = {
    ...dataNode
  };
  if (!('props' in cloneNode)) {
    Object.defineProperty(cloneNode, 'props', {
      get() {
        (0, _warning.default)(false, 'New `rc-tree-select` not support return node instance as argument anymore. Please consider to remove `props` access.');
        return cloneNode;
      }
    });
  }
  return cloneNode;
}
function fillAdditionalInfo(extra, triggerValue, checkedValues, treeData, showPosition, fieldNames) {
  let triggerNode = null;
  let nodeList = null;
  function generateMap() {
    function dig(list, level = '0', parentIncluded = false) {
      return list.map((option, index) => {
        const pos = `${level}-${index}`;
        const value = option[fieldNames.value];
        const included = checkedValues.includes(value);
        const children = dig(option[fieldNames.children] || [], pos, included);
        const node = /*#__PURE__*/React.createElement(_TreeNode.default, option, children.map(child => child.node));

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
      (0, _warning.default)(false, '`triggerNode` is deprecated. Please consider decoupling data with node.');
      generateMap();
      return triggerNode;
    }
  });
  Object.defineProperty(extra, 'allCheckedNodes', {
    get() {
      (0, _warning.default)(false, '`allCheckedNodes` is deprecated. Please consider decoupling data with node.');
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