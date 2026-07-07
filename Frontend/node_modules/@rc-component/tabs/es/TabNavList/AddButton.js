import * as React from 'react';
const AddButton = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    prefixCls,
    editable,
    locale,
    style
  } = props;
  if (!editable || editable.showAdd === false) {
    return null;
  }
  return /*#__PURE__*/React.createElement("button", {
    ref: ref,
    type: "button",
    className: `${prefixCls}-nav-add`,
    style: style,
    "aria-label": locale?.addAriaLabel || 'Add tab',
    onClick: event => {
      editable.onEdit('add', {
        event
      });
    }
  }, editable.addIcon || '+');
});
export default AddButton;