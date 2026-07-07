import * as React from 'react';
const ExtraContent = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    position,
    prefixCls,
    extra
  } = props;
  if (!extra) {
    return null;
  }
  let content;

  // Parse extra
  let assertExtra = {};
  if (typeof extra === 'object' && ! /*#__PURE__*/React.isValidElement(extra)) {
    assertExtra = extra;
  } else {
    assertExtra.right = extra;
  }
  if (position === 'right') {
    content = assertExtra.right;
  }
  if (position === 'left') {
    content = assertExtra.left;
  }
  return content ? /*#__PURE__*/React.createElement("div", {
    className: `${prefixCls}-extra-content`,
    ref: ref
  }, content) : null;
});
if (process.env.NODE_ENV !== 'production') {
  ExtraContent.displayName = 'ExtraContent';
}
export default ExtraContent;