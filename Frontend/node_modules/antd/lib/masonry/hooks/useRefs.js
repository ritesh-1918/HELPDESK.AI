"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useRefs;
var React = _interopRequireWildcard(require("react"));
function useRefs() {
  const refs = React.useRef(null);
  if (refs.current === null) {
    refs.current = new Map();
  }
  const setRef = (key, element) => {
    refs.current.set(key, element);
  };
  const getRef = key => refs.current.get(key);
  return [setRef, getRef];
}