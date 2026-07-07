"use client";

import _toConsumableArray from "@babel/runtime/helpers/esm/toConsumableArray";
import * as React from 'react';
import { clsx } from 'clsx';
import extendsObject from '../_util/extendsObject';
import { responsiveArray } from '../_util/responsiveObserver';
import { devUseWarning } from '../_util/warning';
import { ConfigContext } from '../config-provider';
import { useComponentConfig } from '../config-provider/context';
import DefaultRenderEmpty from '../config-provider/defaultRenderEmpty';
import useSize from '../config-provider/hooks/useSize';
import { Row } from '../grid';
import useBreakpoint from '../grid/hooks/useBreakpoint';
import Pagination from '../pagination';
import Spin from '../spin';
import { ListContext } from './context';
import Item from './Item';
import useStyle from './style';
const InternalList = (props, ref) => {
  const {
    pagination = false,
    prefixCls: customizePrefixCls,
    bordered = false,
    split = true,
    className,
    rootClassName,
    style,
    children,
    itemLayout,
    loadMore,
    grid,
    dataSource = [],
    size: customizeSize,
    header,
    footer,
    loading = false,
    rowKey,
    renderItem,
    locale,
    ...rest
  } = props;
  const paginationObj = pagination && typeof pagination === 'object' ? pagination : {};
  const [paginationCurrent, setPaginationCurrent] = React.useState(paginationObj.defaultCurrent || 1);
  const [paginationSize, setPaginationSize] = React.useState(paginationObj.defaultPageSize || 10);
  const {
    getPrefixCls,
    direction,
    className: contextClassName,
    style: contextStyle
  } = useComponentConfig('list');
  const {
    renderEmpty
  } = React.useContext(ConfigContext);
  const defaultPaginationProps = {
    current: 1,
    total: 0,
    position: 'bottom'
  };
  const triggerPaginationEvent = eventName => (page, pageSize) => {
    setPaginationCurrent(page);
    setPaginationSize(pageSize);
    if (pagination) {
      pagination?.[eventName]?.(page, pageSize);
    }
  };
  const onPaginationChange = triggerPaginationEvent('onChange');
  const onPaginationShowSizeChange = triggerPaginationEvent('onShowSizeChange');
  const renderInternalItem = (item, index) => {
    if (!renderItem) {
      return null;
    }
    let key;
    if (typeof rowKey === 'function') {
      key = rowKey(item);
    } else if (rowKey) {
      key = item[rowKey];
    } else {
      key = item.key;
    }
    if (!key) {
      key = `list-item-${index}`;
    }
    return /*#__PURE__*/React.createElement(React.Fragment, {
      key: key
    }, renderItem(item, index));
  };
  const isSomethingAfterLastItem = !!(loadMore || pagination || footer);
  const prefixCls = getPrefixCls('list', customizePrefixCls);
  // Style
  const [hashId, cssVarCls] = useStyle(prefixCls);
  let loadingProp = loading;
  if (typeof loadingProp === 'boolean') {
    loadingProp = {
      spinning: loadingProp
    };
  }
  const isLoading = !!loadingProp?.spinning;
  const mergedSize = useSize(customizeSize);
  // large => lg
  // small => sm
  let sizeCls = '';
  switch (mergedSize) {
    case 'large':
      sizeCls = 'lg';
      break;
    case 'small':
      sizeCls = 'sm';
      break;
    default:
      break;
  }
  const classString = clsx(prefixCls, {
    [`${prefixCls}-vertical`]: itemLayout === 'vertical',
    [`${prefixCls}-${sizeCls}`]: sizeCls,
    [`${prefixCls}-split`]: split,
    [`${prefixCls}-bordered`]: bordered,
    [`${prefixCls}-loading`]: isLoading,
    [`${prefixCls}-grid`]: !!grid,
    [`${prefixCls}-something-after-last-item`]: isSomethingAfterLastItem,
    [`${prefixCls}-rtl`]: direction === 'rtl'
  }, contextClassName, className, rootClassName, hashId, cssVarCls);
  const containerCls = `${prefixCls}-container`;
  const paginationProps = extendsObject(defaultPaginationProps, {
    total: dataSource.length,
    current: paginationCurrent,
    pageSize: paginationSize
  }, pagination || {});
  const largestPage = Math.ceil(paginationProps.total / paginationProps.pageSize);
  paginationProps.current = Math.min(paginationProps.current, largestPage);
  const paginationContent = pagination && (/*#__PURE__*/React.createElement("div", {
    className: clsx(`${prefixCls}-pagination`)
  }, /*#__PURE__*/React.createElement(Pagination, {
    align: "end",
    ...paginationProps,
    onChange: onPaginationChange,
    onShowSizeChange: onPaginationShowSizeChange
  })));
  let splitDataSource = _toConsumableArray(dataSource);
  if (pagination) {
    if (dataSource.length > (paginationProps.current - 1) * paginationProps.pageSize) {
      splitDataSource = _toConsumableArray(dataSource).splice((paginationProps.current - 1) * paginationProps.pageSize, paginationProps.pageSize);
    }
  }
  const needResponsive = Object.keys(grid || {}).some(key => responsiveArray.includes(key));
  const screens = useBreakpoint(needResponsive);
  const currentBreakpoint = React.useMemo(() => {
    for (let i = 0; i < responsiveArray.length; i += 1) {
      const breakpoint = responsiveArray[i];
      if (screens[breakpoint]) {
        return breakpoint;
      }
    }
    return undefined;
  }, [screens]);
  const colStyle = React.useMemo(() => {
    if (!grid) {
      return undefined;
    }
    const columnCount = currentBreakpoint && grid[currentBreakpoint] ? grid[currentBreakpoint] : grid.column;
    if (columnCount) {
      return {
        width: `${100 / columnCount}%`,
        maxWidth: `${100 / columnCount}%`
      };
    }
  }, [JSON.stringify(grid), currentBreakpoint]);
  let childrenContent = isLoading && /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: 53
    }
  });
  if (splitDataSource.length > 0) {
    const items = splitDataSource.map(renderInternalItem);
    childrenContent = grid ? (/*#__PURE__*/React.createElement(Row, {
      className: clsx(containerCls, cssVarCls),
      gutter: grid.gutter
    }, React.Children.map(items, child => (/*#__PURE__*/React.createElement("div", {
      key: child?.key,
      style: colStyle
    }, child))))) : (/*#__PURE__*/React.createElement("ul", {
      className: clsx(`${prefixCls}-items`, containerCls, cssVarCls)
    }, items));
  } else if (!children && !isLoading) {
    childrenContent = /*#__PURE__*/React.createElement("div", {
      className: `${prefixCls}-empty-text`
    }, locale?.emptyText || renderEmpty?.('List') || /*#__PURE__*/React.createElement(DefaultRenderEmpty, {
      componentName: "List"
    }));
  }
  const paginationPosition = paginationProps.position;
  const contextValue = React.useMemo(() => ({
    grid,
    itemLayout
  }), [JSON.stringify(grid), itemLayout]);
  if (process.env.NODE_ENV !== 'production') {
    const warning = devUseWarning('List');
    process.env.NODE_ENV !== "production" ? warning(false, 'deprecated', 'The `List` component is deprecated. And will be removed in next major version.') : void 0;
  }
  return /*#__PURE__*/React.createElement(ListContext.Provider, {
    value: contextValue
  }, /*#__PURE__*/React.createElement("div", {
    ref: ref,
    style: {
      ...contextStyle,
      ...style
    },
    className: classString,
    ...rest
  }, (paginationPosition === 'top' || paginationPosition === 'both') && paginationContent, header && /*#__PURE__*/React.createElement("div", {
    className: `${prefixCls}-header`
  }, header), /*#__PURE__*/React.createElement(Spin, {
    ...loadingProp
  }, childrenContent, children), footer && /*#__PURE__*/React.createElement("div", {
    className: `${prefixCls}-footer`
  }, footer), loadMore || (paginationPosition === 'bottom' || paginationPosition === 'both') && paginationContent));
};
const ListWithForwardRef = /*#__PURE__*/React.forwardRef(InternalList);
if (process.env.NODE_ENV !== 'production') {
  ListWithForwardRef.displayName = 'Deprecated.List';
}
const List = ListWithForwardRef;
List.Item = Item;
export default List;