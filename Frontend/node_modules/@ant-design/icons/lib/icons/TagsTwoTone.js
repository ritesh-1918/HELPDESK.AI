"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _TagsTwoTone = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/TagsTwoTone"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const TagsTwoTone = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _TagsTwoTone.default
}));

/**![tags](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTQ3Ny41IDY5NGwzMTEuOS0zMTEuOC0xOS0yMjQuNi0yMjQuNi0xOS0zMTEuOSAzMTEuOUw0NzcuNSA2OTR6bTExNi00MTUuNWE0Ny44MSA0Ny44MSAwIDAxMzMuOS0zMy45YzE2LjYtNC40IDM0LjIuMyA0Ni40IDEyLjRhNDcuOTMgNDcuOTMgMCAwMTEyLjQgNDYuNCA0Ny44MSA0Ny44MSAwIDAxLTMzLjkgMzMuOWMtMTYuNiA0LjQtMzQuMi0uMy00Ni40LTEyLjRhNDguMyA0OC4zIDAgMDEtMTIuNC00Ni40eiIgZmlsbD0iI2U2ZjRmZiIgLz48cGF0aCBkPSJNNDc2LjYgNzkyLjZjLTEuNy0uMi0zLjQtMS00LjctMi4zTDEzNy43IDQ1Ni4xYTguMDMgOC4wMyAwIDAxMC0xMS4zTDUxNS45IDY2LjZjMS4yLTEuMyAyLjktMi4xIDQuNy0yLjNoLS40Yy0yLjMtLjItNC43LjYtNi4zIDIuM0wxMzUuNyA0NDQuOGE4LjAzIDguMDMgMCAwMDAgMTEuM2wzMzQuMiAzMzQuMmMxLjggMS45IDQuMyAyLjYgNi43IDIuM3oiIGZpbGw9IiNlNmY0ZmYiIC8+PHBhdGggZD0iTTg4OS43IDUzOS44bC0zOS42LTM5LjVhOC4wMyA4LjAzIDAgMDAtMTEuMyAwbC0zNjIgMzYxLjMtMjM3LjYtMjM3YTguMDMgOC4wMyAwIDAwLTExLjMgMGwtMzkuNiAzOS41YTguMDMgOC4wMyAwIDAwMCAxMS4zbDI0My4yIDI0Mi44IDM5LjYgMzkuNWMzLjEgMy4xIDguMiAzLjEgMTEuMyAwbDQwNy4zLTQwNi42YzMuMS0zLjEgMy4xLTguMiAwLTExLjN6TTY1Mi4zIDMzNy4zYTQ3LjgxIDQ3LjgxIDAgMDAzMy45LTMzLjljNC40LTE2LjYtLjMtMzQuMi0xMi40LTQ2LjRhNDcuOTMgNDcuOTMgMCAwMC00Ni40LTEyLjQgNDcuODEgNDcuODEgMCAwMC0zMy45IDMzLjljLTQuNCAxNi42LjMgMzQuMiAxMi40IDQ2LjRhNDguMyA0OC4zIDAgMDA0Ni40IDEyLjR6IiBmaWxsPSIjMTY3N2ZmIiAvPjxwYXRoIGQ9Ik0xMzcuNyA0NDQuOGE4LjAzIDguMDMgMCAwMDAgMTEuM2wzMzQuMiAzMzQuMmMxLjMgMS4zIDIuOSAyLjEgNC43IDIuMyAyLjQuMyA0LjgtLjUgNi42LTIuM0w4NjEuNCA0MTJjMS43LTEuNyAyLjUtNCAyLjMtNi4zbC0yNS41LTMwMS40Yy0uNy03LjgtNi44LTEzLjktMTQuNi0xNC42TDUyMi4yIDY0LjNoLTEuNmMtMS44LjItMy40IDEtNC43IDIuM0wxMzcuNyA0NDQuOHptNDA4LjEtMzA2LjJsMjI0LjYgMTkgMTkgMjI0LjZMNDc3LjUgNjk0IDIzMy45IDQ1MC41bDMxMS45LTMxMS45eiIgZmlsbD0iIzE2NzdmZiIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(TagsTwoTone);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'TagsTwoTone';
}
var _default = exports.default = RefIcon;