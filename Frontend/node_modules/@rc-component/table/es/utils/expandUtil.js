import * as React from 'react';
import { clsx } from 'clsx';
export function renderExpandIcon({
  prefixCls,
  record,
  onExpand,
  expanded,
  expandable
}) {
  const expandClassName = `${prefixCls}-row-expand-icon`;
  if (!expandable) {
    return /*#__PURE__*/React.createElement("span", {
      className: clsx(expandClassName, `${prefixCls}-row-spaced`)
    });
  }
  const onClick = event => {
    onExpand(record, event);
    event.stopPropagation();
  };
  return /*#__PURE__*/React.createElement("span", {
    className: clsx(expandClassName, {
      [`${prefixCls}-row-expanded`]: expanded,
      [`${prefixCls}-row-collapsed`]: !expanded
    }),
    onClick: onClick
  });
}
export function findAllChildrenKeys(data, getRowKey, childrenColumnName) {
  const keys = [];
  function dig(list) {
    (list || []).forEach((item, index) => {
      keys.push(getRowKey(item, index));
      dig(item[childrenColumnName]);
    });
  }
  dig(data);
  return keys;
}
export function computedExpandedClassName(cls, record, index, indent) {
  if (typeof cls === 'string') {
    return cls;
  }
  if (typeof cls === 'function') {
    return cls(record, index, indent);
  }
  return '';
}