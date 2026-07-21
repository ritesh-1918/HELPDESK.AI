import { clsx } from 'clsx';
import * as React from 'react';
const Indent = ({
  prefixCls,
  level,
  isStart,
  isEnd
}) => {
  const baseClassName = `${prefixCls}-indent-unit`;
  const list = [];
  for (let i = 0; i < level; i += 1) {
    list.push( /*#__PURE__*/React.createElement("span", {
      key: i,
      className: clsx(baseClassName, {
        [`${baseClassName}-start`]: isStart[i],
        [`${baseClassName}-end`]: isEnd[i]
      })
    }));
  }
  return /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    className: `${prefixCls}-indent`
  }, list);
};
export default /*#__PURE__*/React.memo(Indent);