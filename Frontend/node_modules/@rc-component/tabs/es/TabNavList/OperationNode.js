function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
import { clsx } from 'clsx';
import Dropdown from '@rc-component/dropdown';
import Menu, { MenuItem } from '@rc-component/menu';
import KeyCode from "@rc-component/util/es/KeyCode";
import * as React from 'react';
import { useEffect, useState } from 'react';
import { getRemovable } from "../util";
import AddButton from "./AddButton";
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
  const [open, setOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);
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
  const menu = /*#__PURE__*/React.createElement(Menu, {
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
    const removable = getRemovable(closable, closeIcon, editable, disabled);
    return /*#__PURE__*/React.createElement(MenuItem, {
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
      if ([KeyCode.DOWN, KeyCode.SPACE, KeyCode.ENTER].includes(which)) {
        setOpen(true);
        e.preventDefault();
      }
      return;
    }
    switch (which) {
      case KeyCode.UP:
        selectOffset(-1);
        e.preventDefault();
        break;
      case KeyCode.DOWN:
        selectOffset(1);
        e.preventDefault();
        break;
      case KeyCode.ESC:
        setOpen(false);
        break;
      case KeyCode.SPACE:
      case KeyCode.ENTER:
        if (selectedKey !== null) {
          onTabClick(selectedKey, e);
        }
        break;
    }
  }

  // ========================= Effect =========================
  useEffect(() => {
    // We use query element here to avoid React strict warning
    const ele = document.getElementById(selectedItemId);
    if (ele?.scrollIntoView) {
      ele.scrollIntoView(false);
    }
  }, [selectedItemId, selectedKey]);
  useEffect(() => {
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
  const overlayClassName = clsx(popupClassName, {
    [`${dropdownPrefix}-rtl`]: rtl
  });
  const moreNode = mobile ? null : /*#__PURE__*/React.createElement(Dropdown, _extends({
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
    className: clsx(`${prefixCls}-nav-operations`, className),
    style: style,
    ref: ref
  }, moreNode, /*#__PURE__*/React.createElement(AddButton, {
    prefixCls: prefixCls,
    locale: locale,
    editable: editable
  }));
});
export default /*#__PURE__*/React.memo(OperationNode, (_, next) =>
// https://github.com/ant-design/ant-design/issues/32544
// We'd better remove syntactic sugar in `rc-menu` since this has perf issue
next.tabMoving);