import * as React from 'react';
import { convertDataToEntities } from "@rc-component/tree/es/utils/treeUtil";
import { VALUE_SPLIT } from "../utils/commonUtil";
/** Lazy parse options data into conduct-able info to avoid perf issue in single mode */
export default ((options, fieldNames) => {
  const cacheRef = React.useRef({
    options: [],
    info: {
      keyEntities: {},
      pathKeyEntities: {}
    }
  });
  const getEntities = React.useCallback(() => {
    if (cacheRef.current.options !== options) {
      cacheRef.current.options = options;
      cacheRef.current.info = convertDataToEntities(options, {
        fieldNames: fieldNames,
        initWrapper: wrapper => ({
          ...wrapper,
          pathKeyEntities: {}
        }),
        processEntity: (entity, wrapper) => {
          const pathKey = entity.nodes.map(node => node[fieldNames.value]).join(VALUE_SPLIT);
          wrapper.pathKeyEntities[pathKey] = entity;

          // Overwrite origin key.
          // this is very hack but we need let conduct logic work with connect path
          entity.key = pathKey;
        }
      });
    }
    return cacheRef.current.info.pathKeyEntities;
  }, [fieldNames, options]);
  return getEntities;
});