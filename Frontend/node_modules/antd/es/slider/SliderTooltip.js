"use client";

import * as React from 'react';
import { useRef } from 'react';
import raf from "@rc-component/util/es/raf";
import { composeRef } from "@rc-component/util/es/ref";
import Tooltip from '../tooltip';
const SliderTooltip = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    open,
    draggingDelete,
    value
  } = props;
  const innerRef = useRef(null);
  const mergedOpen = open && !draggingDelete;
  const rafRef = useRef(null);
  function cancelKeepAlign() {
    raf.cancel(rafRef.current);
    rafRef.current = null;
  }
  function keepAlign() {
    rafRef.current = raf(() => {
      innerRef.current?.forceAlign();
      rafRef.current = null;
    });
  }
  React.useEffect(() => {
    if (mergedOpen) {
      keepAlign();
    } else {
      cancelKeepAlign();
    }
    return cancelKeepAlign;
  }, [mergedOpen, props.title, value]);
  return /*#__PURE__*/React.createElement(Tooltip, {
    ref: composeRef(innerRef, ref),
    ...props,
    open: mergedOpen
  });
});
if (process.env.NODE_ENV !== 'production') {
  SliderTooltip.displayName = 'SliderTooltip';
}
export default SliderTooltip;