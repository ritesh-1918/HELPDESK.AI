"use client";

import React from 'react';
import { QRCodeCanvas, QRCodeSVG } from '@rc-component/qrcode';
import { omit } from '@rc-component/util';
import pickAttrs from "@rc-component/util/es/pickAttrs";
import { clsx } from 'clsx';
import { useMergeSemantic } from '../_util/hooks';
import { devUseWarning } from '../_util/warning';
import { useComponentConfig } from '../config-provider/context';
import { useLocale } from '../locale';
import { useToken } from '../theme/internal';
import QRcodeStatus from './QrcodeStatus';
import useStyle from './style/index';
const QRCode = props => {
  const [, token] = useToken();
  const {
    value,
    type = 'canvas',
    icon = '',
    size = 160,
    iconSize,
    color = token.colorText,
    errorLevel = 'M',
    status = 'active',
    bordered = true,
    onRefresh,
    style,
    className,
    rootClassName,
    prefixCls: customizePrefixCls,
    bgColor = 'transparent',
    marginSize,
    statusRender,
    classNames,
    styles,
    boostLevel /* 👈 5.28.0+ */,
    ...rest
  } = props;
  const {
    getPrefixCls,
    className: contextClassName,
    style: contextStyle,
    classNames: contextClassNames,
    styles: contextStyles
  } = useComponentConfig('qrcode');
  // =========== Merged Props for Semantic ===========
  const mergedProps = {
    ...props,
    bgColor,
    type,
    size,
    status,
    bordered,
    errorLevel
  };
  const [mergedClassNames, mergedStyles] = useMergeSemantic([contextClassNames, classNames], [contextStyles, styles], {
    props: mergedProps
  });
  const prefixCls = getPrefixCls('qrcode', customizePrefixCls);
  const [hashId, cssVarCls] = useStyle(prefixCls);
  const imageSettings = {
    src: icon,
    x: undefined,
    y: undefined,
    height: typeof iconSize === 'number' ? iconSize : iconSize?.height ?? 40,
    width: typeof iconSize === 'number' ? iconSize : iconSize?.width ?? 40,
    excavate: true,
    crossOrigin: 'anonymous'
  };
  const a11yProps = pickAttrs(rest, true);
  const restProps = omit(rest, Object.keys(a11yProps));
  const qrCodeProps = {
    value,
    size,
    level: errorLevel,
    bgColor,
    fgColor: color,
    style: {
      width: style?.width,
      height: style?.height
    },
    imageSettings: icon ? imageSettings : undefined,
    marginSize,
    boostLevel,
    ...a11yProps
  };
  const [locale] = useLocale('QRCode');
  if (process.env.NODE_ENV !== 'production') {
    const warning = devUseWarning('QRCode');
    process.env.NODE_ENV !== "production" ? warning(!!value, 'usage', 'need to receive `value` props') : void 0;
    process.env.NODE_ENV !== "production" ? warning(!(icon && errorLevel === 'L'), 'usage', 'ErrorLevel `L` is not recommended to be used with `icon`, for scanning result would be affected by low level.') : void 0;
  }
  if (!value) {
    return null;
  }
  const rootClassNames = clsx(prefixCls, className, rootClassName, hashId, cssVarCls, contextClassName, mergedClassNames.root, {
    [`${prefixCls}-borderless`]: !bordered
  });
  const rootStyle = {
    backgroundColor: bgColor,
    ...mergedStyles.root,
    ...contextStyle,
    ...style,
    width: style?.width ?? size,
    height: style?.height ?? size
  };
  return /*#__PURE__*/React.createElement("div", {
    ...restProps,
    className: rootClassNames,
    style: rootStyle
  }, status !== 'active' && (/*#__PURE__*/React.createElement("div", {
    className: clsx(`${prefixCls}-cover`, mergedClassNames.cover),
    style: mergedStyles.cover
  }, /*#__PURE__*/React.createElement(QRcodeStatus, {
    prefixCls: prefixCls,
    locale: locale,
    status: status,
    onRefresh: onRefresh,
    statusRender: statusRender
  }))), type === 'canvas' ? /*#__PURE__*/React.createElement(QRCodeCanvas, {
    ...qrCodeProps
  }) : /*#__PURE__*/React.createElement(QRCodeSVG, {
    ...qrCodeProps
  }));
};
if (process.env.NODE_ENV !== 'production') {
  QRCode.displayName = 'QRCode';
}
export default QRCode;