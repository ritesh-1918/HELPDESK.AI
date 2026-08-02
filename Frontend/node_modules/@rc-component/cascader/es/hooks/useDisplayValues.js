import { toPathOptions } from "../utils/treeUtil";
import * as React from 'react';
import { toPathKey } from "../utils/commonUtil";
export default ((rawValues, options, fieldNames, multiple, displayRender) => {
  return React.useMemo(() => {
    const mergedDisplayRender = displayRender || (
    // Default displayRender
    labels => {
      const mergedLabels = multiple ? labels.slice(-1) : labels;
      const SPLIT = ' / ';
      if (mergedLabels.every(label => ['string', 'number'].includes(typeof label))) {
        return mergedLabels.join(SPLIT);
      }

      // If exist non-string value, use ReactNode instead
      return mergedLabels.reduce((list, label, index) => {
        const keyedLabel = /*#__PURE__*/React.isValidElement(label) ? /*#__PURE__*/React.cloneElement(label, {
          key: index
        }) : label;
        if (index === 0) {
          return [keyedLabel];
        }
        return [...list, SPLIT, keyedLabel];
      }, []);
    });
    return rawValues.map(valueCells => {
      const valueOptions = toPathOptions(valueCells, options, fieldNames);
      const label = mergedDisplayRender(valueOptions.map(({
        option,
        value
      }) => option?.[fieldNames.label] ?? value), valueOptions.map(({
        option
      }) => option));
      const value = toPathKey(valueCells);
      return {
        label,
        value,
        key: value,
        valueCells,
        disabled: valueOptions[valueOptions.length - 1]?.option?.disabled
      };
    });
  }, [rawValues, options, fieldNames, displayRender, multiple]);
});