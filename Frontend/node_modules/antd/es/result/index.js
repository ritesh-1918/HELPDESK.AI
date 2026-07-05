"use client";

import * as React from 'react';
import CheckCircleFilled from "@ant-design/icons/es/icons/CheckCircleFilled";
import CloseCircleFilled from "@ant-design/icons/es/icons/CloseCircleFilled";
import ExclamationCircleFilled from "@ant-design/icons/es/icons/ExclamationCircleFilled";
import WarningFilled from "@ant-design/icons/es/icons/WarningFilled";
import pickAttrs from "@rc-component/util/es/pickAttrs";
import { clsx } from 'clsx';
import { useMergeSemantic } from '../_util/hooks';
import { devUseWarning } from '../_util/warning';
import { useComponentConfig } from '../config-provider/context';
import noFound from './noFound';
import serverError from './serverError';
import useStyle from './style';
import unauthorized from './unauthorized';
export const IconMap = {
  success: CheckCircleFilled,
  error: CloseCircleFilled,
  info: ExclamationCircleFilled,
  warning: WarningFilled
};
export const ExceptionMap = {
  '404': noFound,
  '500': serverError,
  '403': unauthorized
};
// ExceptionImageMap keys
const ExceptionStatus = Object.keys(ExceptionMap);
const Icon = ({
  icon,
  status,
  className,
  style
}) => {
  if (process.env.NODE_ENV !== 'production') {
    const warning = devUseWarning('Result');
    process.env.NODE_ENV !== "production" ? warning(!(typeof icon === 'string' && icon.length > 2), 'breaking', `\`icon\` is using ReactNode instead of string naming in v4. Please check \`${icon}\` at https://ant.design/components/icon`) : void 0;
  }
  if (ExceptionStatus.includes(`${status}`)) {
    const SVGComponent = ExceptionMap[status];
    return /*#__PURE__*/React.createElement("div", {
      className: className,
      style: style
    }, /*#__PURE__*/React.createElement(SVGComponent, null));
  }
  const iconNode = /*#__PURE__*/React.createElement(IconMap[status]);
  if (icon === null || icon === false) {
    return null;
  }
  return /*#__PURE__*/React.createElement("div", {
    className: className,
    style: style
  }, icon || iconNode);
};
const Extra = ({
  className,
  extra,
  style
}) => {
  if (!extra) {
    return null;
  }
  return /*#__PURE__*/React.createElement("div", {
    className: className,
    style: style
  }, extra);
};
const Result = props => {
  const {
    prefixCls: customizePrefixCls,
    className: customizeClassName,
    rootClassName,
    subTitle,
    title,
    style,
    children,
    status = 'info',
    icon,
    extra,
    styles,
    classNames,
    ...rest
  } = props;
  const {
    getPrefixCls,
    direction,
    className: contextClassName,
    style: contextStyle,
    classNames: contextClassNames,
    styles: contextStyles
  } = useComponentConfig('result');
  // =========== Merged Props for Semantic ==========
  const mergedProps = {
    ...props,
    status
  };
  const [mergedClassNames, mergedStyles] = useMergeSemantic([contextClassNames, classNames], [contextStyles, styles], {
    props: mergedProps
  });
  const prefixCls = getPrefixCls('result', customizePrefixCls);
  // Style
  const [hashId, cssVarCls] = useStyle(prefixCls);
  const rootClassNames = clsx(prefixCls, `${prefixCls}-${status}`, customizeClassName, contextClassName, rootClassName, {
    [`${prefixCls}-rtl`]: direction === 'rtl'
  }, hashId, cssVarCls, mergedClassNames.root);
  const titleClassNames = clsx(`${prefixCls}-title`, mergedClassNames.title);
  const subTitleClassNames = clsx(`${prefixCls}-subtitle`, mergedClassNames.subTitle);
  const extraClassNames = clsx(`${prefixCls}-extra`, mergedClassNames.extra);
  const bodyClassNames = clsx(`${prefixCls}-body`, mergedClassNames.body);
  const iconClassNames = clsx(`${prefixCls}-icon`, {
    [`${prefixCls}-image`]: ExceptionStatus.includes(`${status}`)
  }, mergedClassNames.icon);
  const rootStyles = {
    ...mergedStyles.root,
    ...contextStyle,
    ...style
  };
  const restProps = pickAttrs(rest, {
    aria: true,
    data: true
  });
  return /*#__PURE__*/React.createElement("div", {
    ...restProps,
    className: rootClassNames,
    style: rootStyles
  }, /*#__PURE__*/React.createElement(Icon, {
    className: iconClassNames,
    style: mergedStyles.icon,
    status: status,
    icon: icon
  }), /*#__PURE__*/React.createElement("div", {
    className: titleClassNames,
    style: mergedStyles.title
  }, title), subTitle && (/*#__PURE__*/React.createElement("div", {
    className: subTitleClassNames,
    style: mergedStyles.subTitle
  }, subTitle)), /*#__PURE__*/React.createElement(Extra, {
    className: extraClassNames,
    extra: extra,
    style: mergedStyles.extra
  }), children && (/*#__PURE__*/React.createElement("div", {
    className: bodyClassNames,
    style: mergedStyles.body
  }, children)));
};
Result.PRESENTED_IMAGE_403 = ExceptionMap['403'];
Result.PRESENTED_IMAGE_404 = ExceptionMap['404'];
Result.PRESENTED_IMAGE_500 = ExceptionMap['500'];
if (process.env.NODE_ENV !== 'production') {
  Result.displayName = 'Result';
}
export default Result;