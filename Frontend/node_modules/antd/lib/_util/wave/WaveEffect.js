"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _motion = _interopRequireDefault(require("@rc-component/motion"));
var _raf = _interopRequireDefault(require("@rc-component/util/lib/raf"));
var _render = require("@rc-component/util/lib/React/render");
var _ref = require("@rc-component/util/lib/ref");
var _clsx = require("clsx");
var _configProvider = require("../../config-provider");
var _genStyleUtils = require("../../theme/util/genStyleUtils");
var _interface = require("./interface");
var _util = require("./util");
function validateNum(value) {
  return Number.isNaN(value) ? 0 : value;
}
const WaveEffect = props => {
  const {
    className,
    target,
    component,
    colorSource
  } = props;
  const divRef = React.useRef(null);
  const {
    getPrefixCls
  } = React.useContext(_configProvider.ConfigContext);
  const rootPrefixCls = getPrefixCls();
  const [varName] = (0, _genStyleUtils.genCssVar)(rootPrefixCls, 'wave');
  // ===================== Effect =====================
  const [color, setWaveColor] = React.useState(null);
  const [borderRadius, setBorderRadius] = React.useState([]);
  const [left, setLeft] = React.useState(0);
  const [top, setTop] = React.useState(0);
  const [width, setWidth] = React.useState(0);
  const [height, setHeight] = React.useState(0);
  const [enabled, setEnabled] = React.useState(false);
  const waveStyle = {
    left,
    top,
    width,
    height,
    borderRadius: borderRadius.map(radius => `${radius}px`).join(' ')
  };
  if (color) {
    waveStyle[varName('color')] = color;
  }
  function syncPos() {
    const nodeStyle = getComputedStyle(target);
    // Get wave color from target
    setWaveColor((0, _util.getTargetWaveColor)(target, colorSource));
    const isStatic = nodeStyle.position === 'static';
    // Rect
    const {
      borderLeftWidth,
      borderTopWidth
    } = nodeStyle;
    setLeft(isStatic ? target.offsetLeft : validateNum(-Number.parseFloat(borderLeftWidth)));
    setTop(isStatic ? target.offsetTop : validateNum(-Number.parseFloat(borderTopWidth)));
    setWidth(target.offsetWidth);
    setHeight(target.offsetHeight);
    // Get border radius
    const {
      borderTopLeftRadius,
      borderTopRightRadius,
      borderBottomLeftRadius,
      borderBottomRightRadius
    } = nodeStyle;
    setBorderRadius([borderTopLeftRadius, borderTopRightRadius, borderBottomRightRadius, borderBottomLeftRadius].map(radius => validateNum(Number.parseFloat(radius))));
  }
  React.useEffect(() => {
    if (target) {
      // We need delay to check position here
      // since UI may change after click
      const id = (0, _raf.default)(() => {
        syncPos();
        setEnabled(true);
      });
      // Add resize observer to follow size
      let resizeObserver;
      if (typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(syncPos);
        resizeObserver.observe(target);
      }
      return () => {
        _raf.default.cancel(id);
        resizeObserver?.disconnect();
      };
    }
  }, [target]);
  if (!enabled) {
    return null;
  }
  const isSmallComponent = (component === 'Checkbox' || component === 'Radio') && target?.classList.contains(_interface.TARGET_CLS);
  return /*#__PURE__*/React.createElement(_motion.default, {
    visible: true,
    motionAppear: true,
    motionName: "wave-motion",
    motionDeadline: 5000,
    onAppearEnd: (_, event) => {
      if (event.deadline || event.propertyName === 'opacity') {
        const holder = divRef.current?.parentElement;
        (0, _render.unmount)(holder).then(() => {
          holder?.remove();
        });
      }
      return false;
    }
  }, ({
    className: motionClassName
  }, ref) => (/*#__PURE__*/React.createElement("div", {
    ref: (0, _ref.composeRef)(divRef, ref),
    className: (0, _clsx.clsx)(className, motionClassName, {
      'wave-quick': isSmallComponent
    }),
    style: waveStyle
  })));
};
const showWaveEffect = (target, info) => {
  const {
    component
  } = info;
  // Skip for unchecked checkbox
  if (component === 'Checkbox' && !target.querySelector('input')?.checked) {
    return;
  }
  // Create holder
  const holder = document.createElement('div');
  holder.style.position = 'absolute';
  holder.style.left = '0px';
  holder.style.top = '0px';
  target?.insertBefore(holder, target?.firstChild);
  (0, _render.render)(/*#__PURE__*/React.createElement(WaveEffect, {
    ...info,
    target: target
  }), holder);
};
var _default = exports.default = showWaveEffect;