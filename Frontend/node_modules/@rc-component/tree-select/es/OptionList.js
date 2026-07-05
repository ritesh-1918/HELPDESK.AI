function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
import { useBaseProps } from '@rc-component/select';
import Tree from '@rc-component/tree';
import { UnstableContext } from '@rc-component/tree';
import KeyCode from "@rc-component/util/es/KeyCode";
import useMemo from "@rc-component/util/es/hooks/useMemo";
import * as React from 'react';
import LegacyContext from "./LegacyContext";
import TreeSelectContext from "./TreeSelectContext";
import { getAllKeys, isCheckDisabled } from "./utils/valueUtil";
import { useEvent } from '@rc-component/util';
const HIDDEN_STYLE = {
  width: 0,
  height: 0,
  display: 'flex',
  overflow: 'hidden',
  opacity: 0,
  border: 0,
  padding: 0,
  margin: 0
};
const OptionList = (_, ref) => {
  const {
    prefixCls,
    multiple,
    searchValue,
    toggleOpen,
    open,
    notFoundContent
  } = useBaseProps();
  const {
    virtual,
    listHeight,
    listItemHeight,
    listItemScrollOffset,
    treeData,
    fieldNames,
    onSelect,
    popupMatchSelectWidth,
    treeExpandAction,
    treeTitleRender,
    onPopupScroll,
    leftMaxCount,
    leafCountOnly,
    valueEntities,
    classNames: treeClassNames,
    styles
  } = React.useContext(TreeSelectContext);
  const {
    checkable,
    checkedKeys,
    halfCheckedKeys,
    treeExpandedKeys,
    treeDefaultExpandAll,
    treeDefaultExpandedKeys,
    onTreeExpand,
    treeIcon,
    showTreeIcon,
    switcherIcon,
    treeLine,
    treeNodeFilterProp,
    loadData,
    treeLoadedKeys,
    treeMotion,
    onTreeLoad,
    keyEntities
  } = React.useContext(LegacyContext);
  const treeRef = React.useRef();
  const memoTreeData = useMemo(() => treeData,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [open, treeData], (prev, next) => next[0] && prev[1] !== next[1]);

  // ========================== Values ==========================
  const mergedCheckedKeys = React.useMemo(() => {
    if (!checkable) {
      return null;
    }
    return {
      checked: checkedKeys,
      halfChecked: halfCheckedKeys
    };
  }, [checkable, checkedKeys, halfCheckedKeys]);

  // ========================== Scroll ==========================
  React.useEffect(() => {
    // Single mode should scroll to current key
    if (open && !multiple && checkedKeys.length) {
      treeRef.current?.scrollTo({
        key: checkedKeys[0]
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // ========================== Events ==========================
  const onListMouseDown = event => {
    event.preventDefault();
  };
  const onInternalSelect = (__, info) => {
    const {
      node
    } = info;
    if (checkable && isCheckDisabled(node)) {
      return;
    }
    onSelect(node.key, {
      selected: !checkedKeys.includes(node.key)
    });
    if (!multiple) {
      toggleOpen(false);
    }
  };

  // =========================== Keys ===========================
  const [expandedKeys, setExpandedKeys] = React.useState(treeDefaultExpandedKeys);
  const [searchExpandedKeys, setSearchExpandedKeys] = React.useState(null);
  const mergedExpandedKeys = React.useMemo(() => {
    if (treeExpandedKeys) {
      return [...treeExpandedKeys];
    }
    return searchValue ? searchExpandedKeys : expandedKeys;
  }, [expandedKeys, searchExpandedKeys, treeExpandedKeys, searchValue]);
  const onInternalExpand = keys => {
    setExpandedKeys(keys);
    setSearchExpandedKeys(keys);
    if (onTreeExpand) {
      onTreeExpand(keys);
    }
  };

  // ========================== Search ==========================
  const lowerSearchValue = String(searchValue).toLowerCase();
  const filterTreeNode = treeNode => {
    if (!lowerSearchValue) {
      return false;
    }
    return String(treeNode[treeNodeFilterProp]).toLowerCase().includes(lowerSearchValue);
  };
  React.useEffect(() => {
    if (searchValue) {
      setSearchExpandedKeys(getAllKeys(treeData, fieldNames));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]);

  // ========================= Disabled =========================
  // Cache disabled states in React state to ensure re-render when cache updates
  const [disabledCache, setDisabledCache] = React.useState(() => new Map());
  React.useEffect(() => {
    if (leftMaxCount) {
      setDisabledCache(new Map());
    }
  }, [leftMaxCount]);
  function getDisabledWithCache(node) {
    const value = node[fieldNames.value];
    if (!disabledCache.has(value)) {
      const entity = valueEntities.get(value);
      const isLeaf = (entity.children || []).length === 0;
      if (!isLeaf) {
        const checkableChildren = entity.children.filter(childTreeNode => !childTreeNode.node.disabled && !childTreeNode.node.disableCheckbox && !checkedKeys.includes(childTreeNode.node[fieldNames.value]));
        const checkableChildrenCount = checkableChildren.length;
        disabledCache.set(value, checkableChildrenCount > leftMaxCount);
      } else {
        disabledCache.set(value, false);
      }
    }
    return disabledCache.get(value);
  }
  const nodeDisabled = useEvent(node => {
    const nodeValue = node[fieldNames.value];
    if (checkedKeys.includes(nodeValue)) {
      return false;
    }
    if (leftMaxCount === null) {
      return false;
    }
    if (leftMaxCount <= 0) {
      return true;
    }

    // This is a low performance calculation
    if (leafCountOnly && leftMaxCount) {
      return getDisabledWithCache(node);
    }
    return false;
  });

  // ========================== Get First Selectable Node ==========================
  const getFirstMatchingNode = nodes => {
    for (const node of nodes) {
      if (node.disabled || node.selectable === false) {
        continue;
      }
      if (searchValue) {
        if (filterTreeNode(node)) {
          return node;
        }
      } else {
        return node;
      }
      if (node[fieldNames.children]) {
        const matchInChildren = getFirstMatchingNode(node[fieldNames.children]);
        if (matchInChildren) {
          return matchInChildren;
        }
      }
    }
    return null;
  };

  // ========================== Active ==========================
  const [activeKey, setActiveKey] = React.useState(null);
  const activeEntity = keyEntities[activeKey];
  React.useEffect(() => {
    if (!open) {
      return;
    }
    let nextActiveKey = null;
    const getFirstNode = () => {
      const firstNode = getFirstMatchingNode(memoTreeData);
      return firstNode ? firstNode[fieldNames.value] : null;
    };

    // single mode active first checked node
    if (!multiple && checkedKeys.length && !searchValue) {
      nextActiveKey = checkedKeys[0];
    } else {
      nextActiveKey = getFirstNode();
    }
    setActiveKey(nextActiveKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, searchValue]);

  // ========================= Keyboard =========================
  React.useImperativeHandle(ref, () => ({
    scrollTo: treeRef.current?.scrollTo,
    onKeyDown: event => {
      const {
        which
      } = event;
      switch (which) {
        // >>> Arrow keys
        case KeyCode.UP:
        case KeyCode.DOWN:
        case KeyCode.LEFT:
        case KeyCode.RIGHT:
          treeRef.current?.onKeyDown(event);
          break;

        // >>> Select item
        case KeyCode.ENTER:
          {
            if (activeEntity) {
              const isNodeDisabled = nodeDisabled(activeEntity.node);
              const {
                selectable,
                value,
                disabled
              } = activeEntity?.node || {};
              if (selectable !== false && !disabled && !isNodeDisabled) {
                onInternalSelect(null, {
                  node: {
                    key: activeKey
                  },
                  selected: !checkedKeys.includes(value)
                });
              }
            }
            break;
          }

        // >>> Close
        case KeyCode.ESC:
          {
            toggleOpen(false);
          }
      }
    },
    onKeyUp: () => {}
  }));
  const hasLoadDataFn = useMemo(() => searchValue ? false : true,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [searchValue, treeExpandedKeys || expandedKeys], ([preSearchValue], [nextSearchValue, nextExcludeSearchExpandedKeys]) => preSearchValue !== nextSearchValue && !!(nextSearchValue || nextExcludeSearchExpandedKeys));
  const syncLoadData = hasLoadDataFn ? loadData : null;

  // ========================== Render ==========================
  if (memoTreeData.length === 0) {
    return /*#__PURE__*/React.createElement("div", {
      role: "listbox",
      className: `${prefixCls}-empty`,
      onMouseDown: onListMouseDown
    }, notFoundContent);
  }
  const treeProps = {
    fieldNames
  };
  if (treeLoadedKeys) {
    treeProps.loadedKeys = treeLoadedKeys;
  }
  if (mergedExpandedKeys) {
    treeProps.expandedKeys = mergedExpandedKeys;
  }
  return /*#__PURE__*/React.createElement("div", {
    onMouseDown: onListMouseDown
  }, activeEntity && open && /*#__PURE__*/React.createElement("span", {
    style: HIDDEN_STYLE,
    "aria-live": "assertive"
  }, activeEntity.node.value), /*#__PURE__*/React.createElement(UnstableContext.Provider, {
    value: {
      nodeDisabled
    }
  }, /*#__PURE__*/React.createElement(Tree, _extends({
    classNames: treeClassNames?.popup,
    styles: styles?.popup,
    ref: treeRef,
    focusable: false,
    prefixCls: `${prefixCls}-tree`,
    treeData: memoTreeData,
    height: listHeight,
    itemHeight: listItemHeight,
    itemScrollOffset: listItemScrollOffset,
    virtual: virtual !== false && popupMatchSelectWidth !== false,
    multiple: multiple,
    icon: treeIcon,
    showIcon: showTreeIcon,
    switcherIcon: switcherIcon,
    showLine: treeLine,
    loadData: syncLoadData,
    motion: treeMotion,
    activeKey: activeKey
    // We handle keys by out instead tree self
    ,
    checkable: checkable,
    checkStrictly: true,
    checkedKeys: mergedCheckedKeys,
    selectedKeys: !checkable ? checkedKeys : [],
    defaultExpandAll: treeDefaultExpandAll,
    titleRender: treeTitleRender
  }, treeProps, {
    // Proxy event out
    onActiveChange: setActiveKey,
    onSelect: onInternalSelect,
    onCheck: onInternalSelect,
    onExpand: onInternalExpand,
    onLoad: onTreeLoad,
    filterTreeNode: filterTreeNode,
    expandAction: treeExpandAction,
    onScroll: onPopupScroll
  }))));
};
const RefOptionList = /*#__PURE__*/React.forwardRef(OptionList);
if (process.env.NODE_ENV !== 'production') {
  RefOptionList.displayName = 'OptionList';
}
export default RefOptionList;