import { conductCheck } from "@rc-component/tree/es/utils/conductUtil";
import * as React from 'react';
import { toPathKeys } from "../utils/commonUtil";
export default function useValues(multiple, rawValues, getPathKeyEntities, getValueByKeyPath, getMissingValues) {
  // Fill `rawValues` with checked conduction values
  return React.useMemo(() => {
    const [existValues, missingValues] = getMissingValues(rawValues);
    if (!multiple || !rawValues.length) {
      return [existValues, [], missingValues];
    }
    const keyPathValues = toPathKeys(existValues);
    const keyPathEntities = getPathKeyEntities();
    const {
      checkedKeys,
      halfCheckedKeys
    } = conductCheck(keyPathValues, true, keyPathEntities);

    // Convert key back to value cells
    return [getValueByKeyPath(checkedKeys), getValueByKeyPath(halfCheckedKeys), missingValues];
  }, [multiple, rawValues, getPathKeyEntities, getValueByKeyPath, getMissingValues]);
}