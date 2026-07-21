"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.OmitProps = void 0;
var React = _interopRequireWildcard(require("react"));
var _util = require("@rc-component/util");
var _clsx = require("clsx");
var _pagination = _interopRequireDefault(require("../pagination"));
var _ListItem = _interopRequireDefault(require("./ListItem"));
const OmitProps = exports.OmitProps = ['handleFilter', 'handleClear', 'checkedKeys'];
const parsePagination = pagination => {
  const defaultPagination = {
    simple: true,
    showSizeChanger: false,
    showLessItems: false
  };
  return {
    ...defaultPagination,
    ...pagination
  };
};
const TransferListBody = (props, ref) => {
  const {
    prefixCls,
    classNames,
    styles,
    filteredRenderItems,
    selectedKeys,
    disabled: globalDisabled,
    showRemove,
    pagination,
    onScroll,
    onItemSelect,
    onItemRemove
  } = props;
  const [current, setCurrent] = React.useState(1);
  const mergedPagination = React.useMemo(() => {
    if (!pagination) {
      return null;
    }
    const convertPagination = typeof pagination === 'object' ? pagination : {};
    return parsePagination(convertPagination);
  }, [pagination]);
  const [pageSize, setPageSize] = (0, _util.useControlledState)(10, mergedPagination?.pageSize);
  React.useEffect(() => {
    if (mergedPagination) {
      const maxPageCount = Math.ceil(filteredRenderItems.length / pageSize);
      setCurrent(Math.min(current, maxPageCount));
    }
  }, [filteredRenderItems, mergedPagination, pageSize]);
  const onInternalClick = (item, e) => {
    onItemSelect(item.key, !selectedKeys.includes(item.key), e);
  };
  const onRemove = item => {
    onItemRemove?.([item.key]);
  };
  const onPageChange = cur => {
    setCurrent(cur);
  };
  const onSizeChange = (cur, size) => {
    setCurrent(cur);
    setPageSize(size);
  };
  const memoizedItems = React.useMemo(() => {
    const displayItems = mergedPagination ? filteredRenderItems.slice((current - 1) * pageSize, current * pageSize) : filteredRenderItems;
    return displayItems;
  }, [current, filteredRenderItems, mergedPagination, pageSize]);
  React.useImperativeHandle(ref, () => ({
    items: memoizedItems
  }));
  const paginationNode = mergedPagination ? (/*#__PURE__*/React.createElement(_pagination.default, {
    size: "small",
    disabled: globalDisabled,
    simple: mergedPagination.simple,
    pageSize: pageSize,
    showLessItems: mergedPagination.showLessItems,
    showSizeChanger: mergedPagination.showSizeChanger,
    className: `${prefixCls}-pagination`,
    total: filteredRenderItems.length,
    current: current,
    onChange: onPageChange,
    onShowSizeChange: onSizeChange
  })) : null;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("ul", {
    className: (0, _clsx.clsx)(`${prefixCls}-content`, classNames.list, {
      [`${prefixCls}-content-show-remove`]: showRemove
    }),
    style: styles.list,
    onScroll: onScroll
  }, (memoizedItems || []).map(({
    renderedEl,
    renderedText,
    item
  }) => (/*#__PURE__*/React.createElement(_ListItem.default, {
    key: item.key,
    prefixCls: prefixCls,
    classNames: classNames,
    styles: styles,
    item: item,
    renderedText: renderedText,
    renderedEl: renderedEl,
    showRemove: showRemove,
    onClick: onInternalClick,
    onRemove: onRemove,
    checked: selectedKeys.includes(item.key),
    disabled: globalDisabled
  })))), paginationNode);
};
if (process.env.NODE_ENV !== 'production') {
  TransferListBody.displayName = 'TransferListBody';
}
var _default = exports.default = /*#__PURE__*/React.forwardRef(TransferListBody);