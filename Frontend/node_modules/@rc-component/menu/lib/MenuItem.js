"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _clsx = require("clsx");
var _overflow = _interopRequireDefault(require("@rc-component/overflow"));
var _KeyCode = _interopRequireDefault(require("@rc-component/util/lib/KeyCode"));
var _omit = _interopRequireDefault(require("@rc-component/util/lib/omit"));
var _ref = require("@rc-component/util/lib/ref");
var _warning = _interopRequireDefault(require("@rc-component/util/lib/warning"));
var React = _interopRequireWildcard(require("react"));
var _IdContext = require("./context/IdContext");
var _MenuContext = require("./context/MenuContext");
var _PathContext = require("./context/PathContext");
var _PrivateContext = _interopRequireDefault(require("./context/PrivateContext"));
var _useActive = _interopRequireDefault(require("./hooks/useActive"));
var _useDirectionStyle = _interopRequireDefault(require("./hooks/useDirectionStyle"));
var _Icon = _interopRequireDefault(require("./Icon"));
var _warnUtil = require("./utils/warnUtil");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
// Since Menu event provide the `info.item` which point to the MenuItem node instance.
// We have to use class component here.
// This should be removed from doc & api in future.
class LegacyMenuItem extends React.Component {
  render() {
    const {
      title,
      attribute,
      elementRef,
      ...restProps
    } = this.props;

    // Here the props are eventually passed to the DOM element.
    // React does not recognize non-standard attributes.
    // Therefore, remove the props that is not used here.
    // ref: https://github.com/ant-design/ant-design/issues/41395
    const passedProps = (0, _omit.default)(restProps, ['eventKey', 'popupClassName', 'popupOffset', 'onTitleClick']);
    (0, _warning.default)(!attribute, '`attribute` of Menu.Item is deprecated. Please pass attribute directly.');
    return /*#__PURE__*/React.createElement(_overflow.default.Item, _extends({}, attribute, {
      title: typeof title === 'string' ? title : undefined
    }, passedProps, {
      ref: elementRef
    }));
  }
}

/**
 * Real Menu Item component
 */
const InternalMenuItem = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    style,
    className,
    eventKey,
    warnKey,
    disabled,
    itemIcon,
    children,
    // Aria
    role,
    // Active
    onMouseEnter,
    onMouseLeave,
    onClick,
    onKeyDown,
    onFocus,
    ...restProps
  } = props;
  const domDataId = (0, _IdContext.useMenuId)(eventKey);
  const {
    prefixCls,
    onItemClick,
    disabled: contextDisabled,
    overflowDisabled,
    // Icon
    itemIcon: contextItemIcon,
    // Select
    selectedKeys,
    // Active
    onActive
  } = React.useContext(_MenuContext.MenuContext);
  const {
    _internalRenderMenuItem
  } = React.useContext(_PrivateContext.default);
  const itemCls = `${prefixCls}-item`;
  const legacyMenuItemRef = React.useRef();
  const elementRef = React.useRef();
  const mergedDisabled = contextDisabled || disabled;
  const mergedEleRef = (0, _ref.useComposeRef)(ref, elementRef);
  const connectedKeys = (0, _PathContext.useFullPath)(eventKey);

  // ================================ Warn ================================
  if (process.env.NODE_ENV !== 'production' && warnKey) {
    (0, _warning.default)(false, 'MenuItem should not leave undefined `key`.');
  }

  // ============================= Info =============================
  const getEventInfo = e => {
    return {
      key: eventKey,
      // Note: For legacy code is reversed which not like other antd component
      keyPath: [...connectedKeys].reverse(),
      item: legacyMenuItemRef.current,
      domEvent: e
    };
  };

  // ============================= Icon =============================
  const mergedItemIcon = itemIcon || contextItemIcon;

  // ============================ Active ============================
  const {
    active,
    ...activeProps
  } = (0, _useActive.default)(eventKey, mergedDisabled, onMouseEnter, onMouseLeave);

  // ============================ Select ============================
  const selected = selectedKeys.includes(eventKey);

  // ======================== DirectionStyle ========================
  const directionStyle = (0, _useDirectionStyle.default)(connectedKeys.length);

  // ============================ Events ============================
  const onInternalClick = e => {
    if (mergedDisabled) {
      return;
    }
    const info = getEventInfo(e);
    onClick?.((0, _warnUtil.warnItemProp)(info));
    onItemClick(info);
  };
  const onInternalKeyDown = e => {
    onKeyDown?.(e);
    if (e.which === _KeyCode.default.ENTER) {
      const info = getEventInfo(e);

      // Legacy. Key will also trigger click event
      onClick?.((0, _warnUtil.warnItemProp)(info));
      onItemClick(info);
    }
  };

  /**
   * Used for accessibility. Helper will focus element without key board.
   * We should manually trigger an active
   */
  const onInternalFocus = e => {
    onActive(eventKey);
    onFocus?.(e);
  };

  // ============================ Render ============================
  const optionRoleProps = {};
  if (props.role === 'option') {
    optionRoleProps['aria-selected'] = selected;
  }
  let renderNode = /*#__PURE__*/React.createElement(LegacyMenuItem, _extends({
    ref: legacyMenuItemRef,
    elementRef: mergedEleRef,
    role: role === null ? 'none' : role || 'menuitem',
    tabIndex: disabled ? null : -1,
    "data-menu-id": overflowDisabled && domDataId ? null : domDataId
  }, (0, _omit.default)(restProps, ['extra']), activeProps, optionRoleProps, {
    component: "li",
    "aria-disabled": disabled,
    style: {
      ...directionStyle,
      ...style
    },
    className: (0, _clsx.clsx)(itemCls, {
      [`${itemCls}-active`]: active,
      [`${itemCls}-selected`]: selected,
      [`${itemCls}-disabled`]: mergedDisabled
    }, className),
    onClick: onInternalClick,
    onKeyDown: onInternalKeyDown,
    onFocus: onInternalFocus
  }), children, /*#__PURE__*/React.createElement(_Icon.default, {
    props: {
      ...props,
      isSelected: selected
    },
    icon: mergedItemIcon
  }));
  if (_internalRenderMenuItem) {
    renderNode = _internalRenderMenuItem(renderNode, props, {
      selected
    });
  }
  return renderNode;
});
function MenuItem(props, ref) {
  const {
    eventKey
  } = props;

  // ==================== Record KeyPath ====================
  const measure = (0, _PathContext.useMeasure)();
  const connectedKeyPath = (0, _PathContext.useFullPath)(eventKey);

  // eslint-disable-next-line consistent-return
  React.useEffect(() => {
    if (measure) {
      measure.registerPath(eventKey, connectedKeyPath);
      return () => {
        measure.unregisterPath(eventKey, connectedKeyPath);
      };
    }
  }, [connectedKeyPath]);
  if (measure) {
    return null;
  }

  // ======================== Render ========================
  return /*#__PURE__*/React.createElement(InternalMenuItem, _extends({}, props, {
    ref: ref
  }));
}
var _default = exports.default = /*#__PURE__*/React.forwardRef(MenuItem);