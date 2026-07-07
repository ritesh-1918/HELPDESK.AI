"use client";

import * as React from 'react';
import { omit } from '@rc-component/util';
import { clsx } from 'clsx';
import { pickClosable, useClosable, useMergeSemantic } from '../_util/hooks';
import { cloneElement, replaceElement } from '../_util/reactNode';
import { devUseWarning } from '../_util/warning';
import Wave from '../_util/wave';
import { ConfigContext } from '../config-provider';
import { useComponentConfig } from '../config-provider/context';
import DisabledContext from '../config-provider/DisabledContext';
import CheckableTag from './CheckableTag';
import CheckableTagGroup from './CheckableTagGroup';
import useColor from './hooks/useColor';
import useStyle from './style';
import PresetCmp from './style/presetCmp';
import StatusCmp from './style/statusCmp';
const InternalTag = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    prefixCls: customizePrefixCls,
    className,
    rootClassName,
    style,
    children,
    icon,
    color,
    variant: _variant,
    onClose,
    bordered,
    disabled: customDisabled,
    href,
    target,
    styles,
    classNames,
    ...restProps
  } = props;
  const {
    getPrefixCls,
    direction,
    className: contextClassName,
    variant: contextVariant,
    style: contextStyle,
    classNames: contextClassNames,
    styles: contextStyles
  } = useComponentConfig('tag');
  // ===================== Warnings =====================
  if (process.env.NODE_ENV !== 'production') {
    const warning = devUseWarning('Tag');
    warning.deprecated(bordered !== false, 'bordered={false}', 'variant="filled"');
    warning.deprecated(!color?.endsWith('-inverse'), 'color="xxx-inverse"', 'variant="solid"');
  }
  // ====================== Colors ======================
  const [mergedVariant, mergedColor, isPreset, isStatus, customTagStyle] = useColor(props, contextVariant);
  const isInternalColor = isPreset || isStatus;
  // ===================== Disabled =====================
  const disabled = React.useContext(DisabledContext);
  const mergedDisabled = customDisabled ?? disabled;
  const {
    tag: tagContext
  } = React.useContext(ConfigContext);
  const [visible, setVisible] = React.useState(true);
  const domProps = omit(restProps, ['closeIcon', 'closable']);
  // =========== Merged Props for Semantic ===========
  const mergedProps = {
    ...props,
    color: mergedColor,
    variant: mergedVariant,
    disabled: mergedDisabled,
    href,
    target,
    icon
  };
  // ====================== Styles ======================
  const [mergedClassNames, mergedStyles] = useMergeSemantic([contextClassNames, classNames], [contextStyles, styles], {
    props: mergedProps
  });
  const tagStyle = React.useMemo(() => {
    let nextTagStyle = {
      ...mergedStyles.root,
      ...contextStyle,
      ...style
    };
    if (!mergedDisabled) {
      nextTagStyle = {
        ...customTagStyle,
        ...nextTagStyle
      };
    }
    return nextTagStyle;
  }, [mergedStyles.root, contextStyle, style, customTagStyle, mergedDisabled]);
  const prefixCls = getPrefixCls('tag', customizePrefixCls);
  const [hashId, cssVarCls] = useStyle(prefixCls);
  const tagClassName = clsx(prefixCls, contextClassName, mergedClassNames.root, `${prefixCls}-${mergedVariant}`, {
    [`${prefixCls}-${mergedColor}`]: isInternalColor,
    [`${prefixCls}-hidden`]: !visible,
    [`${prefixCls}-rtl`]: direction === 'rtl',
    [`${prefixCls}-disabled`]: mergedDisabled
  }, className, rootClassName, hashId, cssVarCls);
  // ===================== Closable =====================
  const handleCloseClick = e => {
    if (mergedDisabled) {
      return;
    }
    e.stopPropagation();
    onClose?.(e);
    if (e.defaultPrevented) {
      return;
    }
    setVisible(false);
  };
  const [, mergedCloseIcon] = useClosable(pickClosable(props), pickClosable(tagContext), {
    closable: false,
    closeIconRender: iconNode => {
      const replacement = /*#__PURE__*/React.createElement("span", {
        className: `${prefixCls}-close-icon`,
        onClick: handleCloseClick
      }, iconNode);
      return replaceElement(iconNode, replacement, originProps => ({
        onClick: e => {
          originProps?.onClick?.(e);
          handleCloseClick(e);
        },
        className: clsx(originProps?.className, `${prefixCls}-close-icon`)
      }));
    }
  });
  // ====================== Render ======================
  const isNeedWave = typeof restProps.onClick === 'function' || children && children.type === 'a';
  const iconNode = cloneElement(icon, {
    className: clsx(/*#__PURE__*/React.isValidElement(icon) ? icon.props?.className : '', mergedClassNames.icon),
    style: mergedStyles.icon
  });
  const child = iconNode ? (/*#__PURE__*/React.createElement(React.Fragment, null, iconNode, children && (/*#__PURE__*/React.createElement("span", {
    className: mergedClassNames.content,
    style: mergedStyles.content
  }, children)))) : children;
  const TagWrapper = href ? 'a' : 'span';
  const tagNode = /*#__PURE__*/React.createElement(TagWrapper, {
    ...domProps,
    // @ts-expect-error
    ref: ref,
    className: tagClassName,
    style: tagStyle,
    href: mergedDisabled ? undefined : href,
    target: target,
    onClick: mergedDisabled ? undefined : domProps.onClick,
    ...(href && mergedDisabled ? {
      'aria-disabled': true
    } : {})
  }, child, mergedCloseIcon, isPreset && /*#__PURE__*/React.createElement(PresetCmp, {
    key: "preset",
    prefixCls: prefixCls
  }), isStatus && /*#__PURE__*/React.createElement(StatusCmp, {
    key: "status",
    prefixCls: prefixCls
  }));
  return isNeedWave ? /*#__PURE__*/React.createElement(Wave, {
    component: "Tag"
  }, tagNode) : tagNode;
});
const Tag = InternalTag;
if (process.env.NODE_ENV !== 'production') {
  Tag.displayName = 'Tag';
}
Tag.CheckableTag = CheckableTag;
Tag.CheckableTagGroup = CheckableTagGroup;
export default Tag;