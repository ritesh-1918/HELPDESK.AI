"use client";

import * as React from 'react';
import { INTERNAL_HOOKS } from '@rc-component/table';
import { convertChildrenToColumns } from "@rc-component/table/es/hooks/useColumns";
import { omit } from '@rc-component/util';
import { clsx } from 'clsx';
import { useMergeSemantic, useProxyImperativeHandle } from '../_util/hooks';
import scrollTo from '../_util/scrollTo';
import { devUseWarning } from '../_util/warning';
import ConfigProvider from '../config-provider';
import { ConfigContext, useComponentConfig } from '../config-provider/context';
import DefaultRenderEmpty from '../config-provider/defaultRenderEmpty';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import useSize from '../config-provider/hooks/useSize';
import useBreakpoint from '../grid/hooks/useBreakpoint';
import { useLocale } from '../locale';
import defaultLocale from '../locale/en_US';
import Pagination from '../pagination';
import Spin from '../spin';
import { useToken } from '../theme/internal';
import renderExpandIcon from './ExpandIcon';
import useContainerWidth from './hooks/useContainerWidth';
import useFilter, { getFilterData } from './hooks/useFilter';
import useLazyKVMap from './hooks/useLazyKVMap';
import usePagination, { DEFAULT_PAGE_SIZE, getPaginationParam } from './hooks/usePagination';
import useSelection from './hooks/useSelection';
import useSorter, { getSortData } from './hooks/useSorter';
import useTitleColumns from './hooks/useTitleColumns';
import RcTable from './RcTable';
import RcVirtualTable from './RcTable/VirtualTable';
import useStyle from './style';
import TableMeasureRowContext from './TableMeasureRowContext';
const EMPTY_LIST = [];
const InternalTable = (props, ref) => {
  const {
    prefixCls: customizePrefixCls,
    className,
    rootClassName,
    style,
    classNames,
    styles,
    size: customizeSize,
    bordered,
    dropdownPrefixCls: customizeDropdownPrefixCls,
    dataSource,
    pagination,
    rowSelection,
    rowKey: customizeRowKey,
    rowClassName,
    columns,
    children,
    childrenColumnName: legacyChildrenColumnName,
    onChange,
    getPopupContainer,
    loading,
    expandIcon,
    expandable,
    expandedRowRender,
    expandIconColumnIndex,
    indentSize,
    scroll,
    sortDirections,
    locale,
    showSorterTooltip = {
      target: 'full-header'
    },
    virtual
  } = props;
  const warning = devUseWarning('Table');
  const baseColumns = React.useMemo(() => columns || convertChildrenToColumns(children), [columns, children]);
  const needResponsive = React.useMemo(() => baseColumns.some(col => col.responsive), [baseColumns]);
  const screens = useBreakpoint(needResponsive);
  const mergedColumns = React.useMemo(() => {
    const matched = new Set(Object.keys(screens).filter(m => screens[m]));
    return baseColumns.filter(c => !c.responsive || c.responsive.some(r => matched.has(r)));
  }, [baseColumns, screens]);
  const tableProps = omit(props, ['className', 'style', 'columns']);
  const {
    locale: contextLocale = defaultLocale,
    table
  } = React.useContext(ConfigContext);
  const {
    getPrefixCls,
    direction,
    renderEmpty,
    getPopupContainer: getContextPopupContainer,
    className: contextClassName,
    style: contextStyle,
    classNames: contextClassNames,
    styles: contextStyles
  } = useComponentConfig('table');
  const mergedSize = useSize(customizeSize);
  // =========== Merged Props for Semantic ==========
  const mergedProps = {
    ...props,
    size: mergedSize,
    bordered
  };
  const [mergedClassNames, mergedStyles] = useMergeSemantic([contextClassNames, classNames], [contextStyles, styles], {
    props: mergedProps
  }, {
    pagination: {
      _default: 'root'
    },
    header: {
      _default: 'wrapper'
    },
    body: {
      _default: 'wrapper'
    }
  });
  const tableLocale = {
    ...contextLocale.Table,
    ...locale
  };
  const [globalLocale] = useLocale('global', defaultLocale.global);
  const rawData = dataSource || EMPTY_LIST;
  const prefixCls = getPrefixCls('table', customizePrefixCls);
  const dropdownPrefixCls = getPrefixCls('dropdown', customizeDropdownPrefixCls);
  const [, token] = useToken();
  const rootCls = useCSSVarCls(prefixCls);
  const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);
  const mergedExpandable = {
    childrenColumnName: legacyChildrenColumnName,
    expandIconColumnIndex,
    ...expandable,
    expandIcon: expandable?.expandIcon ?? table?.expandable?.expandIcon
  };
  const {
    childrenColumnName = 'children'
  } = mergedExpandable;
  const expandType = React.useMemo(() => {
    if (rawData.some(item => item?.[childrenColumnName])) {
      return 'nest';
    }
    if (expandedRowRender || expandable?.expandedRowRender) {
      return 'row';
    }
    return null;
  }, [childrenColumnName, rawData]);
  const internalRefs = {
    body: React.useRef(null)
  };
  // ============================ Width =============================
  const getContainerWidth = useContainerWidth(prefixCls);
  // ============================= Refs =============================
  const rootRef = React.useRef(null);
  const tblRef = React.useRef(null);
  useProxyImperativeHandle(ref, () => ({
    ...tblRef.current,
    nativeElement: rootRef.current
  }));
  // ============================ RowKey ============================
  const rowKey = customizeRowKey || table?.rowKey || 'key';
  // ============================ Scroll ============================
  const mergedScroll = scroll ?? table?.scroll;
  if (process.env.NODE_ENV !== 'production') {
    process.env.NODE_ENV !== "production" ? warning(!(typeof rowKey === 'function' && rowKey.length > 1), 'usage', '`index` parameter of `rowKey` function is deprecated. There is no guarantee that it will work as expected.') : void 0;
  }
  const getRowKey = React.useMemo(() => {
    if (typeof rowKey === 'function') {
      return rowKey;
    }
    return record => record?.[rowKey];
  }, [rowKey]);
  const [getRecordByKey] = useLazyKVMap(rawData, childrenColumnName, getRowKey);
  // ============================ Events =============================
  const changeEventInfo = {};
  const triggerOnChange = (info, action, reset = false) => {
    const changeInfo = {
      ...changeEventInfo,
      ...info
    };
    if (reset) {
      changeEventInfo.resetPagination?.();
      // Reset event param
      if (changeInfo.pagination?.current) {
        changeInfo.pagination.current = 1;
      }
      // Trigger pagination events
      if (pagination) {
        pagination.onChange?.(1, changeInfo.pagination?.pageSize);
      }
    }
    if (scroll && scroll.scrollToFirstRowOnChange !== false && internalRefs.body.current) {
      scrollTo(0, {
        getContainer: () => internalRefs.body.current
      });
    }
    onChange?.(changeInfo.pagination, changeInfo.filters, changeInfo.sorter, {
      currentDataSource: getFilterData(getSortData(rawData, changeInfo.sorterStates, childrenColumnName), changeInfo.filterStates, childrenColumnName),
      action
    });
  };
  /**
   * Controlled state in `columns` is not a good idea that makes too many code (1000+ line?) to read
   * state out and then put it back to title render. Move these code into `hooks` but still too
   * complex. We should provides Table props like `sorter` & `filter` to handle control in next big
   * version.
   */
  // ============================ Sorter =============================
  const onSorterChange = (sorter, sorterStates) => {
    triggerOnChange({
      sorter,
      sorterStates
    }, 'sort', false);
  };
  const [transformSorterColumns, sortStates, sorterTitleProps, getSorters] = useSorter({
    prefixCls,
    mergedColumns,
    onSorterChange,
    sortDirections: sortDirections || ['ascend', 'descend'],
    tableLocale,
    showSorterTooltip,
    globalLocale
  });
  const sortedData = React.useMemo(() => getSortData(rawData, sortStates, childrenColumnName), [childrenColumnName, rawData, sortStates]);
  changeEventInfo.sorter = getSorters();
  changeEventInfo.sorterStates = sortStates;
  // ============================ Filter ============================
  const onFilterChange = (filters, filterStates) => {
    triggerOnChange({
      filters,
      filterStates
    }, 'filter', true);
  };
  const [transformFilterColumns, filterStates, filters] = useFilter({
    prefixCls,
    locale: tableLocale,
    dropdownPrefixCls,
    mergedColumns,
    onFilterChange,
    getPopupContainer: getPopupContainer || getContextPopupContainer,
    rootClassName: clsx(rootClassName, rootCls)
  });
  const mergedData = getFilterData(sortedData, filterStates, childrenColumnName);
  changeEventInfo.filters = filters;
  changeEventInfo.filterStates = filterStates;
  // ============================ Column ============================
  const columnTitleProps = React.useMemo(() => {
    const mergedFilters = {};
    Object.keys(filters).forEach(filterKey => {
      if (filters[filterKey] !== null) {
        mergedFilters[filterKey] = filters[filterKey];
      }
    });
    return {
      ...sorterTitleProps,
      filters: mergedFilters
    };
  }, [sorterTitleProps, filters]);
  const [transformTitleColumns] = useTitleColumns(columnTitleProps);
  // ========================== Pagination ==========================
  const onPaginationChange = (current, pageSize) => {
    triggerOnChange({
      pagination: {
        ...changeEventInfo.pagination,
        current,
        pageSize
      }
    }, 'paginate');
  };
  const [mergedPagination, resetPagination] = usePagination(mergedData.length, onPaginationChange, pagination);
  changeEventInfo.pagination = pagination === false ? {} : getPaginationParam(mergedPagination, pagination);
  changeEventInfo.resetPagination = resetPagination;
  // ============================= Data =============================
  const pageData = React.useMemo(() => {
    if (pagination === false || !mergedPagination.pageSize) {
      return mergedData;
    }
    const {
      current = 1,
      total,
      pageSize = DEFAULT_PAGE_SIZE
    } = mergedPagination;
    process.env.NODE_ENV !== "production" ? warning(current > 0, 'usage', '`current` should be positive number.') : void 0;
    // Dynamic table data
    if (mergedData.length < total) {
      if (mergedData.length > pageSize) {
        process.env.NODE_ENV !== "production" ? warning(false, 'usage', '`dataSource` length is less than `pagination.total` but large than `pagination.pageSize`. Please make sure your config correct data with async mode.') : void 0;
        return mergedData.slice((current - 1) * pageSize, current * pageSize);
      }
      return mergedData;
    }
    return mergedData.slice((current - 1) * pageSize, current * pageSize);
  }, [!!pagination, mergedData, mergedPagination?.current, mergedPagination?.pageSize, mergedPagination?.total]);
  // ========================== Selections ==========================
  const [transformSelectionColumns, selectedKeySet] = useSelection({
    prefixCls,
    data: mergedData,
    pageData,
    getRowKey,
    getRecordByKey,
    expandType,
    childrenColumnName,
    locale: tableLocale,
    getPopupContainer: getPopupContainer || getContextPopupContainer
  }, rowSelection);
  const internalRowClassName = (record, index, indent) => {
    const resolvedRowClassName = typeof rowClassName === 'function' ? rowClassName(record, index, indent) : rowClassName;
    return clsx({
      [`${prefixCls}-row-selected`]: selectedKeySet.has(getRowKey(record, index))
    }, resolvedRowClassName);
  };
  // ========================== Expandable ==========================
  // Pass origin render status into `@rc-component/table`, this can be removed when refactor with `@rc-component/table`
  mergedExpandable.__PARENT_RENDER_ICON__ = mergedExpandable.expandIcon;
  // Customize expandable icon
  mergedExpandable.expandIcon = mergedExpandable.expandIcon || expandIcon || renderExpandIcon(tableLocale);
  // Adjust expand icon index, no overwrite expandIconColumnIndex if set.
  if (expandType === 'nest' && mergedExpandable.expandIconColumnIndex === undefined) {
    mergedExpandable.expandIconColumnIndex = rowSelection ? 1 : 0;
  } else if (mergedExpandable.expandIconColumnIndex > 0 && rowSelection) {
    mergedExpandable.expandIconColumnIndex -= 1;
  }
  // Indent size
  if (typeof mergedExpandable.indentSize !== 'number') {
    mergedExpandable.indentSize = typeof indentSize === 'number' ? indentSize : 15;
  }
  // ============================ Render ============================
  const transformColumns = React.useCallback(innerColumns => transformTitleColumns(transformSelectionColumns(transformFilterColumns(transformSorterColumns(innerColumns)))), [transformSorterColumns, transformFilterColumns, transformSelectionColumns]);
  let topPaginationNode;
  let bottomPaginationNode;
  if (pagination !== false && mergedPagination?.total) {
    let paginationSize;
    if (mergedPagination.size) {
      paginationSize = mergedPagination.size;
    } else {
      paginationSize = mergedSize === 'small' || mergedSize === 'middle' ? 'small' : undefined;
    }
    const renderPagination = (placement = 'end') => (/*#__PURE__*/React.createElement(Pagination, {
      ...mergedPagination,
      classNames: mergedClassNames.pagination,
      styles: mergedStyles.pagination,
      className: clsx(`${prefixCls}-pagination ${prefixCls}-pagination-${placement}`, mergedPagination.className),
      size: paginationSize
    }));
    const {
      placement,
      position
    } = mergedPagination;
    const mergedPlacement = placement ?? position;
    const normalizePlacement = pos => {
      const lowerPos = pos.toLowerCase();
      if (lowerPos.includes('center')) {
        return 'center';
      }
      return lowerPos.includes('left') || lowerPos.includes('start') ? 'start' : 'end';
    };
    if (Array.isArray(mergedPlacement)) {
      const [topPos, bottomPos] = ['top', 'bottom'].map(dir => mergedPlacement.find(p => p.includes(dir)));
      const isDisable = mergedPlacement.every(p => `${p}` === 'none');
      if (!topPos && !bottomPos && !isDisable) {
        bottomPaginationNode = renderPagination();
      }
      if (topPos) {
        topPaginationNode = renderPagination(normalizePlacement(topPos));
      }
      if (bottomPos) {
        bottomPaginationNode = renderPagination(normalizePlacement(bottomPos));
      }
    } else {
      bottomPaginationNode = renderPagination();
    }
    if (process.env.NODE_ENV !== 'production') {
      warning.deprecated(!position, 'pagination.position', 'pagination.placement');
    }
  }
  // >>>>>>>>> Spinning
  const spinProps = React.useMemo(() => {
    if (typeof loading === 'boolean') {
      return {
        spinning: loading
      };
    } else if (typeof loading === 'object' && loading !== null) {
      return {
        spinning: true,
        ...loading
      };
    } else {
      return undefined;
    }
  }, [loading]);
  const wrappercls = clsx(cssVarCls, rootCls, `${prefixCls}-wrapper`, contextClassName, {
    [`${prefixCls}-wrapper-rtl`]: direction === 'rtl'
  }, className, rootClassName, mergedClassNames.root, hashId);
  const mergedStyle = {
    ...mergedStyles.root,
    ...contextStyle,
    ...style
  };
  // ========== empty ==========
  const mergedEmptyNode = React.useMemo(() => {
    // When dataSource is null/undefined (detected by reference equality with EMPTY_LIST),
    // and the table is in a loading state, we only show the loading spinner without the empty placeholder.
    // For empty arrays (datasource={[]}), both loading and empty states would normally be shown.
    // discussion https://github.com/ant-design/ant-design/issues/54601#issuecomment-3158091383
    if (spinProps?.spinning && rawData === EMPTY_LIST) {
      return null;
    }
    if (typeof locale?.emptyText !== 'undefined') {
      return locale.emptyText;
    }
    return renderEmpty?.('Table') || /*#__PURE__*/React.createElement(DefaultRenderEmpty, {
      componentName: "Table"
    });
  }, [spinProps?.spinning, rawData, locale?.emptyText, renderEmpty]);
  // ========================== Render ==========================
  const TableComponent = virtual ? RcVirtualTable : RcTable;
  // >>> Virtual Table props. We set height here since it will affect height collection
  const virtualProps = {};
  const listItemHeight = React.useMemo(() => {
    const {
      fontSize,
      lineHeight,
      lineWidth,
      padding,
      paddingXS,
      paddingSM
    } = token;
    const fontHeight = Math.floor(fontSize * lineHeight);
    switch (mergedSize) {
      case 'middle':
        return paddingSM * 2 + fontHeight + lineWidth;
      case 'small':
        return paddingXS * 2 + fontHeight + lineWidth;
      default:
        return padding * 2 + fontHeight + lineWidth;
    }
  }, [token, mergedSize]);
  if (virtual) {
    virtualProps.listItemHeight = listItemHeight;
  }
  return /*#__PURE__*/React.createElement("div", {
    ref: rootRef,
    className: wrappercls,
    style: mergedStyle
  }, /*#__PURE__*/React.createElement(Spin, {
    spinning: false,
    ...spinProps
  }, topPaginationNode, /*#__PURE__*/React.createElement(TableComponent, {
    ...virtualProps,
    ...tableProps,
    scroll: mergedScroll,
    classNames: mergedClassNames,
    styles: mergedStyles,
    ref: tblRef,
    columns: mergedColumns,
    direction: direction,
    expandable: mergedExpandable,
    prefixCls: prefixCls,
    className: clsx({
      [`${prefixCls}-middle`]: mergedSize === 'middle',
      [`${prefixCls}-small`]: mergedSize === 'small',
      [`${prefixCls}-bordered`]: bordered,
      [`${prefixCls}-empty`]: rawData.length === 0
    }, cssVarCls, rootCls, hashId),
    data: pageData,
    rowKey: getRowKey,
    rowClassName: internalRowClassName,
    emptyText: mergedEmptyNode,
    // Internal
    internalHooks: INTERNAL_HOOKS,
    internalRefs: internalRefs,
    transformColumns: transformColumns,
    getContainerWidth: getContainerWidth,
    measureRowRender: measureRow => (/*#__PURE__*/React.createElement(TableMeasureRowContext.Provider, {
      value: true
    }, /*#__PURE__*/React.createElement(ConfigProvider, {
      getPopupContainer: node => node
    }, measureRow)))
  }), bottomPaginationNode));
};
export default /*#__PURE__*/React.forwardRef(InternalTable);