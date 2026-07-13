"use client";

import React from 'react';
import FileTextOutlined from "@ant-design/icons/es/icons/FileTextOutlined";
import { omit } from '@rc-component/util';
import { clsx } from 'clsx';
import convertToTooltipProps from '../_util/convertToTooltipProps';
import { useMergeSemantic, useZIndex } from '../_util/hooks';
import { devUseWarning } from '../_util/warning';
import Badge from '../badge';
import Button from '../button/Button';
import { ConfigContext } from '../config-provider';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import Tooltip from '../tooltip';
import { GroupContext } from './context';
import useStyle from './style';
export const floatButtonPrefixCls = 'float-btn';
const InternalFloatButton = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    prefixCls: customizePrefixCls,
    className,
    rootClassName,
    style,
    type = 'default',
    shape = 'circle',
    icon,
    description,
    content,
    tooltip,
    badge = {},
    classNames,
    styles,
    ...restProps
  } = props;
  const {
    getPrefixCls,
    direction
  } = React.useContext(ConfigContext);
  const groupContext = React.useContext(GroupContext);
  const prefixCls = getPrefixCls(floatButtonPrefixCls, customizePrefixCls);
  const rootCls = useCSSVarCls(prefixCls);
  const {
    shape: contextShape,
    individual: contextIndividual,
    classNames: contextClassNames,
    styles: contextStyles
  } = groupContext || {};
  const mergedShape = contextShape || shape;
  const mergedIndividual = contextIndividual ?? true;
  const mergedContent = content ?? description;
  // =========== Merged Props for Semantic ==========
  const mergedProps = {
    ...props,
    type,
    shape: mergedShape
  };
  // ============================ Styles ============================
  const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);
  const floatButtonClassNames = React.useMemo(() => ({
    icon: `${prefixCls}-icon`,
    content: `${prefixCls}-content`
  }), [prefixCls]);
  const [mergedClassNames, mergedStyles] = useMergeSemantic([floatButtonClassNames, contextClassNames, classNames], [contextStyles, styles], {
    props: mergedProps
  });
  // ============================= Icon =============================
  const mergedIcon = !mergedContent && !icon ? /*#__PURE__*/React.createElement(FileTextOutlined, null) : icon;
  // ============================ zIndex ============================
  const [zIndex] = useZIndex('FloatButton', style?.zIndex);
  const mergedStyle = {
    ...style,
    zIndex
  };
  // ============================ Badge =============================
  // 虽然在 ts 中已经 omit 过了，但是为了防止多余的属性被透传进来，这里再 omit 一遍，以防万一
  const badgeProps = omit(badge, ['title', 'children', 'status', 'text']);
  const badgeNode = 'badge' in props && (/*#__PURE__*/React.createElement(Badge, {
    ...badgeProps,
    className: clsx(badgeProps.className, `${prefixCls}-badge`, {
      [`${prefixCls}-badge-dot`]: badgeProps.dot
    })
  }));
  // =========================== Tooltip ============================
  const tooltipProps = convertToTooltipProps(tooltip);
  // =========================== Warning ============================
  if (process.env.NODE_ENV !== 'production') {
    const warning = devUseWarning('FloatButton');
    process.env.NODE_ENV !== "production" ? warning(!(mergedShape === 'circle' && mergedContent), 'usage', 'supported only when `shape` is `square`. Due to narrow space for text, short sentence is recommended.') : void 0;
    warning.deprecated(!description, 'description', 'content');
  }
  // ============================ Render ============================
  let node = /*#__PURE__*/React.createElement(Button, {
    ...restProps,
    ref: ref,
    // Styles
    className: clsx(hashId, cssVarCls, rootCls, prefixCls, className, rootClassName, `${prefixCls}-${type}`, `${prefixCls}-${mergedShape}`, {
      [`${prefixCls}-rtl`]: direction === 'rtl',
      [`${prefixCls}-individual`]: mergedIndividual,
      [`${prefixCls}-icon-only`]: !mergedContent
    }),
    classNames: mergedClassNames,
    styles: mergedStyles,
    style: mergedStyle,
    shape: mergedShape,
    // Others
    type: type,
    size: "large",
    icon: mergedIcon,
    _skipSemantic: true
  }, mergedContent, badgeNode);
  if (tooltipProps) {
    node = /*#__PURE__*/React.createElement(Tooltip, {
      ...tooltipProps
    }, node);
  }
  return node;
});
const FloatButton = InternalFloatButton;
if (process.env.NODE_ENV !== 'production') {
  FloatButton.displayName = 'FloatButton';
}
export default FloatButton;