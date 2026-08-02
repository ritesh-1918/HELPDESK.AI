import { clsx } from 'clsx';
import * as React from 'react';
import { genDataNodeKey, getRemovable } from "../util";
const TabNode = props => {
  const {
    prefixCls,
    id,
    active,
    focus,
    tab: {
      key,
      label,
      disabled,
      closeIcon,
      icon
    },
    closable,
    renderWrapper,
    removeAriaLabel,
    editable,
    onClick,
    onFocus,
    onBlur,
    onKeyDown,
    onMouseDown,
    onMouseUp,
    style,
    className,
    tabCount,
    currentPosition
  } = props;
  const tabPrefix = `${prefixCls}-tab`;
  const removable = getRemovable(closable, closeIcon, editable, disabled);
  function onInternalClick(e) {
    if (disabled) {
      return;
    }
    onClick(e);
  }
  function onRemoveTab(event) {
    event.preventDefault();
    event.stopPropagation();
    editable.onEdit('remove', {
      key,
      event
    });
  }
  const labelNode = React.useMemo(() => icon && typeof label === 'string' ? /*#__PURE__*/React.createElement("span", null, label) : label, [label, icon]);
  const btnRef = React.useRef(null);
  React.useEffect(() => {
    if (focus && btnRef.current) {
      btnRef.current.focus();
    }
  }, [focus]);
  const node = /*#__PURE__*/React.createElement("div", {
    key: key,
    "data-node-key": genDataNodeKey(key),
    className: clsx(tabPrefix, className, {
      [`${tabPrefix}-with-remove`]: removable,
      [`${tabPrefix}-active`]: active,
      [`${tabPrefix}-disabled`]: disabled,
      [`${tabPrefix}-focus`]: focus
    }),
    style: style,
    onClick: onInternalClick
  }, /*#__PURE__*/React.createElement("div", {
    ref: btnRef,
    role: "tab",
    "aria-selected": active,
    id: id && `${id}-tab-${key}`,
    className: `${tabPrefix}-btn`,
    "aria-controls": id && `${id}-panel-${key}`,
    "aria-disabled": disabled,
    tabIndex: disabled ? null : active ? 0 : -1,
    onClick: e => {
      e.stopPropagation();
      onInternalClick(e);
    },
    onKeyDown: onKeyDown,
    onMouseDown: onMouseDown,
    onMouseUp: onMouseUp,
    onFocus: onFocus,
    onBlur: onBlur
  }, focus && /*#__PURE__*/React.createElement("div", {
    "aria-live": "polite",
    style: {
      width: 0,
      height: 0,
      position: 'absolute',
      overflow: 'hidden',
      opacity: 0
    }
  }, `Tab ${currentPosition} of ${tabCount}`), icon && /*#__PURE__*/React.createElement("span", {
    className: `${tabPrefix}-icon`
  }, icon), label && labelNode), removable && /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": removeAriaLabel || 'remove',
    tabIndex: active ? 0 : -1,
    className: `${tabPrefix}-remove`,
    onClick: e => {
      e.stopPropagation();
      onRemoveTab(e);
    }
  }, closeIcon || editable.removeIcon || '×'));
  return renderWrapper ? renderWrapper(node) : node;
};
export default TabNode;