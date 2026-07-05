"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _clsx = require("clsx");
var _useControlledState = _interopRequireDefault(require("@rc-component/util/lib/hooks/useControlledState"));
var _KeyCode = _interopRequireDefault(require("@rc-component/util/lib/KeyCode"));
var _pickAttrs = _interopRequireDefault(require("@rc-component/util/lib/pickAttrs"));
var _warning = _interopRequireDefault(require("@rc-component/util/lib/warning"));
var _react = _interopRequireWildcard(require("react"));
var _zh_CN = _interopRequireDefault(require("./locale/zh_CN"));
var _Options = _interopRequireDefault(require("./Options"));
var _Pager = _interopRequireDefault(require("./Pager"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
const defaultItemRender = (_, __, element) => element;
function noop() {}
function isInteger(v) {
  const value = Number(v);
  return typeof value === 'number' && !Number.isNaN(value) && isFinite(value) && Math.floor(value) === value;
}
function calculatePage(p, pageSize, total) {
  const _pageSize = typeof p === 'undefined' ? pageSize : p;
  return Math.floor((total - 1) / _pageSize) + 1;
}
const Pagination = props => {
  const {
    // cls
    prefixCls = 'rc-pagination',
    selectPrefixCls = 'rc-select',
    className,
    classNames: paginationClassNames,
    styles,
    // control
    current: currentProp,
    defaultCurrent = 1,
    total = 0,
    pageSize: pageSizeProp,
    defaultPageSize = 10,
    onChange = noop,
    // config
    hideOnSinglePage,
    align,
    showPrevNextJumpers = true,
    showQuickJumper,
    showLessItems,
    showTitle = true,
    onShowSizeChange = noop,
    locale = _zh_CN.default,
    style,
    totalBoundaryShowSizeChanger = 50,
    disabled,
    simple,
    showTotal,
    showSizeChanger = total > totalBoundaryShowSizeChanger,
    sizeChangerRender,
    pageSizeOptions,
    // render
    itemRender = defaultItemRender,
    jumpPrevIcon,
    jumpNextIcon,
    prevIcon,
    nextIcon
  } = props;
  const paginationRef = _react.default.useRef(null);
  const [pageSize, setPageSize] = (0, _useControlledState.default)(defaultPageSize, pageSizeProp);
  const [internalCurrent, setCurrent] = (0, _useControlledState.default)(defaultCurrent, currentProp);
  const current = Math.max(1, Math.min(internalCurrent, calculatePage(undefined, pageSize, total)));
  const [internalInputVal, setInternalInputVal] = _react.default.useState(current);
  (0, _react.useEffect)(() => {
    setInternalInputVal(current);
  }, [current]);
  const hasOnChange = onChange !== noop;
  const hasCurrent = ('current' in props);
  if (process.env.NODE_ENV !== 'production') {
    (0, _warning.default)(hasCurrent ? hasOnChange : true, 'You provided a `current` prop to a Pagination component without an `onChange` handler. This will render a read-only component.');
  }
  const jumpPrevPage = Math.max(1, current - (showLessItems ? 3 : 5));
  const jumpNextPage = Math.min(calculatePage(undefined, pageSize, total), current + (showLessItems ? 3 : 5));
  function getItemIcon(icon, label) {
    let iconNode = icon || /*#__PURE__*/_react.default.createElement("button", {
      type: "button",
      "aria-label": label,
      className: `${prefixCls}-item-link`
    });
    if (typeof icon === 'function') {
      iconNode = /*#__PURE__*/_react.default.createElement(icon, props);
    }
    return iconNode;
  }
  function getValidValue(e) {
    const inputValue = e.target.value;
    const allPages = calculatePage(undefined, pageSize, total);
    let value;
    if (inputValue === '') {
      value = inputValue;
    } else if (Number.isNaN(Number(inputValue))) {
      value = internalInputVal;
    } else if (inputValue >= allPages) {
      value = allPages;
    } else {
      value = Number(inputValue);
    }
    return value;
  }
  function isValid(page) {
    return isInteger(page) && page !== current && isInteger(total) && total > 0;
  }
  const shouldDisplayQuickJumper = total > pageSize ? showQuickJumper : false;

  /**
   * prevent "up arrow" key reseting cursor position within textbox
   * @see https://stackoverflow.com/a/1081114
   */
  function handleKeyDown(event) {
    if (event.keyCode === _KeyCode.default.UP || event.keyCode === _KeyCode.default.DOWN) {
      event.preventDefault();
    }
  }
  function handleKeyUp(event) {
    const value = getValidValue(event);
    if (value !== internalInputVal) {
      setInternalInputVal(value);
    }
    switch (event.keyCode) {
      case _KeyCode.default.ENTER:
        handleChange(value);
        break;
      case _KeyCode.default.UP:
        handleChange(value - 1);
        break;
      case _KeyCode.default.DOWN:
        handleChange(value + 1);
        break;
      default:
        break;
    }
  }
  function handleBlur(event) {
    handleChange(getValidValue(event));
  }
  function changePageSize(size) {
    const newCurrent = calculatePage(size, pageSize, total);
    const nextCurrent = current > newCurrent && newCurrent !== 0 ? newCurrent : current;
    setPageSize(size);
    setInternalInputVal(nextCurrent);
    onShowSizeChange?.(current, size);
    setCurrent(nextCurrent);
    onChange?.(nextCurrent, size);
  }
  function handleChange(page) {
    if (isValid(page) && !disabled) {
      const currentPage = calculatePage(undefined, pageSize, total);
      let newPage = page;
      if (page > currentPage) {
        newPage = currentPage;
      } else if (page < 1) {
        newPage = 1;
      }
      if (newPage !== internalInputVal) {
        setInternalInputVal(newPage);
      }
      setCurrent(newPage);
      onChange?.(newPage, pageSize);
      return newPage;
    }
    return current;
  }
  const hasPrev = current > 1;
  const hasNext = current < calculatePage(undefined, pageSize, total);
  function prevHandle() {
    if (hasPrev) handleChange(current - 1);
  }
  function nextHandle() {
    if (hasNext) handleChange(current + 1);
  }
  function jumpPrevHandle() {
    handleChange(jumpPrevPage);
  }
  function jumpNextHandle() {
    handleChange(jumpNextPage);
  }
  function runIfEnter(event, callback, ...restParams) {
    if (event.key === 'Enter' || event.charCode === _KeyCode.default.ENTER || event.keyCode === _KeyCode.default.ENTER) {
      callback(...restParams);
    }
  }
  function runIfEnterPrev(event) {
    runIfEnter(event, prevHandle);
  }
  function runIfEnterNext(event) {
    runIfEnter(event, nextHandle);
  }
  function runIfEnterJumpPrev(event) {
    runIfEnter(event, jumpPrevHandle);
  }
  function runIfEnterJumpNext(event) {
    runIfEnter(event, jumpNextHandle);
  }
  function renderPrev(prevPage) {
    const prevButton = itemRender(prevPage, 'prev', getItemIcon(prevIcon, 'prev page'));
    return /*#__PURE__*/_react.default.isValidElement(prevButton) ? /*#__PURE__*/_react.default.cloneElement(prevButton, {
      disabled: !hasPrev
    }) : prevButton;
  }
  function renderNext(nextPage) {
    const nextButton = itemRender(nextPage, 'next', getItemIcon(nextIcon, 'next page'));
    return /*#__PURE__*/_react.default.isValidElement(nextButton) ? /*#__PURE__*/_react.default.cloneElement(nextButton, {
      disabled: !hasNext
    }) : nextButton;
  }
  function handleGoTO(event) {
    if (event.type === 'click' || event.keyCode === _KeyCode.default.ENTER) {
      handleChange(internalInputVal);
    }
  }
  let jumpPrev = null;
  const dataOrAriaAttributeProps = (0, _pickAttrs.default)(props, {
    aria: true,
    data: true
  });
  const totalText = showTotal && /*#__PURE__*/_react.default.createElement("li", {
    className: `${prefixCls}-total-text`
  }, showTotal(total, [total === 0 ? 0 : (current - 1) * pageSize + 1, current * pageSize > total ? total : current * pageSize]));
  let jumpNext = null;
  const allPages = calculatePage(undefined, pageSize, total);

  // ================== Render ==================
  // When hideOnSinglePage is true and there is only 1 page, hide the pager
  if (hideOnSinglePage && total <= pageSize) {
    return null;
  }
  const pagerList = [];
  const pagerProps = {
    rootPrefixCls: prefixCls,
    onClick: handleChange,
    onKeyPress: runIfEnter,
    showTitle,
    itemRender,
    page: -1,
    className: paginationClassNames?.item,
    style: styles?.item
  };
  const prevPage = current - 1 > 0 ? current - 1 : 0;
  const nextPage = current + 1 < allPages ? current + 1 : allPages;
  const goButton = showQuickJumper && showQuickJumper.goButton;

  // ================== Simple ==================
  // FIXME: ts type
  const isReadOnly = typeof simple === 'object' ? simple.readOnly : !simple;
  let gotoButton = goButton;
  let simplePager = null;
  if (simple) {
    // ====== Simple quick jump ======
    if (goButton) {
      if (typeof goButton === 'boolean') {
        gotoButton = /*#__PURE__*/_react.default.createElement("button", {
          type: "button",
          onClick: handleGoTO,
          onKeyUp: handleGoTO
        }, locale.jump_to_confirm);
      } else {
        gotoButton = /*#__PURE__*/_react.default.createElement("span", {
          onClick: handleGoTO,
          onKeyUp: handleGoTO
        }, goButton);
      }
      gotoButton = /*#__PURE__*/_react.default.createElement("li", {
        title: showTitle ? `${locale.jump_to}${current}/${allPages}` : null,
        className: `${prefixCls}-simple-pager`
      }, gotoButton);
    }
    simplePager = /*#__PURE__*/_react.default.createElement("li", {
      title: showTitle ? `${current}/${allPages}` : null,
      className: (0, _clsx.clsx)(`${prefixCls}-simple-pager`, paginationClassNames?.item),
      style: styles?.item
    }, isReadOnly ? internalInputVal : /*#__PURE__*/_react.default.createElement("input", {
      type: "text",
      "aria-label": locale.jump_to,
      value: internalInputVal,
      disabled: disabled,
      onKeyDown: handleKeyDown,
      onKeyUp: handleKeyUp,
      onChange: handleKeyUp,
      onBlur: handleBlur,
      size: 3
    }), /*#__PURE__*/_react.default.createElement("span", {
      className: `${prefixCls}-slash`
    }, "/"), allPages);
  }

  // ====================== Normal ======================
  const pageBufferSize = showLessItems ? 1 : 2;
  if (allPages <= 3 + pageBufferSize * 2) {
    if (!allPages) {
      pagerList.push( /*#__PURE__*/_react.default.createElement(_Pager.default, _extends({}, pagerProps, {
        key: "noPager",
        page: 1,
        className: `${prefixCls}-item-disabled`
      })));
    }
    for (let i = 1; i <= allPages; i += 1) {
      pagerList.push( /*#__PURE__*/_react.default.createElement(_Pager.default, _extends({}, pagerProps, {
        key: i,
        page: i,
        active: current === i
      })));
    }
  } else {
    const prevItemTitle = showLessItems ? locale.prev_3 : locale.prev_5;
    const nextItemTitle = showLessItems ? locale.next_3 : locale.next_5;
    const jumpPrevContent = itemRender(jumpPrevPage, 'jump-prev', getItemIcon(jumpPrevIcon, 'prev page'));
    const jumpNextContent = itemRender(jumpNextPage, 'jump-next', getItemIcon(jumpNextIcon, 'next page'));
    if (showPrevNextJumpers) {
      jumpPrev = jumpPrevContent ? /*#__PURE__*/_react.default.createElement("li", {
        title: showTitle ? prevItemTitle : null,
        key: "prev",
        onClick: jumpPrevHandle,
        tabIndex: 0,
        onKeyDown: runIfEnterJumpPrev,
        className: (0, _clsx.clsx)(`${prefixCls}-jump-prev`, {
          [`${prefixCls}-jump-prev-custom-icon`]: !!jumpPrevIcon
        })
      }, jumpPrevContent) : null;
      jumpNext = jumpNextContent ? /*#__PURE__*/_react.default.createElement("li", {
        title: showTitle ? nextItemTitle : null,
        key: "next",
        onClick: jumpNextHandle,
        tabIndex: 0,
        onKeyDown: runIfEnterJumpNext,
        className: (0, _clsx.clsx)(`${prefixCls}-jump-next`, {
          [`${prefixCls}-jump-next-custom-icon`]: !!jumpNextIcon
        })
      }, jumpNextContent) : null;
    }
    let left = Math.max(1, current - pageBufferSize);
    let right = Math.min(current + pageBufferSize, allPages);
    if (current - 1 <= pageBufferSize) {
      right = 1 + pageBufferSize * 2;
    }
    if (allPages - current <= pageBufferSize) {
      left = allPages - pageBufferSize * 2;
    }
    for (let i = left; i <= right; i += 1) {
      pagerList.push( /*#__PURE__*/_react.default.createElement(_Pager.default, _extends({}, pagerProps, {
        key: i,
        page: i,
        active: current === i
      })));
    }
    if (current - 1 >= pageBufferSize * 2 && current !== 1 + 2) {
      pagerList[0] = /*#__PURE__*/_react.default.cloneElement(pagerList[0], {
        className: (0, _clsx.clsx)(`${prefixCls}-item-after-jump-prev`, pagerList[0].props.className)
      });
      pagerList.unshift(jumpPrev);
    }
    if (allPages - current >= pageBufferSize * 2 && current !== allPages - 2) {
      const lastOne = pagerList[pagerList.length - 1];
      pagerList[pagerList.length - 1] = /*#__PURE__*/_react.default.cloneElement(lastOne, {
        className: (0, _clsx.clsx)(`${prefixCls}-item-before-jump-next`, lastOne.props.className)
      });
      pagerList.push(jumpNext);
    }
    if (left !== 1) {
      pagerList.unshift( /*#__PURE__*/_react.default.createElement(_Pager.default, _extends({}, pagerProps, {
        key: 1,
        page: 1
      })));
    }
    if (right !== allPages) {
      pagerList.push( /*#__PURE__*/_react.default.createElement(_Pager.default, _extends({}, pagerProps, {
        key: allPages,
        page: allPages
      })));
    }
  }
  let prev = renderPrev(prevPage);
  if (prev) {
    const prevDisabled = !hasPrev || !allPages;
    prev = /*#__PURE__*/_react.default.createElement("li", {
      title: showTitle ? locale.prev_page : null,
      onClick: prevHandle,
      tabIndex: prevDisabled ? null : 0,
      onKeyDown: runIfEnterPrev,
      className: (0, _clsx.clsx)(`${prefixCls}-prev`, paginationClassNames?.item, {
        [`${prefixCls}-disabled`]: prevDisabled
      }),
      style: styles?.item,
      "aria-disabled": prevDisabled
    }, prev);
  }
  let next = renderNext(nextPage);
  if (next) {
    let nextDisabled, nextTabIndex;
    if (simple) {
      nextDisabled = !hasNext;
      nextTabIndex = hasPrev ? 0 : null;
    } else {
      nextDisabled = !hasNext || !allPages;
      nextTabIndex = nextDisabled ? null : 0;
    }
    next = /*#__PURE__*/_react.default.createElement("li", {
      title: showTitle ? locale.next_page : null,
      onClick: nextHandle,
      tabIndex: nextTabIndex,
      onKeyDown: runIfEnterNext,
      className: (0, _clsx.clsx)(`${prefixCls}-next`, paginationClassNames?.item, {
        [`${prefixCls}-disabled`]: nextDisabled
      }),
      style: styles?.item,
      "aria-disabled": nextDisabled
    }, next);
  }
  const cls = (0, _clsx.clsx)(prefixCls, className, {
    [`${prefixCls}-start`]: align === 'start',
    [`${prefixCls}-center`]: align === 'center',
    [`${prefixCls}-end`]: align === 'end',
    [`${prefixCls}-simple`]: simple,
    [`${prefixCls}-disabled`]: disabled
  });
  return /*#__PURE__*/_react.default.createElement("ul", _extends({
    className: cls,
    style: style,
    ref: paginationRef
  }, dataOrAriaAttributeProps), totalText, prev, simple ? simplePager : pagerList, next, /*#__PURE__*/_react.default.createElement(_Options.default, {
    locale: locale,
    rootPrefixCls: prefixCls,
    disabled: disabled,
    selectPrefixCls: selectPrefixCls,
    changeSize: changePageSize,
    pageSize: pageSize,
    pageSizeOptions: pageSizeOptions,
    quickGo: shouldDisplayQuickJumper ? handleChange : null,
    goButton: gotoButton,
    showSizeChanger: showSizeChanger,
    sizeChangerRender: sizeChangerRender
  }));
};
if (process.env.NODE_ENV !== 'production') {
  Pagination.displayName = 'Pagination';
}
var _default = exports.default = Pagination;