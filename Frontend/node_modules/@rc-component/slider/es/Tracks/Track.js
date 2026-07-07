import { clsx } from 'clsx';
import * as React from 'react';
import SliderContext from "../context";
import { getOffset } from "../util";
const Track = props => {
  const {
    prefixCls,
    style,
    start,
    end,
    index,
    onStartMove,
    replaceCls
  } = props;
  const {
    direction,
    min,
    max,
    disabled,
    range,
    classNames
  } = React.useContext(SliderContext);
  const trackPrefixCls = `${prefixCls}-track`;
  const offsetStart = getOffset(start, min, max);
  const offsetEnd = getOffset(end, min, max);

  // ============================ Events ============================
  const onInternalStartMove = e => {
    if (!disabled && onStartMove) {
      onStartMove(e, -1);
    }
  };

  // ============================ Render ============================
  const positionStyle = {};
  switch (direction) {
    case 'rtl':
      positionStyle.right = `${offsetStart * 100}%`;
      positionStyle.width = `${offsetEnd * 100 - offsetStart * 100}%`;
      break;
    case 'btt':
      positionStyle.bottom = `${offsetStart * 100}%`;
      positionStyle.height = `${offsetEnd * 100 - offsetStart * 100}%`;
      break;
    case 'ttb':
      positionStyle.top = `${offsetStart * 100}%`;
      positionStyle.height = `${offsetEnd * 100 - offsetStart * 100}%`;
      break;
    default:
      positionStyle.left = `${offsetStart * 100}%`;
      positionStyle.width = `${offsetEnd * 100 - offsetStart * 100}%`;
  }
  const className = replaceCls || clsx(trackPrefixCls, {
    [`${trackPrefixCls}-${index + 1}`]: index !== null && range,
    [`${prefixCls}-track-draggable`]: onStartMove
  }, classNames.track);
  return /*#__PURE__*/React.createElement("div", {
    className: className,
    style: {
      ...positionStyle,
      ...style
    },
    onMouseDown: onInternalStartMove,
    onTouchStart: onInternalStartMove
  });
};
export default Track;