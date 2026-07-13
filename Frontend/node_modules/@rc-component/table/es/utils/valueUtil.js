const INTERNAL_KEY_PREFIX = 'RC_TABLE_KEY';
function toArray(arr) {
  if (arr === undefined || arr === null) {
    return [];
  }
  return Array.isArray(arr) ? arr : [arr];
}
export function getColumnsKey(columns) {
  const columnKeys = [];
  const keys = {};
  columns.forEach(column => {
    const {
      key,
      dataIndex
    } = column || {};
    let mergedKey = key || toArray(dataIndex).join('-') || INTERNAL_KEY_PREFIX;
    while (keys[mergedKey]) {
      mergedKey = `${mergedKey}_next`;
    }
    keys[mergedKey] = true;
    columnKeys.push(mergedKey);
  });
  return columnKeys;
}
export function validateValue(val) {
  return val !== null && val !== undefined;
}
export function validNumberValue(value) {
  return typeof value === 'number' && !Number.isNaN(value);
}