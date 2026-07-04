"use client";

import _toConsumableArray from "@babel/runtime/helpers/esm/toConsumableArray";
import * as React from 'react';
import { omit } from '@rc-component/util';
import { clsx } from 'clsx';
import { ConfigContext } from '../config-provider';
import { useComponentConfig } from '../config-provider/context';
import { LayoutContext } from './context';
import useHasSider from './hooks/useHasSider';
import useStyle from './style';
const generator = ({
  suffixCls,
  tagName,
  displayName
}) => {
  return Component => {
    const Adapter = /*#__PURE__*/React.forwardRef((props, ref) => (/*#__PURE__*/React.createElement(Component, {
      ref: ref,
      suffixCls: suffixCls,
      tagName: tagName,
      ...props
    })));
    if (process.env.NODE_ENV !== 'production') {
      Adapter.displayName = displayName;
    }
    return Adapter;
  };
};
const Basic = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    prefixCls: customizePrefixCls,
    suffixCls,
    className,
    tagName: TagName,
    ...others
  } = props;
  const {
    getPrefixCls
  } = React.useContext(ConfigContext);
  const prefixCls = getPrefixCls('layout', customizePrefixCls);
  const [hashId] = useStyle(prefixCls);
  const prefixWithSuffixCls = suffixCls ? `${prefixCls}-${suffixCls}` : prefixCls;
  return /*#__PURE__*/React.createElement(TagName, {
    className: clsx(customizePrefixCls || prefixWithSuffixCls, className, hashId),
    ref: ref,
    ...others
  });
});
const BasicLayout = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    direction
  } = React.useContext(ConfigContext);
  const [siders, setSiders] = React.useState([]);
  const {
    prefixCls: customizePrefixCls,
    className,
    rootClassName,
    children,
    hasSider,
    tagName: Tag,
    style,
    ...others
  } = props;
  const passedProps = omit(others, ['suffixCls']);
  const {
    getPrefixCls,
    className: contextClassName,
    style: contextStyle
  } = useComponentConfig('layout');
  const prefixCls = getPrefixCls('layout', customizePrefixCls);
  const mergedHasSider = useHasSider(siders, children, hasSider);
  const [hashId, cssVarCls] = useStyle(prefixCls);
  const classString = clsx(prefixCls, {
    [`${prefixCls}-has-sider`]: mergedHasSider,
    [`${prefixCls}-rtl`]: direction === 'rtl'
  }, contextClassName, className, rootClassName, hashId, cssVarCls);
  const contextValue = React.useMemo(() => ({
    siderHook: {
      addSider: id => {
        setSiders(prev => [].concat(_toConsumableArray(prev), [id]));
      },
      removeSider: id => {
        setSiders(prev => prev.filter(currentId => currentId !== id));
      }
    }
  }), []);
  return /*#__PURE__*/React.createElement(LayoutContext.Provider, {
    value: contextValue
  }, /*#__PURE__*/React.createElement(Tag, {
    ref: ref,
    className: classString,
    style: {
      ...contextStyle,
      ...style
    },
    ...passedProps
  }, children));
});
const Layout = generator({
  tagName: 'div',
  displayName: 'Layout'
})(BasicLayout);
const Header = generator({
  suffixCls: 'header',
  tagName: 'header',
  displayName: 'Header'
})(Basic);
const Footer = generator({
  suffixCls: 'footer',
  tagName: 'footer',
  displayName: 'Footer'
})(Basic);
const Content = generator({
  suffixCls: 'content',
  tagName: 'main',
  displayName: 'Content'
})(Basic);
export { Content, Footer, Header };
export default Layout;