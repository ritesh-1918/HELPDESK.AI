import * as React from 'react';
import { convertDataToEntities } from "@rc-component/tree/es/utils/treeUtil";
import warning from "@rc-component/util/es/warning";
import { isNil } from "../utils/valueUtil";
export default ((treeData, fieldNames) => React.useMemo(() => {
  const collection = convertDataToEntities(treeData, {
    fieldNames,
    initWrapper: wrapper => ({
      ...wrapper,
      valueEntities: new Map()
    }),
    processEntity: (entity, wrapper) => {
      const val = entity.node[fieldNames.value];

      // Check if exist same value
      if (process.env.NODE_ENV !== 'production') {
        const key = entity.node.key;
        warning(!isNil(val), 'TreeNode `value` is invalidate: undefined');
        warning(!wrapper.valueEntities.has(val), `Same \`value\` exist in the tree: ${val}`);
        warning(!key || String(key) === String(val), `\`key\` or \`value\` with TreeNode must be the same or you can remove one of them. key: ${key}, value: ${val}.`);
      }
      wrapper.valueEntities.set(val, entity);
    }
  });
  return collection;
}, [treeData, fieldNames]));