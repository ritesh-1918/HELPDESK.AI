"use client";

import * as React from 'react';
import CSSMotion from '@rc-component/motion';
import raf from "@rc-component/util/es/raf";
import { render, unmount } from "@rc-component/util/es/React/render";
import { composeRef } from "@rc-component/util/es/ref";
import { clsx } from 'clsx';
import { ConfigContext } from '../../config-provider';
import { genCssVar } from '../../theme/util/genStyleUtils';
import { TARGET_CLS } from './interface';
import { getTargetWaveColor } from './util';
function validateNum(value) {
  return Number.isNaN(value) ? 0 : value;
}
const WaveEffect = props => {
  const {
    className,
    target,
    component,
    colorSource
  } = props;
  const divRef = React.useRef(null);
  const {
    getPrefixCls
  } = React.useContext(ConfigContext);
  const rootPrefixCls = getPrefixCls();
  const [varName] = genCssVar(rootPrefixCls, 'wave');
  // ===================== Effect =====================
  const [color, setWaveColor] = React.useState(null);
  const [borderRadius, setBorderRadius] = React.useState([]);
  const [left, setLeft] = React.useState(0);
  const [top, setTop] = React.useState(0);
  const [width, setWidth] = React.useState(0);
  const [height, setHeight] = React.useState(0);
  const [enabled, setEnabled] = React.useState(false);
  const waveStyle = {
    left,
    top,
    width,
    height,
    borderRadius: borderRadius.map(radius => `${radius}px`).join(' ')
  };
  if (color) {
    waveStyle[varName('color')] = color;
  }
  function syncPos() {
    const nodeStyle = getComputedStyle(target);
    // Get wave color from target
    setWaveColor(getTargetWaveColor(target, colorSource));
    const isStatic = nodeStyle.position === 'static';
    // Rect
    const {
      borderLeftWidth,
      borderTopWidth
    } = nodeStyle;
    setLeft(isStatic ? target.offsetLeft : validateNum(-Number.parseFloat(borderLeftWidth)));
    setTop(isStatic ? target.offsetTop : validateNum(-Number.parseFloat(borderTopWidth)));
    setWidth(target.offsetWidth);
    setHeight(target.offsetHeight);
    // Get border radius
    const {
      borderTopLeftRadius,
      borderTopRightRadius,
      borderBottomLeftRadius,
      borderBottomRightRadius
    } = nodeStyle;
    setBorderRadius([borderTopLeftRadius, borderTopRightRadius, borderBottomRightRadius, borderBottomLeftRadius].map(radius => validateNum(Number.parseFloat(radius))));
  }
  React.useEffect(() => {
    if (target) {
      // We need delay to check position here
      // since UI may change after click
      const id = raf(() => {
        syncPos();
        setEnabled(true);
      });
      // Add resize observer to follow size
      let resizeObserver;
      if (typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(syncPos);
        resizeObserver.observe(target);
      }
      return () => {
        raf.cancel(id);
        resizeObserver?.disconnect();
      };
    }
  }, [target]);
  if (!enabled) {
    return null;
  }
  const isSmallComponent = (component === 'Checkbox' || component === 'Radio') && target?.classList.contains(TARGET_CLS);
  return /*#__PURE__*/React.createElement(CSSMotion, {
    visible: true,
    motionAppear: true,
    motionName: "wave-motion",
    motionDeadline: 5000,
    onAppearEnd: (_, event) => {
      if (event.deadline || event.propertyName === 'opacity') {
        const holder = divRef.current?.parentElement;
        unmount(holder).then(() => {
          holder?.remove();
        });
      }
      return false;
    }
  }, ({
    className: motionClassName
  }, ref) => (/*#__PURE__*/React.createElement("div", {
    ref: composeRef(divRef, ref),
    className: clsx(className, motionClassName, {
      'wave-quick': isSmallComponent
    }),
    style: waveStyle
  })));
};
const showWaveEffect = (target, info) => {
  const {
    component
  } = info;
  // Skip for unchecked checkbox
  if (component === 'Checkbox' && !target.querySelector('input')?.checked) {
    return;
  }
  // Create holder
  const holder = document.createElement('div');
  holder.style.position = 'absolute';
  holder.style.left = '0px';
  holder.style.top = '0px';
  target?.insertBefore(holder, target?.firstChild);
  render(/*#__PURE__*/React.createElement(WaveEffect, {
    ...info,
    target: target
  }), holder);
};
export default showWaveEffect;