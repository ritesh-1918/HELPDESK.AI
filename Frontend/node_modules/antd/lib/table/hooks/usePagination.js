"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.DEFAULT_PAGE_SIZE = void 0;
exports.getPaginationParam = getPaginationParam;
var _react = require("react");
var _extendsObject = _interopRequireDefault(require("../../_util/extendsObject"));
const DEFAULT_PAGE_SIZE = exports.DEFAULT_PAGE_SIZE = 10;
function getPaginationParam(mergedPagination, pagination) {
  const param = {
    current: mergedPagination.current,
    pageSize: mergedPagination.pageSize
  };
  const paginationObj = pagination && typeof pagination === 'object' ? pagination : {};
  Object.keys(paginationObj).forEach(pageProp => {
    const value = mergedPagination[pageProp];
    if (typeof value !== 'function') {
      param[pageProp] = value;
    }
  });
  return param;
}
function usePagination(total, onChange, pagination) {
  const {
    total: paginationTotal = 0,
    ...paginationObj
  } = pagination && typeof pagination === 'object' ? pagination : {};
  const [innerPagination, setInnerPagination] = (0, _react.useState)(() => ({
    current: 'defaultCurrent' in paginationObj ? paginationObj.defaultCurrent : 1,
    pageSize: 'defaultPageSize' in paginationObj ? paginationObj.defaultPageSize : DEFAULT_PAGE_SIZE
  }));
  // ============ Basic Pagination Config ============
  const mergedPagination = (0, _extendsObject.default)(innerPagination, paginationObj, {
    total: paginationTotal > 0 ? paginationTotal : total
  });
  // Reset `current` if data length or pageSize changed
  const maxPage = Math.ceil((paginationTotal || total) / mergedPagination.pageSize);
  if (mergedPagination.current > maxPage) {
    // Prevent a maximum page count of 0
    mergedPagination.current = maxPage || 1;
  }
  const refreshPagination = (current, pageSize) => {
    setInnerPagination({
      current: current ?? 1,
      pageSize: pageSize || mergedPagination.pageSize
    });
  };
  const onInternalChange = (current, pageSize) => {
    if (pagination) {
      pagination.onChange?.(current, pageSize);
    }
    refreshPagination(current, pageSize);
    onChange(current, pageSize || mergedPagination?.pageSize);
  };
  if (pagination === false) {
    return [{}, () => {}];
  }
  return [{
    ...mergedPagination,
    onChange: onInternalChange
  }, refreshPagination];
}
var _default = exports.default = usePagination;