export const toArray = value => Array.isArray(value) ? value : value !== undefined ? [value] : [];
export const fillFieldNames = fieldNames => {
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
export const isCheckDisabled = node => !node || node.disabled || node.disableCheckbox || node.checkable === false;
export const getAllKeys = (treeData, fieldNames) => {
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
export const isNil = val => val === null || val === undefined;