"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SHOW_PARENT = exports.SHOW_CHILD = exports.SHOW_ALL = void 0;
exports.formatStrategyValues = formatStrategyValues;
var _valueUtil = require("./valueUtil");
const SHOW_ALL = exports.SHOW_ALL = 'SHOW_ALL';
const SHOW_PARENT = exports.SHOW_PARENT = 'SHOW_PARENT';
const SHOW_CHILD = exports.SHOW_CHILD = 'SHOW_CHILD';
function formatStrategyValues(values, strategy, keyEntities, fieldNames) {
  const valueSet = new Set(values);
  if (strategy === SHOW_CHILD) {
    return values.filter(key => {
      const entity = keyEntities[key];
      return !entity || !entity.children || !entity.children.some(({
        node
      }) => valueSet.has(node[fieldNames.value])) || !entity.children.every(({
        node
      }) => (0, _valueUtil.isCheckDisabled)(node) || valueSet.has(node[fieldNames.value]));
    });
  }
  if (strategy === SHOW_PARENT) {
    return values.filter(key => {
      const entity = keyEntities[key];
      const parent = entity ? entity.parent : null;
      return !parent || (0, _valueUtil.isCheckDisabled)(parent.node) || !valueSet.has(parent.key);
    });
  }
  return values;
}