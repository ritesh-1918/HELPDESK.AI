"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useTransitionDuration = exports.defaultProps = void 0;
var _react = require("react");
const defaultProps = exports.defaultProps = {
  percent: 0,
  prefixCls: 'rc-progress',
  strokeColor: '#2db7f5',
  strokeLinecap: 'round',
  strokeWidth: 1,
  railColor: '#D9D9D9',
  railWidth: 1,
  gapPosition: 'bottom',
  loading: false
};
const useTransitionDuration = () => {
  const pathsRef = (0, _react.useRef)([]);
  const prevTimeStamp = (0, _react.useRef)(null);
  (0, _react.useEffect)(() => {
    const now = Date.now();
    let updated = false;
    pathsRef.current.forEach(path => {
      if (!path) {
        return;
      }
      updated = true;
      const pathStyle = path.style;
      pathStyle.transitionDuration = '.3s, .3s, .3s, .06s';
      if (prevTimeStamp.current && now - prevTimeStamp.current < 100) {
        pathStyle.transitionDuration = '0s, 0s';
      }
    });
    if (updated) {
      prevTimeStamp.current = Date.now();
    }
  });
  return pathsRef.current;
};
exports.useTransitionDuration = useTransitionDuration;