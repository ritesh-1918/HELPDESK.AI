"use client";

import * as React from 'react';
import { clsx } from 'clsx';
import { responsiveArrayReversed } from '../_util/responsiveObserver';
import { ConfigContext } from '../config-provider';
import { genCssVar } from '../theme/util/genStyleUtils';
import RowContext from './RowContext';
import { useColStyle } from './style';
const isNumber = value => {
  return typeof value === 'number' && !Number.isNaN(value);
};
function parseFlex(flex) {
  if (flex === 'auto') {
    return '1 1 auto';
  }
  if (isNumber(flex)) {
    return `${flex} ${flex} auto`;
  }
  if (/^\d+(\.\d+)?(px|em|rem|%)$/.test(flex)) {
    return `0 0 ${flex}`;
  }
  return flex;
}
const Col = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    getPrefixCls,
    direction
  } = React.useContext(ConfigContext);
  const {
    gutter,
    wrap
  } = React.useContext(RowContext);
  const {
    prefixCls: customizePrefixCls,
    span,
    order,
    offset,
    push,
    pull,
    className,
    children,
    flex,
    style,
    ...others
  } = props;
  const prefixCls = getPrefixCls('col', customizePrefixCls);
  const rootPrefixCls = getPrefixCls();
  const [hashId, cssVarCls] = useColStyle(prefixCls);
  const [varName] = genCssVar(rootPrefixCls, 'col');
  // ===================== Size ======================
  const sizeStyle = {};
  let sizeClassObj = {};
  responsiveArrayReversed.forEach(size => {
    let sizeProps = {};
    const propSize = props[size];
    if (typeof propSize === 'number') {
      sizeProps.span = propSize;
    } else if (typeof propSize === 'object') {
      sizeProps = propSize || {};
    }
    delete others[size];
    sizeClassObj = {
      ...sizeClassObj,
      [`${prefixCls}-${size}-${sizeProps.span}`]: sizeProps.span !== undefined,
      [`${prefixCls}-${size}-order-${sizeProps.order}`]: sizeProps.order || sizeProps.order === 0,
      [`${prefixCls}-${size}-offset-${sizeProps.offset}`]: sizeProps.offset || sizeProps.offset === 0,
      [`${prefixCls}-${size}-push-${sizeProps.push}`]: sizeProps.push || sizeProps.push === 0,
      [`${prefixCls}-${size}-pull-${sizeProps.pull}`]: sizeProps.pull || sizeProps.pull === 0,
      [`${prefixCls}-rtl`]: direction === 'rtl'
    };
    // Responsive flex layout
    if (sizeProps.flex) {
      sizeClassObj[`${prefixCls}-${size}-flex`] = true;
      sizeStyle[varName(`${size}-flex`)] = parseFlex(sizeProps.flex);
    }
  });
  // ==================== Normal =====================
  const classes = clsx(prefixCls, {
    [`${prefixCls}-${span}`]: span !== undefined,
    [`${prefixCls}-order-${order}`]: order,
    [`${prefixCls}-offset-${offset}`]: offset,
    [`${prefixCls}-push-${push}`]: push,
    [`${prefixCls}-pull-${pull}`]: pull
  }, className, sizeClassObj, hashId, cssVarCls);
  const mergedStyle = {};
  // Horizontal gutter use padding
  if (gutter?.[0]) {
    const horizontalGutter = typeof gutter[0] === 'number' ? `${gutter[0] / 2}px` : `calc(${gutter[0]} / 2)`;
    mergedStyle.paddingInline = horizontalGutter;
  }
  if (flex) {
    mergedStyle.flex = parseFlex(flex);
    // Hack for Firefox to avoid size issue
    // https://github.com/ant-design/ant-design/pull/20023#issuecomment-564389553
    if (wrap === false && !mergedStyle.minWidth) {
      mergedStyle.minWidth = 0;
    }
  }
  // ==================== Render =====================
  return /*#__PURE__*/React.createElement("div", {
    ...others,
    style: {
      ...mergedStyle,
      ...style,
      ...sizeStyle
    },
    className: classes,
    ref: ref
  }, children);
});
if (process.env.NODE_ENV !== 'production') {
  Col.displayName = 'Col';
}
export default Col;