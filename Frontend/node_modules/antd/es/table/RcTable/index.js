"use client";

import { genTable } from '@rc-component/table';
/**
 * Same as `rc-component/table` but we modify trigger children update logic instead.
 */
const RcTable = genTable((prev, next) => {
  const {
    _renderTimes: prevRenderTimes
  } = prev;
  const {
    _renderTimes: nextRenderTimes
  } = next;
  return prevRenderTimes !== nextRenderTimes;
});
export default RcTable;