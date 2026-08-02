import * as React from 'react';
export default function CloseBtn(props) {
  const {
    prefixCls,
    icon,
    onClick
  } = props;
  return /*#__PURE__*/React.createElement("button", {
    className: `${prefixCls}-close`,
    onClick: onClick
  }, icon);
}