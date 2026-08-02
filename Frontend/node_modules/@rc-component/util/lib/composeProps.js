"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
function composeProps(originProps, patchProps, isAll) {
  const composedProps = {
    ...originProps,
    ...(isAll ? patchProps : {})
  };
  Object.keys(patchProps).forEach(key => {
    const func = patchProps[key];
    if (typeof func === 'function') {
      composedProps[key] = (...args) => {
        func(...args);
        return originProps[key]?.(...args);
      };
    }
  });
  return composedProps;
}
var _default = exports.default = composeProps;