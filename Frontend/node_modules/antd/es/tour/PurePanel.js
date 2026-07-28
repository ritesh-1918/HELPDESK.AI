"use client";

import * as React from 'react';
import { clsx } from 'clsx';
import { useClosable } from '../_util/hooks';
import { withPureRenderTheme } from '../_util/PurePanel';
import { cloneElement } from '../_util/reactNode';
import { ConfigContext } from '../config-provider';
import { RawPurePanel as PopoverRawPurePanel } from '../popover/PurePanel';
import TourPanel from './panelRender';
import useStyle from './style';
const PurePanel = props => {
  const {
    prefixCls: customizePrefixCls,
    current = 0,
    total = 6,
    className,
    style,
    type,
    closable,
    closeIcon,
    ...restProps
  } = props;
  const {
    getPrefixCls
  } = React.useContext(ConfigContext);
  const prefixCls = getPrefixCls('tour', customizePrefixCls);
  const [hashId, cssVarCls] = useStyle(prefixCls);
  const [mergedClosable, mergedCloseIcon] = useClosable({
    closable,
    closeIcon
  }, null, {
    closable: true,
    closeIconRender: icon => /*#__PURE__*/React.isValidElement(icon) ? cloneElement(icon, {
      className: clsx(icon.props?.className, `${prefixCls}-close-icon`)
    }) : icon
  });
  return /*#__PURE__*/React.createElement(PopoverRawPurePanel, {
    prefixCls: prefixCls,
    hashId: hashId,
    className: clsx(className, `${prefixCls}-pure`, type && `${prefixCls}-${type}`, cssVarCls),
    style: style
  }, /*#__PURE__*/React.createElement(TourPanel, {
    stepProps: {
      ...restProps,
      prefixCls,
      total,
      closable: mergedClosable ? {
        closeIcon: mergedCloseIcon
      } : undefined
    },
    current: current,
    type: type
  }));
};
export default withPureRenderTheme(PurePanel);