import React from 'react';
const DropIndicator = props => {
  const {
    dropPosition,
    dropLevelOffset,
    indent
  } = props;
  const style = {
    pointerEvents: 'none',
    position: 'absolute',
    right: 0,
    backgroundColor: 'red',
    height: 2
  };
  switch (dropPosition) {
    case -1:
      style.top = 0;
      style.left = -dropLevelOffset * indent;
      break;
    case 1:
      style.bottom = 0;
      style.left = -dropLevelOffset * indent;
      break;
    case 0:
      style.bottom = 0;
      style.left = indent;
      break;
  }
  return /*#__PURE__*/React.createElement("div", {
    style: style
  });
};
if (process.env.NODE_ENV !== 'production') {
  DropIndicator.displayName = 'DropIndicator';
}
export default DropIndicator;