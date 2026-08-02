"use strict";
"use client";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _table = require("@rc-component/table");
/**
 * Same as `rc-component/table` but we modify trigger children update logic instead.
 */
const RcVirtualTable = (0, _table.genVirtualTable)((prev, next) => {
  const {
    _renderTimes: prevRenderTimes
  } = prev;
  const {
    _renderTimes: nextRenderTimes
  } = next;
  return prevRenderTimes !== nextRenderTimes;
});
var _default = exports.default = RcVirtualTable;