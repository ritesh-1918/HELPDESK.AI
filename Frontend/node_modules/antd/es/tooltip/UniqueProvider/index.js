"use client";

import React from 'react';
import { UniqueProvider as RcUniqueProvider } from '@rc-component/trigger';
import MotionContent from './MotionContent';
const cachedPlacements = [null, null];
function uniqueBuiltinPlacements(ori) {
  if (cachedPlacements[0] !== ori) {
    const target = {};
    Object.keys(ori).forEach(placement => {
      target[placement] = {
        ...ori[placement],
        dynamicInset: false
      };
    });
    cachedPlacements[0] = ori;
    cachedPlacements[1] = target;
  }
  return cachedPlacements[1];
}
const UniqueProvider = ({
  children
}) => {
  const renderPopup = options => {
    const {
      id,
      builtinPlacements,
      popup
    } = options;
    const popupEle = typeof popup === 'function' ? popup() : popup;
    const parsedPlacements = uniqueBuiltinPlacements(builtinPlacements);
    return {
      ...options,
      getPopupContainer: null,
      arrow: false,
      popup: /*#__PURE__*/React.createElement(MotionContent, {
        key: id
      }, popupEle),
      builtinPlacements: parsedPlacements
    };
  };
  return /*#__PURE__*/React.createElement(RcUniqueProvider, {
    postTriggerProps: renderPopup
  }, children);
};
export default UniqueProvider;