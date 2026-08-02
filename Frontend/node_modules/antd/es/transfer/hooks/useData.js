import * as React from 'react';
import { groupKeysMap } from '../../_util/transKeys';
const useData = (dataSource, rowKey, targetKeys) => {
  const mergedDataSource = React.useMemo(() => (dataSource || []).map(record => {
    if (rowKey) {
      return {
        ...record,
        key: rowKey(record)
      };
    }
    return record;
  }), [dataSource, rowKey]);
  const [leftDataSource, rightDataSource] = React.useMemo(() => {
    const leftData = [];
    const rightData = Array.from({
      length: targetKeys?.length ?? 0
    });
    const targetKeysMap = groupKeysMap(targetKeys || []);
    mergedDataSource.forEach(record => {
      // rightData should be ordered by targetKeys
      // leftData should be ordered by dataSource
      if (targetKeysMap.has(record.key)) {
        const idx = targetKeysMap.get(record.key);
        rightData[idx] = record;
      } else {
        leftData.push(record);
      }
    });
    return [leftData, rightData];
  }, [mergedDataSource, targetKeys]);
  return [mergedDataSource, leftDataSource.filter(Boolean), rightDataSource.filter(Boolean)];
};
export default useData;