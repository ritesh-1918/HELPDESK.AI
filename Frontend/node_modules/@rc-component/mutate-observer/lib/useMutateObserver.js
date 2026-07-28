"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _canUseDom = _interopRequireDefault(require("@rc-component/util/lib/Dom/canUseDom"));
var _react = _interopRequireDefault(require("react"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const defaultOptions = {
  subtree: true,
  childList: true,
  attributeFilter: ['style', 'class']
};
const useMutateObserver = (nodeOrList, callback, options = defaultOptions) => {
  _react.default.useEffect(() => {
    if (!(0, _canUseDom.default)() || !nodeOrList) {
      return;
    }
    let instance;
    const nodeList = Array.isArray(nodeOrList) ? nodeOrList : [nodeOrList];
    if ('MutationObserver' in window) {
      instance = new MutationObserver(callback);
      nodeList.forEach(element => {
        instance.observe(element, options);
      });
    }
    return () => {
      instance?.takeRecords();
      instance?.disconnect();
    };
  }, [options, nodeOrList]);
};
var _default = exports.default = useMutateObserver;