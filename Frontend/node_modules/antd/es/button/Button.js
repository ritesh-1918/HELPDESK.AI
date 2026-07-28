"use client";

import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { omit, toArray, useComposeRef } from '@rc-component/util';
import useLayoutEffect from "@rc-component/util/es/hooks/useLayoutEffect";
import { clsx } from 'clsx';
import { useMergeSemantic } from '../_util/hooks';
import isNonNullable from '../_util/isNonNullable';
import { devUseWarning } from '../_util/warning';
import Wave from '../_util/wave';
import { useComponentConfig } from '../config-provider/context';
import DisabledContext from '../config-provider/DisabledContext';
import useSize from '../config-provider/hooks/useSize';
import { useCompactItemContext } from '../space/Compact';
import Group, { GroupSizeContext } from './ButtonGroup';
import { isTwoCNChar, isUnBorderedButtonVariant, spaceChildren } from './buttonHelpers';
import DefaultLoadingIcon from './DefaultLoadingIcon';
import IconWrapper from './IconWrapper';
import useStyle from './style';
import Compact from './style/compact';
function getLoadingConfig(loading) {
  if (typeof loading === 'object' && loading) {
    let delay = loading?.delay;
    delay = !Number.isNaN(delay) && typeof delay === 'number' ? delay : 0;
    return {
      loading: delay <= 0,
      delay
    };
  }
  return {
    loading: !!loading,
    delay: 0
  };
}
const ButtonTypeMap = {
  default: ['default', 'outlined'],
  primary: ['primary', 'solid'],
  dashed: ['default', 'dashed'],
  // `link` is not a real color but we should compatible with it
  link: ['link', 'link'],
  text: ['default', 'text']
};
const InternalCompoundedButton = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    _skipSemantic,
    loading = false,
    prefixCls: customizePrefixCls,
    color,
    variant,
    type,
    danger = false,
    shape: customizeShape,
    size: customizeSize,
    disabled: customDisabled,
    className,
    rootClassName,
    children,
    icon,
    iconPosition,
    iconPlacement,
    ghost = false,
    block = false,
    // React does not recognize the `htmlType` prop on a DOM element. Here we pick it out of `rest`.
    htmlType = 'button',
    classNames,
    styles,
    style,
    autoInsertSpace,
    autoFocus,
    ...rest
  } = props;
  const childNodes = toArray(children);
  // https://github.com/ant-design/ant-design/issues/47605
  // Compatible with original `type` behavior
  const mergedType = type || 'default';
  const {
    getPrefixCls,
    direction,
    autoInsertSpace: contextAutoInsertSpace,
    className: contextClassName,
    style: contextStyle,
    classNames: contextClassNames,
    styles: contextStyles,
    loadingIcon: contextLoadingIcon,
    shape: contextShape,
    color: contextColor,
    variant: contextVariant
  } = useComponentConfig('button');
  const mergedShape = customizeShape || contextShape || 'default';
  const [parsedColor, parsedVariant] = useMemo(() => {
    // >>>>> Local
    // Color & Variant
    if (color && variant) {
      return [color, variant];
    }
    // Sugar syntax
    if (type || danger) {
      const colorVariantPair = ButtonTypeMap[mergedType] || [];
      if (danger) {
        return ['danger', colorVariantPair[1]];
      }
      return colorVariantPair;
    }
    // >>> Context fallback
    if (contextColor && contextVariant) {
      return [contextColor, contextVariant];
    }
    return ['default', 'outlined'];
  }, [color, variant, type, danger, contextColor, contextVariant, mergedType]);
  const [mergedColor, mergedVariant] = useMemo(() => {
    if (ghost && parsedVariant === 'solid') {
      return [parsedColor, 'outlined'];
    }
    return [parsedColor, parsedVariant];
  }, [parsedColor, parsedVariant, ghost]);
  const isDanger = mergedColor === 'danger';
  const mergedColorText = isDanger ? 'dangerous' : mergedColor;
  const mergedInsertSpace = autoInsertSpace ?? contextAutoInsertSpace ?? true;
  const prefixCls = getPrefixCls('btn', customizePrefixCls);
  const [hashId, cssVarCls] = useStyle(prefixCls);
  const disabled = useContext(DisabledContext);
  const mergedDisabled = customDisabled ?? disabled;
  const groupSize = useContext(GroupSizeContext);
  const loadingOrDelay = useMemo(() => getLoadingConfig(loading), [loading]);
  const [innerLoading, setLoading] = useState(loadingOrDelay.loading);
  const [hasTwoCNChar, setHasTwoCNChar] = useState(false);
  const buttonRef = useRef(null);
  const mergedRef = useComposeRef(ref, buttonRef);
  const needInserted = childNodes.length === 1 && !icon && !isUnBorderedButtonVariant(mergedVariant);
  // ========================= Mount ==========================
  // Record for mount status.
  // This will help to no to show the animation of loading on the first mount.
  const isMountRef = useRef(true);
  React.useEffect(() => {
    isMountRef.current = false;
    return () => {
      isMountRef.current = true;
    };
  }, []);
  // ========================= Effect =========================
  // Loading. Should use `useLayoutEffect` to avoid low perf multiple click issue.
  // https://github.com/ant-design/ant-design/issues/51325
  useLayoutEffect(() => {
    let delayTimer = null;
    if (loadingOrDelay.delay > 0) {
      delayTimer = setTimeout(() => {
        delayTimer = null;
        setLoading(true);
      }, loadingOrDelay.delay);
    } else {
      setLoading(loadingOrDelay.loading);
    }
    function cleanupTimer() {
      if (delayTimer) {
        clearTimeout(delayTimer);
        delayTimer = null;
      }
    }
    return cleanupTimer;
  }, [loadingOrDelay.delay, loadingOrDelay.loading]);
  // Two chinese characters check
  useEffect(() => {
    // FIXME: for HOC usage like <FormatMessage />
    if (!buttonRef.current || !mergedInsertSpace) {
      return;
    }
    const buttonText = buttonRef.current.textContent || '';
    if (needInserted && isTwoCNChar(buttonText)) {
      if (!hasTwoCNChar) {
        setHasTwoCNChar(true);
      }
    } else if (hasTwoCNChar) {
      setHasTwoCNChar(false);
    }
  });
  // Auto focus
  useEffect(() => {
    if (autoFocus && buttonRef.current) {
      buttonRef.current.focus();
    }
  }, []);
  // ========================= Events =========================
  const handleClick = React.useCallback(e => {
    // FIXME: https://github.com/ant-design/ant-design/issues/30207
    if (innerLoading || mergedDisabled) {
      e.preventDefault();
      return;
    }
    props.onClick?.('href' in props ? e : e);
  }, [props.onClick, innerLoading, mergedDisabled]);
  // ========================== Warn ==========================
  if (process.env.NODE_ENV !== 'production') {
    const warning = devUseWarning('Button');
    process.env.NODE_ENV !== "production" ? warning(!(typeof icon === 'string' && icon.length > 2), 'breaking', `\`icon\` is using ReactNode instead of string naming in v4. Please check \`${icon}\` at https://ant.design/components/icon`) : void 0;
    process.env.NODE_ENV !== "production" ? warning(!(ghost && isUnBorderedButtonVariant(mergedVariant)), 'usage', "`link` or `text` button can't be a `ghost` button.") : void 0;
    warning.deprecated(!iconPosition, 'iconPosition', 'iconPlacement');
  }
  // ========================== Size ==========================
  const {
    compactSize,
    compactItemClassnames
  } = useCompactItemContext(prefixCls, direction);
  const sizeClassNameMap = {
    large: 'lg',
    small: 'sm',
    middle: undefined,
    medium: undefined
  };
  const sizeFullName = useSize(ctxSize => customizeSize ?? compactSize ?? groupSize ?? ctxSize);
  const sizeCls = sizeFullName ? sizeClassNameMap[sizeFullName] ?? '' : '';
  const iconType = innerLoading ? 'loading' : icon;
  const mergedIconPlacement = iconPlacement ?? iconPosition ?? 'start';
  const linkButtonRestProps = omit(rest, ['navigate']);
  // =========== Merged Props for Semantic ===========
  const mergedProps = {
    ...props,
    type: mergedType,
    color: mergedColor,
    variant: mergedVariant,
    danger: isDanger,
    shape: mergedShape,
    size: sizeFullName,
    disabled: mergedDisabled,
    loading: innerLoading,
    iconPlacement: mergedIconPlacement
  };
  // ========================= Style ==========================
  const [mergedClassNames, mergedStyles] = useMergeSemantic([_skipSemantic ? undefined : contextClassNames, classNames], [_skipSemantic ? undefined : contextStyles, styles], {
    props: mergedProps
  });
  // ========================= Render =========================
  const classes = clsx(prefixCls, hashId, cssVarCls, {
    [`${prefixCls}-${mergedShape}`]: mergedShape !== 'default' && mergedShape !== 'square' && mergedShape,
    // Compatible with versions earlier than 5.21.0
    [`${prefixCls}-${mergedType}`]: mergedType,
    [`${prefixCls}-dangerous`]: danger,
    [`${prefixCls}-color-${mergedColorText}`]: mergedColorText,
    [`${prefixCls}-variant-${mergedVariant}`]: mergedVariant,
    [`${prefixCls}-${sizeCls}`]: sizeCls,
    [`${prefixCls}-icon-only`]: !children && children !== 0 && !!iconType,
    [`${prefixCls}-background-ghost`]: ghost && !isUnBorderedButtonVariant(mergedVariant),
    [`${prefixCls}-loading`]: innerLoading,
    [`${prefixCls}-two-chinese-chars`]: hasTwoCNChar && mergedInsertSpace && !innerLoading,
    [`${prefixCls}-block`]: block,
    [`${prefixCls}-rtl`]: direction === 'rtl',
    [`${prefixCls}-icon-end`]: mergedIconPlacement === 'end'
  }, compactItemClassnames, className, rootClassName, contextClassName, mergedClassNames.root);
  const fullStyle = {
    ...mergedStyles.root,
    ...contextStyle,
    ...style
  };
  const iconSharedProps = {
    className: mergedClassNames.icon,
    style: mergedStyles.icon
  };
  /**
   * Extract icon node
   * If there is a custom icon and not in loading state: show custom icon
   */
  const iconWrapperElement = child => (/*#__PURE__*/React.createElement(IconWrapper, {
    prefixCls: prefixCls,
    ...iconSharedProps
  }, child));
  const defaultLoadingIconElement = /*#__PURE__*/React.createElement(DefaultLoadingIcon, {
    existIcon: !!icon,
    prefixCls: prefixCls,
    loading: innerLoading,
    mount: isMountRef.current,
    ...iconSharedProps
  });
  const mergedLoadingIcon = loading && typeof loading === 'object' ? loading.icon || contextLoadingIcon : contextLoadingIcon;
  /**
   * Using if-else statements can improve code readability without affecting future expansion.
   */
  let iconNode;
  if (icon && !innerLoading) {
    iconNode = iconWrapperElement(icon);
  } else if (loading && mergedLoadingIcon) {
    iconNode = iconWrapperElement(mergedLoadingIcon);
  } else {
    iconNode = defaultLoadingIconElement;
  }
  const contentNode = isNonNullable(children) ? spaceChildren(children, needInserted && mergedInsertSpace, mergedStyles.content, mergedClassNames.content) : null;
  if (linkButtonRestProps.href !== undefined) {
    return /*#__PURE__*/React.createElement("a", {
      ...linkButtonRestProps,
      className: clsx(classes, {
        [`${prefixCls}-disabled`]: mergedDisabled
      }),
      href: mergedDisabled ? undefined : linkButtonRestProps.href,
      style: fullStyle,
      onClick: handleClick,
      ref: mergedRef,
      tabIndex: mergedDisabled ? -1 : 0,
      "aria-disabled": mergedDisabled
    }, iconNode, contentNode);
  }
  let buttonNode = /*#__PURE__*/React.createElement("button", {
    ...rest,
    type: htmlType,
    className: classes,
    style: fullStyle,
    onClick: handleClick,
    disabled: mergedDisabled,
    ref: mergedRef
  }, iconNode, contentNode, compactItemClassnames && /*#__PURE__*/React.createElement(Compact, {
    prefixCls: prefixCls
  }));
  if (!isUnBorderedButtonVariant(mergedVariant)) {
    buttonNode = /*#__PURE__*/React.createElement(Wave, {
      component: "Button",
      disabled: innerLoading
    }, buttonNode);
  }
  return buttonNode;
});
const Button = InternalCompoundedButton;
Button.Group = Group;
Button.__ANT_BUTTON = true;
if (process.env.NODE_ENV !== 'production') {
  Button.displayName = 'Button';
}
export default Button;