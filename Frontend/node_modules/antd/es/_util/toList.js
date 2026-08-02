import isNonNullable from './isNonNullable';
const toList = (candidate, skipEmpty = false) => {
  if (skipEmpty && !isNonNullable(candidate)) {
    return [];
  }
  return Array.isArray(candidate) ? candidate : [candidate];
};
export default toList;