"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _trigger = _interopRequireDefault(require("@rc-component/trigger"));
var _react = _interopRequireWildcard(require("react"));
var React = _react;
var _DropdownMenu = _interopRequireDefault(require("./DropdownMenu"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const BUILT_IN_PLACEMENTS = {
  bottomRight: {
    points: ['tl', 'br'],
    offset: [0, 4],
    overflow: {
      adjustX: 1,
      adjustY: 1
    }
  },
  bottomLeft: {
    points: ['tr', 'bl'],
    offset: [0, 4],
    overflow: {
      adjustX: 1,
      adjustY: 1
    }
  },
  topRight: {
    points: ['bl', 'tr'],
    offset: [0, -4],
    overflow: {
      adjustX: 1,
      adjustY: 1
    }
  },
  topLeft: {
    points: ['br', 'tl'],
    offset: [0, -4],
    overflow: {
      adjustX: 1,
      adjustY: 1
    }
  }
};
const KeywordTrigger = props => {
  const {
    prefixCls,
    options,
    children,
    visible,
    transitionName,
    getPopupContainer,
    popupClassName,
    popupStyle,
    direction,
    placement
  } = props;
  const dropdownPrefix = `${prefixCls}-dropdown`;
  const [opened, setOpened] = React.useState(false);
  const dropdownElement = /*#__PURE__*/React.createElement(_DropdownMenu.default, {
    prefixCls: dropdownPrefix,
    options: options,
    opened: opened
  });
  const dropdownPlacement = (0, _react.useMemo)(() => {
    let popupPlacement;
    if (direction === 'rtl') {
      popupPlacement = placement === 'top' ? 'topLeft' : 'bottomLeft';
    } else {
      popupPlacement = placement === 'top' ? 'topRight' : 'bottomRight';
    }
    return popupPlacement;
  }, [direction, placement]);
  return /*#__PURE__*/React.createElement(_trigger.default, {
    prefixCls: dropdownPrefix,
    popupVisible: visible,
    popup: dropdownElement,
    popupPlacement: dropdownPlacement,
    popupMotion: {
      motionName: transitionName
    },
    builtinPlacements: BUILT_IN_PLACEMENTS,
    getPopupContainer: getPopupContainer,
    popupClassName: popupClassName,
    popupStyle: popupStyle,
    afterOpenChange: setOpened
  }, children);
};
var _default = exports.default = KeywordTrigger;