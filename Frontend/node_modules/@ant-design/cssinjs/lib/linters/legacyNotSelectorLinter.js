"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _utils = require("./utils");
function isConcatSelector(selector) {
  const notContent = selector.match(/:not\(([^)]*)\)/)?.[1] || '';

  // split selector. e.g.
  // `h1#a.b` => ['h1', #a', '.b']
  const splitCells = notContent.split(/(\[[^[]*])|(?=[.#])/).filter(str => str);
  return splitCells.length > 1;
}
function parsePath(info) {
  return info.parentSelectors.reduce((prev, cur) => {
    if (!prev) {
      return cur;
    }
    return cur.includes('&') ? cur.replace(/&/g, prev) : `${prev} ${cur}`;
  }, '');
}
const linter = (key, value, info) => {
  const parentSelectorPath = parsePath(info);
  const notList = parentSelectorPath.match(/:not\([^)]*\)/g) || [];
  if (notList.length > 0 && notList.some(isConcatSelector)) {
    (0, _utils.lintWarning)(`Concat ':not' selector not support in legacy browsers.`, info);
  }
};
var _default = exports.default = linter;