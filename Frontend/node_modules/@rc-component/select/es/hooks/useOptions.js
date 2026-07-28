import * as React from 'react';
import { convertChildrenToData } from "../utils/legacyUtil";

/**
 * Parse `children` to `options` if `options` is not provided.
 * Then flatten the `options`.
 */
const useOptions = (options, children, fieldNames, optionFilterProp, optionLabelProp) => {
  return React.useMemo(() => {
    let mergedOptions = options;
    const childrenAsData = !options;
    if (childrenAsData) {
      mergedOptions = convertChildrenToData(children);
    }
    const valueOptions = new Map();
    const labelOptions = new Map();
    const setLabelOptions = (labelOptionsMap, option, key) => {
      if (key && typeof key === 'string') {
        labelOptionsMap.set(option[key], option);
      }
    };
    const dig = (optionList, isChildren = false) => {
      // for loop to speed up collection speed
      for (let i = 0; i < optionList.length; i += 1) {
        const option = optionList[i];
        if (!option[fieldNames.options] || isChildren) {
          valueOptions.set(option[fieldNames.value], option);
          setLabelOptions(labelOptions, option, fieldNames.label);
          // https://github.com/ant-design/ant-design/issues/35304
          optionFilterProp.forEach(prop => {
            setLabelOptions(labelOptions, option, prop);
          });
          setLabelOptions(labelOptions, option, optionLabelProp);
        } else {
          dig(option[fieldNames.options], true);
        }
      }
    };
    dig(mergedOptions);
    return {
      options: mergedOptions,
      valueOptions,
      labelOptions
    };
  }, [options, children, fieldNames, optionFilterProp, optionLabelProp]);
};
export default useOptions;