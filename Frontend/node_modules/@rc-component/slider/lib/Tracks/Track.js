"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _clsx = require("clsx");
var React = _interopRequireWildcard(require("react"));
var _context = _interopRequireDefault(require("../context"));
var _util = require("../util");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const Track = props => {
  const {
    prefixCls,
    style,
    start,
    end,
    index,
    onStartMove,
    replaceCls
  } = props;
  const {
    direction,
    min,
    max,
    disabled,
    range,
    classNames
  } = React.useContext(_context.default);
  const trackPrefixCls = `${prefixCls}-track`;
  const offsetStart = (0, _util.getOffset)(start, min, max);
  const offsetEnd = (0, _util.getOffset)(end, min, max);

  // ============================ Events ============================
  const onInternalStartMove = e => {
    if (!disabled && onStartMove) {
      onStartMove(e, -1);
    }
  };

  // ============================ Render ============================
  const positionStyle = {};
  switch (direction) {
    case 'rtl':
      positionStyle.right = `${offsetStart * 100}%`;
      positionStyle.width = `${offsetEnd * 100 - offsetStart * 100}%`;
      break;
    case 'btt':
      positionStyle.bottom = `${offsetStart * 100}%`;
      positionStyle.height = `${offsetEnd * 100 - offsetStart * 100}%`;
      break;
    case 'ttb':
      positionStyle.top = `${offsetStart * 100}%`;
      positionStyle.height = `${offsetEnd * 100 - offsetStart * 100}%`;
      break;
    default:
      positionStyle.left = `${offsetStart * 100}%`;
      positionStyle.width = `${offsetEnd * 100 - offsetStart * 100}%`;
  }
  const className = replaceCls || (0, _clsx.clsx)(trackPrefixCls, {
    [`${trackPrefixCls}-${index + 1}`]: index !== null && range,
    [`${prefixCls}-track-draggable`]: onStartMove
  }, classNames.track);
  return /*#__PURE__*/React.createElement("div", {
    className: className,
    style: {
      ...positionStyle,
      ...style
    },
    onMouseDown: onInternalStartMove,
    onTouchStart: onInternalStartMove
  });
};
var _default = exports.default = Track;