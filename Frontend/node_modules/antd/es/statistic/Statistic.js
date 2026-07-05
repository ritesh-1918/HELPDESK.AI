"use client";

import * as React from 'react';
import pickAttrs from "@rc-component/util/es/pickAttrs";
import { clsx } from 'clsx';
import { useMergeSemantic } from '../_util/hooks';
import { devUseWarning } from '../_util/warning';
import { useComponentConfig } from '../config-provider/context';
import Skeleton from '../skeleton';
import StatisticNumber from './Number';
import useStyle from './style';
const Statistic = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    prefixCls: customizePrefixCls,
    className,
    rootClassName,
    style,
    valueStyle,
    value = 0,
    title,
    valueRender,
    prefix,
    suffix,
    loading = false,
    /* --- FormatConfig starts --- */
    formatter,
    precision,
    decimalSeparator = '.',
    groupSeparator = ',',
    /* --- FormatConfig starts --- */
    onMouseEnter,
    onMouseLeave,
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
  } = useComponentConfig('statistic');
  const prefixCls = getPrefixCls('statistic', customizePrefixCls);
  const [hashId, cssVarCls] = useStyle(prefixCls);
  const mergedProps = {
    ...props,
    decimalSeparator,
    groupSeparator,
    loading,
    value
  };
  const [mergedClassNames, mergedStyles] = useMergeSemantic([contextClassNames, classNames], [contextStyles, styles], {
    props: mergedProps
  });
  // ============================= Warning ==============================
  if (process.env.NODE_ENV !== 'production') {
    const warning = devUseWarning('Statistic');
    [['valueStyle', 'styles.content']].forEach(([deprecatedName, newName]) => {
      warning.deprecated(!(deprecatedName in props), deprecatedName, newName);
    });
  }
  const valueNode = /*#__PURE__*/React.createElement(StatisticNumber, {
    decimalSeparator: decimalSeparator,
    groupSeparator: groupSeparator,
    prefixCls: prefixCls,
    formatter: formatter,
    precision: precision,
    value: value
  });
  const rootClassNames = clsx(prefixCls, {
    [`${prefixCls}-rtl`]: direction === 'rtl'
  }, contextClassName, className, rootClassName, mergedClassNames.root, hashId, cssVarCls);
  const headerClassNames = clsx(`${prefixCls}-header`, mergedClassNames.header);
  const titleClassNames = clsx(`${prefixCls}-title`, mergedClassNames.title);
  const contentClassNames = clsx(`${prefixCls}-content`, mergedClassNames.content);
  const prefixClassNames = clsx(`${prefixCls}-content-prefix`, mergedClassNames.prefix);
  const suffixClassNames = clsx(`${prefixCls}-content-suffix`, mergedClassNames.suffix);
  const internalRef = React.useRef(null);
  React.useImperativeHandle(ref, () => ({
    nativeElement: internalRef.current
  }));
  const restProps = pickAttrs(rest, {
    aria: true,
    data: true
  });
  return /*#__PURE__*/React.createElement("div", {
    ...restProps,
    className: rootClassNames,
    style: {
      ...mergedStyles.root,
      ...contextStyle,
      ...style
    },
    ref: internalRef,
    onMouseEnter: onMouseEnter,
    onMouseLeave: onMouseLeave
  }, title && (/*#__PURE__*/React.createElement("div", {
    className: headerClassNames,
    style: mergedStyles.header
  }, /*#__PURE__*/React.createElement("div", {
    className: titleClassNames,
    style: mergedStyles.title
  }, title))), /*#__PURE__*/React.createElement(Skeleton, {
    paragraph: false,
    loading: loading,
    className: `${prefixCls}-skeleton`,
    active: true
  }, /*#__PURE__*/React.createElement("div", {
    className: contentClassNames,
    style: {
      ...valueStyle,
      ...mergedStyles.content
    }
  }, prefix && (/*#__PURE__*/React.createElement("span", {
    className: prefixClassNames,
    style: mergedStyles.prefix
  }, prefix)), valueRender ? valueRender(valueNode) : valueNode, suffix && (/*#__PURE__*/React.createElement("span", {
    className: suffixClassNames,
    style: mergedStyles.suffix
  }, suffix)))));
});
if (process.env.NODE_ENV !== 'production') {
  Statistic.displayName = 'Statistic';
}
export default Statistic;