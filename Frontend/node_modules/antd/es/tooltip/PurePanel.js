"use client";

import * as React from 'react';
import { Popup } from '@rc-component/tooltip';
import { clsx } from 'clsx';
import { useMergeSemantic } from '../_util/hooks';
import { ConfigContext } from '../config-provider';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import useStyle from './style';
import { parseColor } from './util';
/** @private Internal Component. Do not use in your production. */
const PurePanel = props => {
  const {
    prefixCls: customizePrefixCls,
    className,
    placement = 'top',
    title,
    color,
    overlayInnerStyle,
    classNames,
    styles
  } = props;
  const {
    getPrefixCls
  } = React.useContext(ConfigContext);
  const prefixCls = getPrefixCls('tooltip', customizePrefixCls);
  const rootPrefixCls = getPrefixCls();
  const rootCls = useCSSVarCls(prefixCls);
  const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);
  // Color
  const colorInfo = parseColor(rootPrefixCls, prefixCls, color);
  const arrowContentStyle = colorInfo.arrowStyle;
  const innerStyles = React.useMemo(() => {
    const mergedStyle = {
      ...overlayInnerStyle,
      ...colorInfo.overlayStyle
    };
    return {
      container: mergedStyle
    };
  }, [overlayInnerStyle, colorInfo.overlayStyle]);
  const mergedProps = {
    ...props,
    placement
  };
  const [mergedClassNames, mergedStyles] = useMergeSemantic([classNames], [innerStyles, styles], {
    props: mergedProps
  });
  const rootClassName = clsx(rootCls, hashId, cssVarCls, prefixCls, `${prefixCls}-pure`, `${prefixCls}-placement-${placement}`, className, colorInfo.className);
  return /*#__PURE__*/React.createElement("div", {
    className: rootClassName,
    style: arrowContentStyle
  }, /*#__PURE__*/React.createElement("div", {
    className: `${prefixCls}-arrow`
  }), /*#__PURE__*/React.createElement(Popup, {
    ...props,
    className: hashId,
    prefixCls: prefixCls,
    classNames: mergedClassNames,
    styles: mergedStyles
  }, title));
};
export default PurePanel;