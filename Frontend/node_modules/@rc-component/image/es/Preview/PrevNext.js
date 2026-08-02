import { clsx } from 'clsx';
import * as React from 'react';
export default function PrevNext(props) {
  const {
    prefixCls,
    onActive,
    current,
    count,
    icons: {
      left,
      right,
      prev,
      next
    }
  } = props;
  const switchCls = `${prefixCls}-switch`;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: clsx(switchCls, `${switchCls}-prev`, {
      [`${switchCls}-disabled`]: current === 0
    }),
    onClick: () => onActive(-1)
  }, prev ?? left), /*#__PURE__*/React.createElement("div", {
    className: clsx(switchCls, `${switchCls}-next`, {
      [`${switchCls}-disabled`]: current === count - 1
    }),
    onClick: () => onActive(1)
  }, next ?? right));
}