"use strict";
"use client";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));
var React = _interopRequireWildcard(require("react"));
var _FileOutlined = _interopRequireDefault(require("@ant-design/icons/FileOutlined"));
var _FolderOpenOutlined = _interopRequireDefault(require("@ant-design/icons/FolderOpenOutlined"));
var _FolderOutlined = _interopRequireDefault(require("@ant-design/icons/FolderOutlined"));
var _util = require("@rc-component/tree/lib/util");
var _treeUtil = require("@rc-component/tree/lib/utils/treeUtil");
var _clsx = require("clsx");
var _configProvider = require("../config-provider");
var _Tree = _interopRequireDefault(require("./Tree"));
var _dictUtil = require("./utils/dictUtil");
function getIcon(props) {
  const {
    isLeaf,
    expanded
  } = props;
  if (isLeaf) {
    return /*#__PURE__*/React.createElement(_FileOutlined.default, null);
  }
  return expanded ? /*#__PURE__*/React.createElement(_FolderOpenOutlined.default, null) : /*#__PURE__*/React.createElement(_FolderOutlined.default, null);
}
function getTreeData({
  treeData,
  children
}) {
  return treeData || (0, _treeUtil.convertTreeToData)(children);
}
const DirectoryTree = ({
  defaultExpandAll,
  defaultExpandParent,
  defaultExpandedKeys,
  ...props
}, ref) => {
  // Shift click usage
  const lastSelectedKey = React.useRef(null);
  const cachedSelectedKeys = React.useRef(null);
  const getInitExpandedKeys = () => {
    const {
      keyEntities
    } = (0, _treeUtil.convertDataToEntities)(getTreeData(props), {
      fieldNames: props.fieldNames
    });
    let initExpandedKeys;
    const mergedExpandedKeys = props.expandedKeys || defaultExpandedKeys || [];
    // Expanded keys
    if (defaultExpandAll) {
      initExpandedKeys = Object.keys(keyEntities);
    } else if (defaultExpandParent) {
      initExpandedKeys = (0, _util.conductExpandParent)(mergedExpandedKeys, keyEntities);
    } else {
      initExpandedKeys = mergedExpandedKeys;
    }
    return initExpandedKeys;
  };
  const [selectedKeys, setSelectedKeys] = React.useState(props.selectedKeys || props.defaultSelectedKeys || []);
  const [expandedKeys, setExpandedKeys] = React.useState(() => getInitExpandedKeys());
  React.useEffect(() => {
    if ('selectedKeys' in props) {
      setSelectedKeys(props.selectedKeys);
    }
  }, [props.selectedKeys]);
  React.useEffect(() => {
    if ('expandedKeys' in props) {
      setExpandedKeys(props.expandedKeys);
    }
  }, [props.expandedKeys]);
  const onExpand = (keys, info) => {
    if (!('expandedKeys' in props)) {
      setExpandedKeys(keys);
    }
    // Call origin function
    return props.onExpand?.(keys, info);
  };
  const onSelect = (keys, event) => {
    const {
      multiple,
      fieldNames
    } = props;
    const {
      node,
      nativeEvent
    } = event;
    const {
      key = ''
    } = node;
    const treeData = getTreeData(props);
    // We need wrap this event since some value is not same
    const newEvent = {
      ...event,
      selected: true // Directory selected always true
    };
    // Windows / Mac single pick
    const ctrlPick = nativeEvent?.ctrlKey || nativeEvent?.metaKey;
    const shiftPick = nativeEvent?.shiftKey;
    // Generate new selected keys
    let newSelectedKeys;
    if (multiple && ctrlPick) {
      // Control click
      newSelectedKeys = keys;
      lastSelectedKey.current = key;
      cachedSelectedKeys.current = newSelectedKeys;
      newEvent.selectedNodes = (0, _dictUtil.convertDirectoryKeysToNodes)(treeData, newSelectedKeys, fieldNames);
    } else if (multiple && shiftPick) {
      // Shift click
      newSelectedKeys = Array.from(new Set([].concat((0, _toConsumableArray2.default)(cachedSelectedKeys.current || []), (0, _toConsumableArray2.default)((0, _dictUtil.calcRangeKeys)({
        treeData,
        expandedKeys,
        startKey: key,
        endKey: lastSelectedKey.current,
        fieldNames
      })))));
      newEvent.selectedNodes = (0, _dictUtil.convertDirectoryKeysToNodes)(treeData, newSelectedKeys, fieldNames);
    } else {
      // Single click
      newSelectedKeys = [key];
      lastSelectedKey.current = key;
      cachedSelectedKeys.current = newSelectedKeys;
      newEvent.selectedNodes = (0, _dictUtil.convertDirectoryKeysToNodes)(treeData, newSelectedKeys, fieldNames);
    }
    props.onSelect?.(newSelectedKeys, newEvent);
    if (!('selectedKeys' in props)) {
      setSelectedKeys(newSelectedKeys);
    }
  };
  const {
    getPrefixCls,
    direction
  } = React.useContext(_configProvider.ConfigContext);
  const {
    prefixCls: customizePrefixCls,
    className,
    showIcon = true,
    expandAction = 'click',
    ...restProps
  } = props;
  const prefixCls = getPrefixCls('tree', customizePrefixCls);
  const connectClassName = (0, _clsx.clsx)(`${prefixCls}-directory`, {
    [`${prefixCls}-directory-rtl`]: direction === 'rtl'
  }, className);
  return /*#__PURE__*/React.createElement(_Tree.default, {
    icon: getIcon,
    ref: ref,
    blockNode: true,
    ...restProps,
    showIcon: showIcon,
    expandAction: expandAction,
    prefixCls: prefixCls,
    className: connectClassName,
    expandedKeys: expandedKeys,
    selectedKeys: selectedKeys,
    onSelect: onSelect,
    onExpand: onExpand
  });
};
const ForwardDirectoryTree = /*#__PURE__*/React.forwardRef(DirectoryTree);
if (process.env.NODE_ENV !== 'production') {
  ForwardDirectoryTree.displayName = 'DirectoryTree';
}
var _default = exports.default = ForwardDirectoryTree;