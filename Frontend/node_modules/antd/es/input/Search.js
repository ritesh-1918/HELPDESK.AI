"use client";

import * as React from 'react';
import SearchOutlined from "@ant-design/icons/es/icons/SearchOutlined";
import omit from "@rc-component/util/es/omit";
import pickAttrs from "@rc-component/util/es/pickAttrs";
import { composeRef } from "@rc-component/util/es/ref";
import { clsx } from 'clsx';
import { useMergeSemantic } from '../_util/hooks';
import { cloneElement } from '../_util/reactNode';
import Button from '../button/Button';
import { useComponentConfig } from '../config-provider/context';
import useSize from '../config-provider/hooks/useSize';
import Compact, { useCompactItemContext } from '../space/Compact';
import Input from './Input';
import useStyle from './style/search';
const Search = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    prefixCls: customizePrefixCls,
    inputPrefixCls: customizeInputPrefixCls,
    className,
    size: customizeSize,
    style,
    enterButton = false,
    addonAfter,
    loading,
    disabled,
    onSearch: customOnSearch,
    onChange: customOnChange,
    onCompositionStart,
    onCompositionEnd,
    variant,
    onPressEnter: customOnPressEnter,
    classNames,
    styles,
    hidden,
    ...restProps
  } = props;
  const {
    direction,
    getPrefixCls,
    classNames: contextClassNames,
    styles: contextStyles
  } = useComponentConfig('inputSearch');
  const mergedProps = {
    ...props,
    enterButton
  };
  const [mergedClassNames, mergedStyles] = useMergeSemantic([contextClassNames, classNames], [contextStyles, styles], {
    props: mergedProps
  }, {
    button: {
      _default: 'root'
    }
  });
  const composedRef = React.useRef(false);
  const prefixCls = getPrefixCls('input-search', customizePrefixCls);
  const inputPrefixCls = getPrefixCls('input', customizeInputPrefixCls);
  const [hashId, cssVarCls] = useStyle(prefixCls);
  const {
    compactSize
  } = useCompactItemContext(prefixCls, direction);
  const size = useSize(ctx => customizeSize ?? compactSize ?? ctx);
  const inputRef = React.useRef(null);
  const onChange = e => {
    if (e?.target && e.type === 'click' && customOnSearch) {
      customOnSearch(e.target.value, e, {
        source: 'clear'
      });
    }
    customOnChange?.(e);
  };
  const onMouseDown = e => {
    if (document.activeElement === inputRef.current?.input) {
      e.preventDefault();
    }
  };
  const onSearch = e => {
    if (customOnSearch) {
      customOnSearch(inputRef.current?.input?.value, e, {
        source: 'input'
      });
    }
  };
  const onPressEnter = e => {
    if (composedRef.current || loading) {
      return;
    }
    customOnPressEnter?.(e);
    onSearch(e);
  };
  const searchIcon = typeof enterButton === 'boolean' ? /*#__PURE__*/React.createElement(SearchOutlined, null) : null;
  const btnPrefixCls = `${prefixCls}-btn`;
  const btnClassName = clsx(btnPrefixCls, {
    [`${btnPrefixCls}-${variant}`]: variant
  });
  let button;
  const enterButtonAsElement = enterButton || {};
  const isAntdButton = enterButtonAsElement.type && enterButtonAsElement.type.__ANT_BUTTON === true;
  if (isAntdButton || enterButtonAsElement.type === 'button') {
    button = cloneElement(enterButtonAsElement, {
      onMouseDown,
      onClick: e => {
        enterButtonAsElement?.props?.onClick?.(e);
        onSearch(e);
      },
      key: 'enterButton',
      ...(isAntdButton ? {
        className: btnClassName,
        size
      } : {})
    });
  } else {
    button = /*#__PURE__*/React.createElement(Button, {
      classNames: mergedClassNames.button,
      styles: mergedStyles.button,
      className: btnClassName,
      color: enterButton ? 'primary' : 'default',
      size: size,
      disabled: disabled,
      key: "enterButton",
      onMouseDown: onMouseDown,
      onClick: onSearch,
      loading: loading,
      icon: searchIcon,
      variant: variant === 'borderless' || variant === 'filled' || variant === 'underlined' ? 'text' : enterButton ? 'solid' : undefined
    }, enterButton);
  }
  if (addonAfter) {
    button = [button, cloneElement(addonAfter, {
      key: 'addonAfter'
    })];
  }
  const mergedClassName = clsx(prefixCls, cssVarCls, {
    [`${prefixCls}-rtl`]: direction === 'rtl',
    [`${prefixCls}-${size}`]: !!size,
    [`${prefixCls}-with-button`]: !!enterButton
  }, className, hashId, mergedClassNames.root);
  const handleOnCompositionStart = e => {
    composedRef.current = true;
    onCompositionStart?.(e);
  };
  const handleOnCompositionEnd = e => {
    composedRef.current = false;
    onCompositionEnd?.(e);
  };
  // ========================== Render ==========================
  // >>> Root Props
  const rootProps = pickAttrs(restProps, {
    data: true
  });
  const inputProps = omit({
    ...restProps,
    classNames: omit(mergedClassNames, ['button', 'root']),
    styles: omit(mergedStyles, ['button', 'root']),
    prefixCls: inputPrefixCls,
    type: 'search',
    size,
    variant,
    onPressEnter,
    onCompositionStart: handleOnCompositionStart,
    onCompositionEnd: handleOnCompositionEnd,
    onChange,
    disabled
  }, Object.keys(rootProps));
  return /*#__PURE__*/React.createElement(Compact, {
    className: mergedClassName,
    style: {
      ...style,
      ...mergedStyles.root
    },
    ...rootProps,
    hidden: hidden
  }, /*#__PURE__*/React.createElement(Input, {
    ref: composeRef(inputRef, ref),
    ...inputProps
  }), button);
});
if (process.env.NODE_ENV !== 'production') {
  Search.displayName = 'Search';
}
export default Search;