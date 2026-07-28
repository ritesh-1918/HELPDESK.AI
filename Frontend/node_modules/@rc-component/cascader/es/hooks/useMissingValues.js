import * as React from 'react';
import { toPathOptions } from "../utils/treeUtil";
export default function useMissingValues(options, fieldNames) {
  return React.useCallback(rawValues => {
    const missingValues = [];
    const existsValues = [];
    rawValues.forEach(valueCell => {
      const pathOptions = toPathOptions(valueCell, options, fieldNames);
      if (pathOptions.every(opt => opt.option)) {
        existsValues.push(valueCell);
      } else {
        missingValues.push(valueCell);
      }
    });
    return [existsValues, missingValues];
  }, [options, fieldNames]);
}