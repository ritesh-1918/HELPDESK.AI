import React, { useContext, useRef } from 'react';
import isVisible from "@rc-component/util/es/Dom/isVisible";
import { composeRef, getNodeRef, supportRef } from "@rc-component/util/es/ref";
import { clsx } from 'clsx';
import { ConfigContext } from '../../config-provider';
import { cloneElement } from '../reactNode';
import useStyle from './style';
import useWave from './useWave';
const Wave = props => {
  const {
    children,
    disabled,
    component,
    colorSource
  } = props;
  const {
    getPrefixCls
  } = useContext(ConfigContext);
  const containerRef = useRef(null);
  // ============================== Style ===============================
  const prefixCls = getPrefixCls('wave');
  const hashId = useStyle(prefixCls);
  // =============================== Wave ===============================
  const showWave = useWave(containerRef, clsx(prefixCls, hashId), component, colorSource);
  // ============================== Effect ==============================
  React.useEffect(() => {
    const node = containerRef.current;
    if (!node || node.nodeType !== window.Node.ELEMENT_NODE || disabled) {
      return;
    }
    // Click handler
    const onClick = e => {
      // Fix radio button click twice
      if (!isVisible(e.target) ||
      // No need wave
      !node.getAttribute || node.getAttribute('disabled') || node.disabled || node.className.includes('disabled') && !node.className.includes('disabled:') || node.getAttribute('aria-disabled') === 'true' || node.className.includes('-leave')) {
        return;
      }
      showWave(e);
    };
    // Bind events
    node.addEventListener('click', onClick, true);
    return () => {
      node.removeEventListener('click', onClick, true);
    };
  }, [disabled]);
  // ============================== Render ==============================
  if (! /*#__PURE__*/React.isValidElement(children)) {
    return children ?? null;
  }
  const ref = supportRef(children) ? composeRef(getNodeRef(children), containerRef) : containerRef;
  return cloneElement(children, {
    ref
  });
};
if (process.env.NODE_ENV !== 'production') {
  Wave.displayName = 'Wave';
}
export default Wave;