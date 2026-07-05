"use client";

import * as React from 'react';
import StarFilled from "@ant-design/icons/es/icons/StarFilled";
import RcRate from '@rc-component/rate';
import { clsx } from 'clsx';
import { useComponentConfig } from '../config-provider/context';
import DisabledContext from '../config-provider/DisabledContext';
import Tooltip from '../tooltip';
import useStyle from './style';
const isTooltipProps = item => {
  return typeof item === 'object' && item !== null;
};
const Rate = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    prefixCls,
    className,
    rootClassName,
    style,
    tooltips,
    character = /*#__PURE__*/React.createElement(StarFilled, null),
    disabled: customDisabled,
    size = 'middle',
    ...rest
  } = props;
  const characterRender = (node, {
    index
  }) => {
    if (!tooltips) {
      return node;
    }
    const tooltipsItem = tooltips[index];
    if (isTooltipProps(tooltipsItem)) {
      return /*#__PURE__*/React.createElement(Tooltip, {
        ...tooltipsItem
      }, node);
    }
    return /*#__PURE__*/React.createElement(Tooltip, {
      title: tooltipsItem
    }, node);
  };
  const {
    getPrefixCls,
    direction,
    className: contextClassName,
    style: contextStyle
  } = useComponentConfig('rate');
  const ratePrefixCls = getPrefixCls('rate', prefixCls);
  // Style
  const [hashId, cssVarCls] = useStyle(ratePrefixCls);
  const mergedStyle = {
    ...contextStyle,
    ...style
  };
  // ===================== Disabled =====================
  const disabled = React.useContext(DisabledContext);
  const mergedDisabled = customDisabled ?? disabled;
  return /*#__PURE__*/React.createElement(RcRate, {
    ref: ref,
    character: character,
    characterRender: characterRender,
    disabled: mergedDisabled,
    ...rest,
    className: clsx(`${ratePrefixCls}-${size}`, className, rootClassName, hashId, cssVarCls, contextClassName),
    style: mergedStyle,
    prefixCls: ratePrefixCls,
    direction: direction
  });
});
if (process.env.NODE_ENV !== 'production') {
  Rate.displayName = 'Rate';
}
export default Rate;