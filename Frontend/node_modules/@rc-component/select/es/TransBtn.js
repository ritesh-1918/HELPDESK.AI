import * as React from 'react';
import { clsx } from 'clsx';
/**
 * Small wrapper for Select icons (clear/arrow/etc.).
 * Prevents default mousedown to avoid blurring or caret moves, and
 * renders a custom icon or a fallback icon span.
 *
 * DOM structure:
 * <span className={className} ...>
 *   { icon || <span className={`${className}-icon`}>{children}</span> }
 * </span>
 */
const TransBtn = props => {
  const {
    className,
    style,
    customizeIcon,
    customizeIconProps,
    children,
    onMouseDown,
    onClick
  } = props;
  const icon = typeof customizeIcon === 'function' ? customizeIcon(customizeIconProps) : customizeIcon;
  return /*#__PURE__*/React.createElement("span", {
    className: className,
    onMouseDown: event => {
      event.preventDefault();
      onMouseDown?.(event);
    },
    style: {
      userSelect: 'none',
      WebkitUserSelect: 'none',
      ...style
    },
    unselectable: "on",
    onClick: onClick,
    "aria-hidden": true
  }, icon !== undefined ? icon : /*#__PURE__*/React.createElement("span", {
    className: clsx(className.split(/\s+/).map(cls => `${cls}-icon`))
  }, children));
};
export default TransBtn;