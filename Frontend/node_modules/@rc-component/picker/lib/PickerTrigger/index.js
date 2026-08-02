"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _trigger = _interopRequireDefault(require("@rc-component/trigger"));
var _clsx2 = require("clsx");
var React = _interopRequireWildcard(require("react"));
var _uiUtil = require("../utils/uiUtil");
var _context = _interopRequireDefault(require("../PickerInput/context"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : String(i); }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var BUILT_IN_PLACEMENTS = {
  bottomLeft: {
    points: ['tl', 'bl'],
    offset: [0, 4],
    overflow: {
      adjustX: 1,
      adjustY: 1
    }
  },
  bottomRight: {
    points: ['tr', 'br'],
    offset: [0, 4],
    overflow: {
      adjustX: 1,
      adjustY: 1
    }
  },
  topLeft: {
    points: ['bl', 'tl'],
    offset: [0, -4],
    overflow: {
      adjustX: 0,
      adjustY: 1
    }
  },
  topRight: {
    points: ['br', 'tr'],
    offset: [0, -4],
    overflow: {
      adjustX: 0,
      adjustY: 1
    }
  }
};
function PickerTrigger(_ref) {
  var popupElement = _ref.popupElement,
    popupStyle = _ref.popupStyle,
    popupClassName = _ref.popupClassName,
    popupAlign = _ref.popupAlign,
    transitionName = _ref.transitionName,
    getPopupContainer = _ref.getPopupContainer,
    children = _ref.children,
    range = _ref.range,
    placement = _ref.placement,
    _ref$builtinPlacement = _ref.builtinPlacements,
    builtinPlacements = _ref$builtinPlacement === void 0 ? BUILT_IN_PLACEMENTS : _ref$builtinPlacement,
    direction = _ref.direction,
    visible = _ref.visible,
    onClose = _ref.onClose;
  var _React$useContext = React.useContext(_context.default),
    prefixCls = _React$useContext.prefixCls;
  var dropdownPrefixCls = "".concat(prefixCls, "-dropdown");
  var realPlacement = (0, _uiUtil.getRealPlacement)(placement, direction === 'rtl');
  return /*#__PURE__*/React.createElement(_trigger.default, {
    showAction: [],
    hideAction: ['click'],
    popupPlacement: realPlacement,
    builtinPlacements: builtinPlacements,
    prefixCls: dropdownPrefixCls,
    popupMotion: {
      motionName: transitionName
    },
    popup: popupElement,
    popupAlign: popupAlign,
    popupVisible: visible,
    popupClassName: (0, _clsx2.clsx)(popupClassName, _defineProperty(_defineProperty({}, "".concat(dropdownPrefixCls, "-range"), range), "".concat(dropdownPrefixCls, "-rtl"), direction === 'rtl')),
    popupStyle: popupStyle,
    stretch: "minWidth",
    getPopupContainer: getPopupContainer,
    onPopupVisibleChange: function onPopupVisibleChange(nextVisible) {
      if (!nextVisible) {
        onClose();
      }
    }
  }, children);
}
var _default = exports.default = PickerTrigger;