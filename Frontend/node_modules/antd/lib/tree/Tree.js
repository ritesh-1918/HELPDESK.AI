"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireDefault(require("react"));
var _HolderOutlined = _interopRequireDefault(require("@ant-design/icons/HolderOutlined"));
var _tree = _interopRequireDefault(require("@rc-component/tree"));
var _clsx = require("clsx");
var _hooks = require("../_util/hooks");
var _motion = _interopRequireDefault(require("../_util/motion"));
var _configProvider = require("../config-provider");
var _context = require("../config-provider/context");
var _DisabledContext = _interopRequireDefault(require("../config-provider/DisabledContext"));
var _internal = require("../theme/internal");
var _style = _interopRequireDefault(require("./style"));
var _dropIndicator = _interopRequireDefault(require("./utils/dropIndicator"));
var _iconUtil = _interopRequireDefault(require("./utils/iconUtil"));
const Tree = /*#__PURE__*/_react.default.forwardRef((props, ref) => {
  const {
    getPrefixCls,
    direction,
    className: contextClassName,
    style: contextStyle,
    classNames: contextClassNames,
    styles: contextStyles
  } = (0, _context.useComponentConfig)('tree');
  const {
    virtual
  } = _react.default.useContext(_configProvider.ConfigContext);
  const {
    prefixCls: customizePrefixCls,
    className,
    showIcon = false,
    showLine,
    switcherIcon,
    switcherLoadingIcon,
    blockNode = false,
    children,
    checkable = false,
    selectable = true,
    draggable,
    disabled,
    motion: customMotion,
    style,
    rootClassName,
    classNames,
    styles
  } = props;
  const contextDisabled = _react.default.useContext(_DisabledContext.default);
  const mergedDisabled = disabled ?? contextDisabled;
  const prefixCls = getPrefixCls('tree', customizePrefixCls);
  const rootPrefixCls = getPrefixCls();
  const motion = customMotion ?? {
    ...(0, _motion.default)(rootPrefixCls),
    motionAppear: false
  };
  // =========== Merged Props for Semantic ==========
  const mergedProps = {
    ...props,
    showIcon,
    blockNode,
    checkable,
    selectable,
    disabled: mergedDisabled,
    motion
  };
  const [mergedClassNames, mergedStyles] = (0, _hooks.useMergeSemantic)([contextClassNames, classNames], [contextStyles, styles], {
    props: mergedProps
  });
  const newProps = {
    ...mergedProps,
    showLine: Boolean(showLine),
    dropIndicatorRender: _dropIndicator.default
  };
  const [hashId, cssVarCls] = (0, _style.default)(prefixCls);
  const [, token] = (0, _internal.useToken)();
  const itemHeight = token.paddingXS / 2 + (token.Tree?.titleHeight || token.controlHeightSM);
  const draggableConfig = _react.default.useMemo(() => {
    if (!draggable) {
      return false;
    }
    let mergedDraggable = {};
    switch (typeof draggable) {
      case 'function':
        mergedDraggable.nodeDraggable = draggable;
        break;
      case 'object':
        mergedDraggable = {
          ...draggable
        };
        break;
      default:
        break;
      // Do nothing
    }
    if (mergedDraggable.icon !== false) {
      mergedDraggable.icon = mergedDraggable.icon || /*#__PURE__*/_react.default.createElement(_HolderOutlined.default, null);
    }
    return mergedDraggable;
  }, [draggable]);
  const renderSwitcherIcon = nodeProps => (/*#__PURE__*/_react.default.createElement(_iconUtil.default, {
    prefixCls: prefixCls,
    switcherIcon: switcherIcon,
    switcherLoadingIcon: switcherLoadingIcon,
    treeNodeProps: nodeProps,
    showLine: showLine
  }));
  return (
    /*#__PURE__*/
    // @ts-ignore
    _react.default.createElement(_tree.default, {
      itemHeight: itemHeight,
      ref: ref,
      virtual: virtual,
      ...newProps,
      // newProps may contain style so declare style below it
      prefixCls: prefixCls,
      className: (0, _clsx.clsx)({
        [`${prefixCls}-icon-hide`]: !showIcon,
        [`${prefixCls}-block-node`]: blockNode,
        [`${prefixCls}-unselectable`]: !selectable,
        [`${prefixCls}-rtl`]: direction === 'rtl',
        [`${prefixCls}-disabled`]: mergedDisabled
      }, contextClassName, className, hashId, cssVarCls),
      style: {
        ...contextStyle,
        ...style
      },
      rootClassName: (0, _clsx.clsx)(mergedClassNames?.root, rootClassName),
      rootStyle: mergedStyles?.root,
      classNames: mergedClassNames,
      styles: mergedStyles,
      direction: direction,
      checkable: checkable ? /*#__PURE__*/_react.default.createElement("span", {
        className: `${prefixCls}-checkbox-inner`
      }) : checkable,
      selectable: selectable,
      switcherIcon: renderSwitcherIcon,
      draggable: draggableConfig
    }, children)
  );
});
if (process.env.NODE_ENV !== 'production') {
  Tree.displayName = 'Tree';
}
var _default = exports.default = Tree;