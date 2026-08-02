"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireDefault(require("react"));
var _clsx = require("clsx");
var _useId = require("@rc-component/util/lib/hooks/useId");
var _pickAttrs = _interopRequireDefault(require("@rc-component/util/lib/pickAttrs"));
var _contextTypes = require("./contextTypes");
var _Indent = _interopRequireDefault(require("./Indent"));
var _keyUtil = _interopRequireDefault(require("./utils/keyUtil"));
var _treeUtil = require("./utils/treeUtil");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
const ICON_OPEN = 'open';
const ICON_CLOSE = 'close';
const defaultTitle = '---';
const TreeNode = props => {
  const {
    eventKey,
    className,
    style,
    dragOver,
    dragOverGapTop,
    dragOverGapBottom,
    isLeaf,
    isStart,
    isEnd,
    expanded,
    selected,
    checked,
    halfChecked,
    loading,
    domRef,
    active,
    data,
    onMouseMove,
    selectable,
    treeId,
    ...otherProps
  } = props;
  const nodeId = (0, _useId.getId)(treeId, eventKey);
  const context = _react.default.useContext(_contextTypes.TreeContext);
  const {
    classNames: treeClassNames,
    styles
  } = context || {};
  const unstableContext = _react.default.useContext(_contextTypes.UnstableContext);
  const selectHandleRef = _react.default.useRef(null);
  const [dragNodeHighlight, setDragNodeHighlight] = _react.default.useState(false);

  // ======= State: Disabled State =======
  const isDisabled = !!(context.disabled || props.disabled || unstableContext.nodeDisabled?.(data));
  const isCheckable = _react.default.useMemo(() => {
    // Return false if tree or treeNode is not checkable
    if (!context.checkable || props.checkable === false) {
      return false;
    }
    return context.checkable;
  }, [context.checkable, props.checkable]);

  // ======= Event Handlers: Selection and Check =======
  const onSelect = e => {
    if (isDisabled) {
      return;
    }
    context.onNodeSelect(e, (0, _treeUtil.convertNodePropsToEventData)(props));
  };
  const onCheck = e => {
    if (isDisabled) {
      return;
    }
    if (!isCheckable || props.disableCheckbox) {
      return;
    }
    context.onNodeCheck(e, (0, _treeUtil.convertNodePropsToEventData)(props), !checked);
  };

  // ======= State: Selectable Check =======
  const isSelectable = _react.default.useMemo(() => {
    // Ignore when selectable is undefined or null
    if (typeof selectable === 'boolean') {
      return selectable;
    }
    return context.selectable;
  }, [selectable, context.selectable]);
  const onSelectorClick = e => {
    // Click trigger before select/check operation
    context.onNodeClick(e, (0, _treeUtil.convertNodePropsToEventData)(props));
    if (isSelectable) {
      onSelect(e);
    } else {
      onCheck(e);
    }
  };
  const onSelectorDoubleClick = e => {
    context.onNodeDoubleClick(e, (0, _treeUtil.convertNodePropsToEventData)(props));
  };
  const onMouseEnter = e => {
    context.onNodeMouseEnter(e, (0, _treeUtil.convertNodePropsToEventData)(props));
  };
  const onMouseLeave = e => {
    context.onNodeMouseLeave(e, (0, _treeUtil.convertNodePropsToEventData)(props));
  };
  const onContextMenu = e => {
    context.onNodeContextMenu(e, (0, _treeUtil.convertNodePropsToEventData)(props));
  };

  // ======= Drag: Drag Enabled =======
  const isDraggable = _react.default.useMemo(() => {
    return !!(context.draggable && (!context.draggable.nodeDraggable || context.draggable.nodeDraggable(data)));
  }, [context.draggable, data]);

  // ======= Drag: Drag Event Handlers =======
  const onDragStart = e => {
    e.stopPropagation();
    setDragNodeHighlight(true);
    context.onNodeDragStart(e, props);
    try {
      // ie throw error
      // firefox-need-it
      e.dataTransfer.setData('text/plain', '');
    } catch {
      // empty
    }
  };
  const onDragEnter = e => {
    e.preventDefault();
    e.stopPropagation();
    context.onNodeDragEnter(e, props);
  };
  const onDragOver = e => {
    e.preventDefault();
    e.stopPropagation();
    context.onNodeDragOver(e, props);
  };
  const onDragLeave = e => {
    e.stopPropagation();
    context.onNodeDragLeave(e, props);
  };
  const onDragEnd = e => {
    e.stopPropagation();
    setDragNodeHighlight(false);
    context.onNodeDragEnd(e, props);
  };
  const onDrop = e => {
    e.preventDefault();
    e.stopPropagation();
    setDragNodeHighlight(false);
    context.onNodeDrop(e, props);
  };

  // ======= Expand: Node Expansion =======
  const onExpand = e => {
    if (loading) {
      return;
    }
    context.onNodeExpand(e, (0, _treeUtil.convertNodePropsToEventData)(props));
  };

  // ======= State: Has Children =======
  const hasChildren = _react.default.useMemo(() => {
    const {
      children
    } = (0, _keyUtil.default)(context.keyEntities, eventKey) || {};
    return Boolean((children || []).length);
  }, [context.keyEntities, eventKey]);

  // ======= State: Leaf Check =======
  const memoizedIsLeaf = _react.default.useMemo(() => {
    return (0, _treeUtil.isLeafNode)(isLeaf, context.loadData, hasChildren, props.loaded);
  }, [isLeaf, context.loadData, hasChildren, props.loaded]);

  // ============== Effect ==============
  _react.default.useEffect(() => {
    // Load data to avoid default expanded tree without data
    if (loading) {
      return;
    }
    // read from state to avoid loadData at same time
    if (typeof context.loadData === 'function' && expanded && !memoizedIsLeaf && !props.loaded) {
      // We needn't reload data when has children in sync logic
      // It's only needed in node expanded
      context.onNodeLoad((0, _treeUtil.convertNodePropsToEventData)(props));
    }
  }, [loading, context.loadData, context.onNodeLoad, expanded, memoizedIsLeaf, props]);

  // ==================== Render: Drag Handler ====================
  const dragHandlerNode = _react.default.useMemo(() => {
    if (!context.draggable?.icon) {
      return null;
    }
    return /*#__PURE__*/_react.default.createElement("span", {
      className: `${context.prefixCls}-draggable-icon`
    }, context.draggable.icon);
  }, [context.draggable]);

  // ====================== Render: Switcher ======================
  const renderSwitcherIconDom = isInternalLeaf => {
    const switcherIcon = props.switcherIcon || context.switcherIcon;
    // if switcherIconDom is null, no render switcher span
    if (typeof switcherIcon === 'function') {
      return switcherIcon({
        ...props,
        isLeaf: isInternalLeaf
      });
    }
    return switcherIcon;
  };

  // Switcher
  const renderSwitcher = () => {
    if (memoizedIsLeaf) {
      // if switcherIconDom is null, no render switcher span
      const switcherIconDom = renderSwitcherIconDom(true);
      return switcherIconDom !== false ? /*#__PURE__*/_react.default.createElement("span", {
        className: (0, _clsx.clsx)(`${context.prefixCls}-switcher`, `${context.prefixCls}-switcher-noop`)
      }, switcherIconDom) : null;
    }
    const switcherIconDom = renderSwitcherIconDom(false);
    return switcherIconDom !== false ? /*#__PURE__*/_react.default.createElement("span", {
      onClick: onExpand,
      className: (0, _clsx.clsx)(`${context.prefixCls}-switcher`, `${context.prefixCls}-switcher_${expanded ? ICON_OPEN : ICON_CLOSE}`)
    }, switcherIconDom) : null;
  };

  // ====================== Checkbox ======================
  const checkboxNode = _react.default.useMemo(() => {
    if (!isCheckable) {
      return null;
    }

    // [Legacy] Custom element should be separate with `checkable` in future
    const $custom = typeof isCheckable !== 'boolean' ? isCheckable : null;
    return /*#__PURE__*/_react.default.createElement("span", {
      className: (0, _clsx.clsx)(`${context.prefixCls}-checkbox`, {
        [`${context.prefixCls}-checkbox-checked`]: checked,
        [`${context.prefixCls}-checkbox-indeterminate`]: !checked && halfChecked,
        [`${context.prefixCls}-checkbox-disabled`]: isDisabled || props.disableCheckbox
      }),
      onClick: onCheck,
      role: "checkbox",
      "aria-checked": halfChecked ? 'mixed' : checked,
      "aria-disabled": isDisabled || props.disableCheckbox,
      "aria-labelledby": nodeId
    }, $custom);
  }, [isCheckable, checked, halfChecked, isDisabled, props.disableCheckbox, nodeId]);

  // ============== State: Node State (Open/Close) ==============
  const nodeState = _react.default.useMemo(() => {
    if (memoizedIsLeaf) {
      return null;
    }
    return expanded ? ICON_OPEN : ICON_CLOSE;
  }, [memoizedIsLeaf, expanded]);

  // ==================== Render: Title + Icon ====================
  const iconNode = _react.default.useMemo(() => {
    return /*#__PURE__*/_react.default.createElement("span", {
      className: (0, _clsx.clsx)(treeClassNames?.itemIcon, `${context.prefixCls}-iconEle`, `${context.prefixCls}-icon__${nodeState || 'docu'}`, {
        [`${context.prefixCls}-icon_loading`]: loading
      }),
      style: styles?.itemIcon
    });
  }, [context.prefixCls, nodeState, loading]);

  // =================== Drop Indicator ===================
  const dropIndicatorNode = _react.default.useMemo(() => {
    const rootDraggable = Boolean(context.draggable);
    // allowDrop is calculated in Tree.tsx, there is no need for calc it here
    const showIndicator = !props.disabled && rootDraggable && context.dragOverNodeKey === eventKey;
    if (!showIndicator) {
      return null;
    }
    return context.dropIndicatorRender({
      dropPosition: context.dropPosition,
      dropLevelOffset: context.dropLevelOffset,
      indent: context.indent,
      prefixCls: context.prefixCls,
      direction: context.direction
    });
  }, [context.dropPosition, context.dropLevelOffset, context.indent, context.prefixCls, context.direction, context.draggable, context.dragOverNodeKey, context.dropIndicatorRender]);

  // Icon + Title
  const selectorNode = _react.default.useMemo(() => {
    const {
      title = defaultTitle
    } = props;
    const wrapClass = `${context.prefixCls}-node-content-wrapper`;

    // Icon - Still show loading icon when loading without showIcon
    let $icon;
    if (context.showIcon) {
      const currentIcon = props.icon || context.icon;
      $icon = currentIcon ? /*#__PURE__*/_react.default.createElement("span", {
        className: (0, _clsx.clsx)(treeClassNames?.itemIcon, `${context.prefixCls}-iconEle`, `${context.prefixCls}-icon__customize`),
        style: styles?.itemIcon
      }, typeof currentIcon === 'function' ? currentIcon(props) : currentIcon) : iconNode;
    } else if (context.loadData && loading) {
      $icon = iconNode;
    }

    // Title
    let titleNode;
    if (typeof title === 'function') {
      titleNode = title(data);
    } else if (context.titleRender) {
      titleNode = context.titleRender(data);
    } else {
      titleNode = title;
    }
    return /*#__PURE__*/_react.default.createElement("span", {
      ref: selectHandleRef,
      title: typeof title === 'string' ? title : '',
      className: (0, _clsx.clsx)(wrapClass, `${wrapClass}-${nodeState || 'normal'}`, {
        [`${context.prefixCls}-node-selected`]: !isDisabled && (selected || dragNodeHighlight)
      }),
      onMouseEnter: onMouseEnter,
      onMouseLeave: onMouseLeave,
      onContextMenu: onContextMenu,
      onClick: onSelectorClick,
      onDoubleClick: onSelectorDoubleClick
    }, $icon, /*#__PURE__*/_react.default.createElement("span", {
      className: (0, _clsx.clsx)(`${context.prefixCls}-title`, treeClassNames?.itemTitle),
      style: styles?.itemTitle
    }, titleNode), dropIndicatorNode);
  }, [context.prefixCls, context.showIcon, props, context.icon, iconNode, context.titleRender, data, nodeState, onMouseEnter, onMouseLeave, onContextMenu, onSelectorClick, onSelectorDoubleClick]);
  const dataOrAriaAttributeProps = (0, _pickAttrs.default)(otherProps, {
    aria: true,
    data: true
  });
  const {
    level
  } = (0, _keyUtil.default)(context.keyEntities, eventKey) || {};
  const isEndNode = isEnd[isEnd.length - 1];
  const draggableWithoutDisabled = !isDisabled && isDraggable;
  const dragging = context.draggingNodeKey === eventKey;
  return /*#__PURE__*/_react.default.createElement("div", _extends({
    ref: domRef,
    role: "treeitem",
    id: nodeId,
    "aria-expanded": memoizedIsLeaf ? undefined : expanded,
    "aria-selected": isSelectable && !isDisabled ? selected : undefined,
    "aria-checked": isCheckable && !isDisabled ? halfChecked ? 'mixed' : checked : undefined,
    "aria-disabled": isDisabled,
    className: (0, _clsx.clsx)(className, `${context.prefixCls}-treenode`, treeClassNames?.item, {
      [`${context.prefixCls}-treenode-disabled`]: isDisabled,
      [`${context.prefixCls}-treenode-switcher-${expanded ? 'open' : 'close'}`]: !isLeaf,
      [`${context.prefixCls}-treenode-checkbox-checked`]: checked,
      [`${context.prefixCls}-treenode-checkbox-indeterminate`]: halfChecked,
      [`${context.prefixCls}-treenode-selected`]: selected,
      [`${context.prefixCls}-treenode-loading`]: loading,
      [`${context.prefixCls}-treenode-active`]: active,
      [`${context.prefixCls}-treenode-leaf-last`]: isEndNode,
      [`${context.prefixCls}-treenode-draggable`]: isDraggable,
      dragging,
      'drop-target': context.dropTargetKey === eventKey,
      'drop-container': context.dropContainerKey === eventKey,
      'drag-over': !isDisabled && dragOver,
      'drag-over-gap-top': !isDisabled && dragOverGapTop,
      'drag-over-gap-bottom': !isDisabled && dragOverGapBottom,
      'filter-node': context.filterTreeNode?.((0, _treeUtil.convertNodePropsToEventData)(props)),
      [`${context.prefixCls}-treenode-leaf`]: memoizedIsLeaf
    }),
    style: {
      ...style,
      ...styles?.item
    }
    // Draggable config
    ,
    draggable: draggableWithoutDisabled,
    onDragStart: draggableWithoutDisabled ? onDragStart : undefined
    // Drop config
    ,
    onDragEnter: isDraggable ? onDragEnter : undefined,
    onDragOver: isDraggable ? onDragOver : undefined,
    onDragLeave: isDraggable ? onDragLeave : undefined,
    onDrop: isDraggable ? onDrop : undefined,
    onDragEnd: isDraggable ? onDragEnd : undefined,
    onMouseMove: onMouseMove
  }, dataOrAriaAttributeProps), /*#__PURE__*/_react.default.createElement(_Indent.default, {
    prefixCls: context.prefixCls,
    level: level,
    isStart: isStart,
    isEnd: isEnd
  }), dragHandlerNode, renderSwitcher(), checkboxNode, selectorNode);
};
TreeNode.isTreeNode = 1;
if (process.env.NODE_ENV !== 'production') {
  TreeNode.displayName = 'TreeNode';
}
var _default = exports.default = TreeNode;