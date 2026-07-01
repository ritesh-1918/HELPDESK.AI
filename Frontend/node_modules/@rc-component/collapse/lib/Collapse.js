"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _clsx = require("clsx");
var _util = require("@rc-component/util");
var _warning = _interopRequireDefault(require("@rc-component/util/lib/warning"));
var _react = _interopRequireDefault(require("react"));
var _useItems = _interopRequireDefault(require("./hooks/useItems"));
var _Panel = _interopRequireDefault(require("./Panel"));
var _pickAttrs = _interopRequireDefault(require("@rc-component/util/lib/pickAttrs"));
function getActiveKeysArray(activeKey) {
  let currentActiveKey = activeKey;
  if (!Array.isArray(currentActiveKey)) {
    const activeKeyType = typeof currentActiveKey;
    currentActiveKey = activeKeyType === 'number' || activeKeyType === 'string' ? [currentActiveKey] : [];
  }
  return currentActiveKey.map(key => String(key));
}
const Collapse = /*#__PURE__*/_react.default.forwardRef((props, ref) => {
  const {
    prefixCls = 'rc-collapse',
    destroyOnHidden = false,
    style,
    accordion,
    className,
    children,
    collapsible,
    openMotion,
    expandIcon,
    activeKey: rawActiveKey,
    defaultActiveKey,
    onChange,
    items,
    classNames: customizeClassNames,
    styles
  } = props;
  const collapseClassName = (0, _clsx.clsx)(prefixCls, className);
  const [internalActiveKey, setActiveKey] = (0, _util.useControlledState)(defaultActiveKey, rawActiveKey);
  const activeKey = getActiveKeysArray(internalActiveKey);
  const triggerActiveKey = (0, _util.useEvent)(next => {
    const nextKeys = getActiveKeysArray(next);
    setActiveKey(nextKeys);
    onChange?.(nextKeys);
  });
  const onItemClick = key => {
    if (accordion) {
      triggerActiveKey(activeKey[0] === key ? [] : [key]);
    } else {
      triggerActiveKey(activeKey.includes(key) ? activeKey.filter(item => item !== key) : [...activeKey, key]);
    }
  };

  // ======================== Children ========================
  (0, _warning.default)(!children, '[rc-collapse] `children` will be removed in next major version. Please use `items` instead.');
  const mergedChildren = (0, _useItems.default)(items, children, {
    prefixCls,
    accordion,
    openMotion,
    expandIcon,
    collapsible,
    destroyOnHidden,
    onItemClick,
    activeKey,
    classNames: customizeClassNames,
    styles
  });

  // ======================== Render ========================
  return /*#__PURE__*/_react.default.createElement("div", (0, _extends2.default)({
    ref: ref,
    className: collapseClassName,
    style: style,
    role: accordion ? 'tablist' : undefined
  }, (0, _pickAttrs.default)(props, {
    aria: true,
    data: true
  })), mergedChildren);
});
var _default = exports.default = Object.assign(Collapse, {
  /**
   * @deprecated use `items` instead, will be removed in `v4.0.0`
   */
  Panel: _Panel.default
});