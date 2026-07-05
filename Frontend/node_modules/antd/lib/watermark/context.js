"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
exports.usePanelRef = usePanelRef;
var React = _interopRequireWildcard(require("react"));
var _util = require("@rc-component/util");
function voidFunc() {}
const WatermarkContext = /*#__PURE__*/React.createContext({
  add: voidFunc,
  remove: voidFunc
});
function usePanelRef(panelSelector) {
  const watermark = React.useContext(WatermarkContext);
  const panelEleRef = React.useRef(null);
  const panelRef = (0, _util.useEvent)(ele => {
    if (ele) {
      const innerContentEle = panelSelector ? ele.querySelector(panelSelector) : ele;
      if (innerContentEle) {
        watermark.add(innerContentEle);
        panelEleRef.current = innerContentEle;
      }
    } else {
      watermark.remove(panelEleRef.current);
    }
  });
  return panelRef;
}
var _default = exports.default = WatermarkContext;