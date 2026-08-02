"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.toArray = exports.isNil = exports.isCheckDisabled = exports.getAllKeys = exports.fillFieldNames = void 0;
const toArray = value => Array.isArray(value) ? value : value !== undefined ? [value] : [];
exports.toArray = toArray;
const fillFieldNames = fieldNames => {
  const {
    label,
    value,
    children
  } = fieldNames || {};
  return {
    _title: label ? [label] : ['title', 'label'],
    value: value || 'value',
    key: value || 'value',
    children: children || 'children'
  };
};
exports.fillFieldNames = fillFieldNames;
const isCheckDisabled = node => !node || node.disabled || node.disableCheckbox || node.checkable === false;
exports.isCheckDisabled = isCheckDisabled;
const getAllKeys = (treeData, fieldNames) => {
  const keys = [];
  const dig = list => {
    list.forEach(item => {
      const children = item[fieldNames.children];
      if (children) {
        keys.push(item[fieldNames.value]);
        dig(children);
      }
    });
  };
  dig(treeData);
  return keys;
};
exports.getAllKeys = getAllKeys;
const isNil = val => val === null || val === undefined;
exports.isNil = isNil;