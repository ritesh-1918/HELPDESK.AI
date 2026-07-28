import * as React from 'react';
export default function Polite(props) {
  const {
    visible,
    values
  } = props;
  if (!visible) {
    return null;
  }

  // Only cut part of values since it's a screen reader
  const MAX_COUNT = 50;
  return /*#__PURE__*/React.createElement("span", {
    "aria-live": "polite",
    style: {
      width: 0,
      height: 0,
      position: 'absolute',
      overflow: 'hidden',
      opacity: 0
    }
  }, `${values.slice(0, MAX_COUNT).map(({
    label,
    value
  }) => ['number', 'string'].includes(typeof label) ? label : value).join(', ')}`, values.length > MAX_COUNT ? ', ...' : null);
}