import useMemo from "@rc-component/util/es/hooks/useMemo";
import isEqual from "@rc-component/util/es/isEqual";
import { getCellFixedInfo } from "../utils/fixUtil";
import * as React from 'react';
export default function useFixedInfo(flattenColumns, stickyOffsets) {
  const fixedInfoList = React.useMemo(() => flattenColumns.map((_, colIndex) => getCellFixedInfo(colIndex, colIndex, flattenColumns, stickyOffsets)), [flattenColumns, stickyOffsets]);
  return useMemo(() => fixedInfoList, [fixedInfoList], (prev, next) => !isEqual(prev, next));
}