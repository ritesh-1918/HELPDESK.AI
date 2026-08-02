import * as React from 'react';
import { conductCheck } from "@rc-component/tree/es/utils/conductUtil";
const useCheckedKeys = (rawLabeledValues, rawHalfCheckedValues, treeConduction, keyEntities) => {
  return React.useMemo(() => {
    const extractValues = values => values.map(({
      value
    }) => value);
    const checkedKeys = extractValues(rawLabeledValues);
    const halfCheckedKeys = extractValues(rawHalfCheckedValues);
    const missingValues = checkedKeys.filter(key => !keyEntities[key]);
    let finalCheckedKeys = checkedKeys;
    let finalHalfCheckedKeys = halfCheckedKeys;
    if (treeConduction) {
      const conductResult = conductCheck(checkedKeys, true, keyEntities);
      finalCheckedKeys = conductResult.checkedKeys;
      finalHalfCheckedKeys = conductResult.halfCheckedKeys;
    }
    return [Array.from(new Set([...missingValues, ...finalCheckedKeys])), finalHalfCheckedKeys];
  }, [rawLabeledValues, rawHalfCheckedValues, treeConduction, keyEntities]);
};
export default useCheckedKeys;