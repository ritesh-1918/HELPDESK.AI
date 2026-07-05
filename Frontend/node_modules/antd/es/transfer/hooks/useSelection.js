import _toConsumableArray from "@babel/runtime/helpers/esm/toConsumableArray";
import * as React from 'react';
import { useControlledState, useEvent } from '@rc-component/util';
const EMPTY_KEYS = [];
function filterKeys(keys, dataKeys) {
  const filteredKeys = keys.filter(key => dataKeys.has(key));
  return keys.length === filteredKeys.length ? keys : filteredKeys;
}
function flattenKeys(keys) {
  return Array.from(keys).join(';');
}
function useSelection(leftDataSource, rightDataSource, selectedKeys) {
  // Prepare `dataSource` keys
  const [leftKeys, rightKeys] = React.useMemo(() => [new Set(leftDataSource.map(src => src?.key)), new Set(rightDataSource.map(src => src?.key))], [leftDataSource, rightDataSource]);
  // Selected Keys
  const [mergedSelectedKeys, setMergedSelectedKeys] = useControlledState(EMPTY_KEYS, selectedKeys);
  const sourceSelectedKeys = React.useMemo(() => filterKeys(mergedSelectedKeys, leftKeys), [mergedSelectedKeys, leftKeys]);
  const targetSelectedKeys = React.useMemo(() => filterKeys(mergedSelectedKeys, rightKeys), [mergedSelectedKeys, rightKeys]);
  // // Reset when data changed
  React.useEffect(() => {
    setMergedSelectedKeys([].concat(_toConsumableArray(filterKeys(mergedSelectedKeys, leftKeys)), _toConsumableArray(filterKeys(mergedSelectedKeys, rightKeys))));
  }, [flattenKeys(leftKeys), flattenKeys(rightKeys)]);
  // Update keys
  const setSourceSelectedKeys = useEvent(nextSrcKeys => {
    setMergedSelectedKeys([].concat(_toConsumableArray(nextSrcKeys), _toConsumableArray(targetSelectedKeys)));
  });
  const setTargetSelectedKeys = useEvent(nextTargetKeys => {
    setMergedSelectedKeys([].concat(_toConsumableArray(sourceSelectedKeys), _toConsumableArray(nextTargetKeys)));
  });
  return [
  // Keys
  sourceSelectedKeys, targetSelectedKeys,
  // Updater
  setSourceSelectedKeys, setTargetSelectedKeys];
}
export default useSelection;