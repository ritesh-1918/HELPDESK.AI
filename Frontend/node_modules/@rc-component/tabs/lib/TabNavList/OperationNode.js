"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _clsx = require("clsx");
var _dropdown = _interopRequireDefault(require("@rc-component/dropdown"));
var _menu = _interopRequireWildcard(require("@rc-component/menu"));
var _KeyCode = _interopRequireDefault(require("@rc-component/util/lib/KeyCode"));
var _react = _interopRequireWildcard(require("react"));
var React = _react;
var _util = require("../util");
var _AddButton = _interopRequireDefault(require("./AddButton"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
const OperationNode = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    prefixCls,
    id,
    tabs,
    locale,
    mobile,
    more: moreProps = {},
    style,
    className,
    editable,
    tabBarGutter,
    rtl,
    removeAriaLabel,
    onTabClick,
    getPopupContainer,
    popupClassName,
    popupStyle
  } = props;
  // ======================== Dropdown ========================
  const [open, setOpen] = (0, _react.useState)(false);
  const [selectedKey, setSelectedKey] = (0, _react.useState)(null);
  const {
    icon: moreIcon = 'More'
  } = moreProps;
  const popupId = `${id}-more-popup`;
  const dropdownPrefix = `${prefixCls}-dropdown`;
  const selectedItemId = selectedKey !== null ? `${popupId}-${selectedKey}` : null;
  const dropdownAriaLabel = locale?.dropdownAriaLabel;
  function onRemoveTab(event, key) {
    event.preventDefault();
    event.stopPropagation();
    editable.onEdit('remove', {
      key,
      event
    });
  }
  const menu = /*#__PURE__*/React.createElement(_menu.default, {
    onClick: ({
      key,
      domEvent
    }) => {
      onTabClick(key, domEvent);
      setOpen(false);
    },
    prefixCls: `${dropdownPrefix}-menu`,
    id: popupId,
    tabIndex: -1,
    role: "listbox",
    "aria-activedescendant": selectedItemId,
    selectedKeys: [selectedKey],
    "aria-label": dropdownAriaLabel !== undefined ? dropdownAriaLabel : 'expanded dropdown'
  }, tabs.map(tab => {
    const {
      closable,
      disabled,
      closeIcon,
      key,
      label
    } = tab;
    const removable = (0, _util.getRemovable)(closable, closeIcon, editable, disabled);
    return /*#__PURE__*/React.createElement(_menu.MenuItem, {
      key: key,
      id: `${popupId}-${key}`,
      role: "option",
      "aria-controls": id && `${id}-panel-${key}`,
      disabled: disabled
    }, /*#__PURE__*/React.createElement("span", null, label), removable && /*#__PURE__*/React.createElement("button", {
      type: "button",
      "aria-label": removeAriaLabel || 'remove',
      tabIndex: 0,
      className: `${dropdownPrefix}-menu-item-remove`,
      onClick: e => {
        e.stopPropagation();
        onRemoveTab(e, key);
      }
    }, closeIcon || editable.removeIcon || '×'));
  }));
  function selectOffset(offset) {
    const enabledTabs = tabs.filter(tab => !tab.disabled);
    let selectedIndex = enabledTabs.findIndex(tab => tab.key === selectedKey) || 0;
    const len = enabledTabs.length;
    for (let i = 0; i < len; i += 1) {
      selectedIndex = (selectedIndex + offset + len) % len;
      const tab = enabledTabs[selectedIndex];
      if (!tab.disabled) {
        setSelectedKey(tab.key);
        return;
      }
    }
  }
  function onKeyDown(e) {
    const {
      which
    } = e;
    if (!open) {
      if ([_KeyCode.default.DOWN, _KeyCode.default.SPACE, _KeyCode.default.ENTER].includes(which)) {
        setOpen(true);
        e.preventDefault();
      }
      return;
    }
    switch (which) {
      case _KeyCode.default.UP:
        selectOffset(-1);
        e.preventDefault();
        break;
      case _KeyCode.default.DOWN:
        selectOffset(1);
        e.preventDefault();
        break;
      case _KeyCode.default.ESC:
        setOpen(false);
        break;
      case _KeyCode.default.SPACE:
      case _KeyCode.default.ENTER:
        if (selectedKey !== null) {
          onTabClick(selectedKey, e);
        }
        break;
    }
  }

  // ========================= Effect =========================
  (0, _react.useEffect)(() => {
    // We use query element here to avoid React strict warning
    const ele = document.getElementById(selectedItemId);
    if (ele?.scrollIntoView) {
      ele.scrollIntoView(false);
    }
  }, [selectedItemId, selectedKey]);
  (0, _react.useEffect)(() => {
    if (!open) {
      setSelectedKey(null);
    }
  }, [open]);

  // ========================= Render =========================
  const moreStyle = {
    marginInlineStart: tabBarGutter
  };
  if (!tabs.length) {
    moreStyle.visibility = 'hidden';
    moreStyle.order = 1;
  }
  const overlayClassName = (0, _clsx.clsx)(popupClassName, {
    [`${dropdownPrefix}-rtl`]: rtl
  });
  const moreNode = mobile ? null : /*#__PURE__*/React.createElement(_dropdown.default, _extends({
    prefixCls: dropdownPrefix,
    overlay: menu,
    visible: tabs.length ? open : false,
    onVisibleChange: setOpen,
    overlayClassName: overlayClassName,
    overlayStyle: popupStyle,
    mouseEnterDelay: 0.1,
    mouseLeaveDelay: 0.1,
    getPopupContainer: getPopupContainer
  }, moreProps), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: `${prefixCls}-nav-more`,
    style: moreStyle,
    "aria-haspopup": "listbox",
    "aria-controls": popupId,
    id: `${id}-more`,
    "aria-expanded": open,
    onKeyDown: onKeyDown
  }, moreIcon));
  return /*#__PURE__*/React.createElement("div", {
    className: (0, _clsx.clsx)(`${prefixCls}-nav-operations`, className),
    style: style,
    ref: ref
  }, moreNode, /*#__PURE__*/React.createElement(_AddButton.default, {
    prefixCls: prefixCls,
    locale: locale,
    editable: editable
  }));
});
var _default = exports.default = /*#__PURE__*/React.memo(OperationNode, (_, next) =>
// https://github.com/ant-design/ant-design/issues/32544
// We'd better remove syntactic sugar in `rc-menu` since this has perf issue
next.tabMoving);