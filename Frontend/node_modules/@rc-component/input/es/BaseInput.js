function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
import { clsx } from 'clsx';
import React, { cloneElement, useRef } from 'react';
import { hasAddon, hasPrefixSuffix } from "./utils/commonUtils";
const BaseInput = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    inputElement: inputEl,
    children,
    prefixCls,
    prefix,
    suffix,
    addonBefore,
    addonAfter,
    className,
    style,
    disabled,
    readOnly,
    focused,
    triggerFocus,
    allowClear,
    value,
    handleReset,
    hidden,
    classes,
    classNames,
    dataAttrs,
    styles,
    components,
    onClear
  } = props;
  const inputElement = children ?? inputEl;
  const AffixWrapperComponent = components?.affixWrapper || 'span';
  const GroupWrapperComponent = components?.groupWrapper || 'span';
  const WrapperComponent = components?.wrapper || 'span';
  const GroupAddonComponent = components?.groupAddon || 'span';
  const containerRef = useRef(null);
  const onInputClick = e => {
    if (containerRef.current?.contains(e.target)) {
      triggerFocus?.();
    }
  };
  const hasAffix = hasPrefixSuffix(props);
  let element = /*#__PURE__*/cloneElement(inputElement, {
    value,
    className: clsx(inputElement.props?.className, !hasAffix && classNames?.variant) || null
  });

  // ======================== Ref ======================== //
  const groupRef = useRef(null);
  React.useImperativeHandle(ref, () => ({
    nativeElement: groupRef.current || containerRef.current
  }));

  // ================== Prefix & Suffix ================== //
  if (hasAffix) {
    // ================== Clear Icon ================== //
    let clearIcon = null;
    if (allowClear) {
      const needClear = !disabled && !readOnly && value;
      const clearIconCls = `${prefixCls}-clear-icon`;
      const iconNode = typeof allowClear === 'object' && allowClear?.clearIcon ? allowClear.clearIcon : '✖';
      clearIcon = /*#__PURE__*/React.createElement("button", {
        type: "button",
        tabIndex: -1,
        onClick: event => {
          handleReset?.(event);
          onClear?.();
        }
        // Do not trigger onBlur when clear input
        // https://github.com/ant-design/ant-design/issues/31200
        ,
        onMouseDown: e => e.preventDefault(),
        className: clsx(clearIconCls, {
          [`${clearIconCls}-hidden`]: !needClear,
          [`${clearIconCls}-has-suffix`]: !!suffix
        })
      }, iconNode);
    }
    const affixWrapperPrefixCls = `${prefixCls}-affix-wrapper`;
    const affixWrapperCls = clsx(affixWrapperPrefixCls, {
      [`${prefixCls}-disabled`]: disabled,
      [`${affixWrapperPrefixCls}-disabled`]: disabled,
      // Not used, but keep it
      [`${affixWrapperPrefixCls}-focused`]: focused,
      // Not used, but keep it
      [`${affixWrapperPrefixCls}-readonly`]: readOnly,
      [`${affixWrapperPrefixCls}-input-with-clear-btn`]: suffix && allowClear && value
    }, classes?.affixWrapper, classNames?.affixWrapper, classNames?.variant);
    const suffixNode = (suffix || allowClear) && /*#__PURE__*/React.createElement("span", {
      className: clsx(`${prefixCls}-suffix`, classNames?.suffix),
      style: styles?.suffix
    }, clearIcon, suffix);
    element = /*#__PURE__*/React.createElement(AffixWrapperComponent, _extends({
      className: affixWrapperCls,
      style: styles?.affixWrapper,
      onClick: onInputClick
    }, dataAttrs?.affixWrapper, {
      ref: containerRef
    }), prefix && /*#__PURE__*/React.createElement("span", {
      className: clsx(`${prefixCls}-prefix`, classNames?.prefix),
      style: styles?.prefix
    }, prefix), element, suffixNode);
  }

  // ================== Addon ================== //
  if (hasAddon(props)) {
    const wrapperCls = `${prefixCls}-group`;
    const addonCls = `${wrapperCls}-addon`;
    const groupWrapperCls = `${wrapperCls}-wrapper`;
    const mergedWrapperClassName = clsx(`${prefixCls}-wrapper`, wrapperCls, classes?.wrapper, classNames?.wrapper);
    const mergedGroupClassName = clsx(groupWrapperCls, {
      [`${groupWrapperCls}-disabled`]: disabled
    }, classes?.group, classNames?.groupWrapper);

    // Need another wrapper for changing display:table to display:inline-block
    // and put style prop in wrapper
    element = /*#__PURE__*/React.createElement(GroupWrapperComponent, {
      className: mergedGroupClassName,
      ref: groupRef
    }, /*#__PURE__*/React.createElement(WrapperComponent, {
      className: mergedWrapperClassName
    }, addonBefore && /*#__PURE__*/React.createElement(GroupAddonComponent, {
      className: addonCls
    }, addonBefore), element, addonAfter && /*#__PURE__*/React.createElement(GroupAddonComponent, {
      className: addonCls
    }, addonAfter)));
  }

  // `className` and `style` are always on the root element
  return /*#__PURE__*/React.cloneElement(element, {
    className: clsx(element.props?.className, className) || null,
    style: {
      ...element.props?.style,
      ...style
    },
    hidden
  });
});
export default BaseInput;