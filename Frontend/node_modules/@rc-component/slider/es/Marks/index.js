import * as React from 'react';
import Mark from "./Mark";
const Marks = props => {
  const {
    prefixCls,
    marks,
    onClick
  } = props;
  const markPrefixCls = `${prefixCls}-mark`;

  // Not render mark if empty
  if (!marks.length) {
    return null;
  }
  return /*#__PURE__*/React.createElement("div", {
    className: markPrefixCls
  }, marks.map(({
    value,
    style,
    label
  }) => /*#__PURE__*/React.createElement(Mark, {
    key: value,
    prefixCls: markPrefixCls,
    style: style,
    value: value,
    onClick: onClick
  }, label)));
};
export default Marks;