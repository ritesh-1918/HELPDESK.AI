import * as React from 'react';
export default function Icon({
  icon,
  props,
  children
}) {
  let iconNode;
  if (icon === null || icon === false) {
    return null;
  }
  if (typeof icon === 'function') {
    iconNode = /*#__PURE__*/React.createElement(icon, {
      ...props
    });
  } else if (typeof icon !== "boolean") {
    // Compatible for origin definition
    iconNode = icon;
  }
  return iconNode || children || null;
}