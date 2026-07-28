"use client";

import * as React from 'react';
import { omit, toArray } from '@rc-component/util';
import { clsx } from 'clsx';
import { useMergeSemantic } from '../_util/hooks';
import { devUseWarning } from '../_util/warning';
import { useComponentConfig } from '../config-provider/context';
import useSize from '../config-provider/hooks/useSize';
import useVariant from '../form/hooks/useVariants';
import Skeleton from '../skeleton';
import Tabs from '../tabs';
import CardGrid from './CardGrid';
import useStyle from './style';
const ActionNode = props => {
  const {
    actionClasses,
    actions = [],
    actionStyle
  } = props;
  return /*#__PURE__*/React.createElement("ul", {
    className: actionClasses,
    style: actionStyle
  }, actions.map((action, index) => {
    // Move this out since eslint not allow index key
    // And eslint-disable makes conflict with rollup
    // ref https://github.com/ant-design/ant-design/issues/46022
    const key = `action-${index}`;
    return /*#__PURE__*/React.createElement("li", {
      style: {
        width: `${100 / actions.length}%`
      },
      key: key
    }, /*#__PURE__*/React.createElement("span", null, action));
  }));
};
const Card = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    prefixCls: customizePrefixCls,
    className,
    rootClassName,
    style,
    extra,
    headStyle = {},
    bodyStyle = {},
    title,
    loading,
    bordered,
    variant: customVariant,
    size: customizeSize,
    type,
    cover,
    actions,
    tabList,
    children,
    activeTabKey,
    defaultActiveTabKey,
    tabBarExtraContent,
    hoverable,
    tabProps = {},
    classNames,
    styles,
    ...rest
  } = props;
  const {
    getPrefixCls,
    direction,
    className: contextClassName,
    style: contextStyle,
    classNames: contextClassNames,
    styles: contextStyles
  } = useComponentConfig('card');
  const [variant] = useVariant('card', customVariant, bordered);
  const mergedSize = useSize(customizeSize);
  // =========== Merged Props for Semantic ==========
  const mergedProps = {
    ...props,
    size: mergedSize,
    variant: variant,
    loading
  };
  const [mergedClassNames, mergedStyles] = useMergeSemantic([contextClassNames, classNames], [contextStyles, styles], {
    props: mergedProps
  });
  // =================Warning===================
  if (process.env.NODE_ENV !== 'production') {
    const warning = devUseWarning('Card');
    [['headStyle', 'styles.header'], ['bodyStyle', 'styles.body'], ['bordered', 'variant']].forEach(([deprecatedName, newName]) => {
      warning.deprecated(!(deprecatedName in props), deprecatedName, newName);
    });
  }
  const onTabChange = key => {
    props.onTabChange?.(key);
  };
  const isContainGrid = React.useMemo(() => {
    const childNodes = toArray(children);
    return childNodes.some(child => /*#__PURE__*/React.isValidElement(child) && child.type === CardGrid);
  }, [children]);
  const prefixCls = getPrefixCls('card', customizePrefixCls);
  const [hashId, cssVarCls] = useStyle(prefixCls);
  const loadingBlock = /*#__PURE__*/React.createElement(Skeleton, {
    loading: true,
    active: true,
    paragraph: {
      rows: 4
    },
    title: false
  }, children);
  const hasActiveTabKey = activeTabKey !== undefined;
  const extraProps = {
    ...tabProps,
    [hasActiveTabKey ? 'activeKey' : 'defaultActiveKey']: hasActiveTabKey ? activeTabKey : defaultActiveTabKey,
    tabBarExtraContent
  };
  let head;
  const tabSize = !mergedSize || mergedSize === 'default' ? 'large' : mergedSize;
  const tabs = tabList ? (/*#__PURE__*/React.createElement(Tabs, {
    size: tabSize,
    ...extraProps,
    className: `${prefixCls}-head-tabs`,
    onChange: onTabChange,
    items: tabList.map(({
      tab,
      ...item
    }) => ({
      label: tab,
      ...item
    }))
  })) : null;
  if (title || extra || tabs) {
    const headClasses = clsx(`${prefixCls}-head`, mergedClassNames.header);
    const titleClasses = clsx(`${prefixCls}-head-title`, mergedClassNames.title);
    const extraClasses = clsx(`${prefixCls}-extra`, mergedClassNames.extra);
    const mergedHeadStyle = {
      ...headStyle,
      ...mergedStyles.header
    };
    head = /*#__PURE__*/React.createElement("div", {
      className: headClasses,
      style: mergedHeadStyle
    }, /*#__PURE__*/React.createElement("div", {
      className: `${prefixCls}-head-wrapper`
    }, title && (/*#__PURE__*/React.createElement("div", {
      className: titleClasses,
      style: mergedStyles.title
    }, title)), extra && (/*#__PURE__*/React.createElement("div", {
      className: extraClasses,
      style: mergedStyles.extra
    }, extra))), tabs);
  }
  const coverClasses = clsx(`${prefixCls}-cover`, mergedClassNames.cover);
  const coverDom = cover ? (/*#__PURE__*/React.createElement("div", {
    className: coverClasses,
    style: mergedStyles.cover
  }, cover)) : null;
  const bodyClasses = clsx(`${prefixCls}-body`, mergedClassNames.body);
  const mergedBodyStyle = {
    ...bodyStyle,
    ...mergedStyles.body
  };
  const body = /*#__PURE__*/React.createElement("div", {
    className: bodyClasses,
    style: mergedBodyStyle
  }, loading ? loadingBlock : children);
  const actionClasses = clsx(`${prefixCls}-actions`, mergedClassNames.actions);
  const actionDom = actions?.length ? (/*#__PURE__*/React.createElement(ActionNode, {
    actionClasses: actionClasses,
    actionStyle: mergedStyles.actions,
    actions: actions
  })) : null;
  const divProps = omit(rest, ['onTabChange']);
  const classString = clsx(prefixCls, contextClassName, {
    [`${prefixCls}-loading`]: loading,
    [`${prefixCls}-bordered`]: variant !== 'borderless',
    [`${prefixCls}-hoverable`]: hoverable,
    [`${prefixCls}-contain-grid`]: isContainGrid,
    [`${prefixCls}-contain-tabs`]: tabList?.length,
    [`${prefixCls}-${mergedSize}`]: mergedSize,
    [`${prefixCls}-type-${type}`]: !!type,
    [`${prefixCls}-rtl`]: direction === 'rtl'
  }, className, rootClassName, hashId, cssVarCls, mergedClassNames.root);
  const mergedStyle = {
    ...mergedStyles.root,
    ...contextStyle,
    ...style
  };
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    ...divProps,
    className: classString,
    style: mergedStyle
  }, head, coverDom, body, actionDom);
});
if (process.env.NODE_ENV !== 'production') {
  Card.displayName = 'Card';
}
export default Card;