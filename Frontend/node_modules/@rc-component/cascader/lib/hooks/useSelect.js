"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useSelect;
var _conductUtil = require("@rc-component/tree/lib/utils/conductUtil");
var _commonUtil = require("../utils/commonUtil");
var _treeUtil = require("../utils/treeUtil");
function useSelect(multiple, triggerChange, checkedValues, halfCheckedValues, missingCheckedValues, getPathKeyEntities, getValueByKeyPath, showCheckedStrategy) {
  return valuePath => {
    if (!multiple) {
      triggerChange(valuePath);
    } else {
      // Prepare conduct required info
      const pathKey = (0, _commonUtil.toPathKey)(valuePath);
      const checkedPathKeys = (0, _commonUtil.toPathKeys)(checkedValues);
      const halfCheckedPathKeys = (0, _commonUtil.toPathKeys)(halfCheckedValues);
      const existInChecked = checkedPathKeys.includes(pathKey);
      const existInMissing = missingCheckedValues.some(valueCells => (0, _commonUtil.toPathKey)(valueCells) === pathKey);

      // Do update
      let nextCheckedValues = checkedValues;
      let nextMissingValues = missingCheckedValues;
      if (existInMissing && !existInChecked) {
        // Missing value only do filter
        nextMissingValues = missingCheckedValues.filter(valueCells => (0, _commonUtil.toPathKey)(valueCells) !== pathKey);
      } else {
        // Update checked key first
        const nextRawCheckedKeys = existInChecked ? checkedPathKeys.filter(key => key !== pathKey) : [...checkedPathKeys, pathKey];
        const pathKeyEntities = getPathKeyEntities();

        // Conduction by selected or not
        let checkedKeys;
        if (existInChecked) {
          ({
            checkedKeys
          } = (0, _conductUtil.conductCheck)(nextRawCheckedKeys, {
            checked: false,
            halfCheckedKeys: halfCheckedPathKeys
          }, pathKeyEntities));
        } else {
          ({
            checkedKeys
          } = (0, _conductUtil.conductCheck)(nextRawCheckedKeys, true, pathKeyEntities));
        }

        // Roll up to parent level keys
        const deDuplicatedKeys = (0, _treeUtil.formatStrategyValues)(checkedKeys, getPathKeyEntities, showCheckedStrategy);
        nextCheckedValues = getValueByKeyPath(deDuplicatedKeys);
      }
      triggerChange([...nextMissingValues, ...nextCheckedValues]);
    }
  };
}