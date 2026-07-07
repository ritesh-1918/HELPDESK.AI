"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = TimeColumn;
var _clsx2 = require("clsx");
var _useLayoutEffect = _interopRequireDefault(require("@rc-component/util/lib/hooks/useLayoutEffect"));
var React = _interopRequireWildcard(require("react"));
var _context = require("../../context");
var _useScrollTo3 = _interopRequireDefault(require("./useScrollTo"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : String(i); }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
var SCROLL_DELAY = 300;
// Not use JSON.stringify to avoid dead loop
function flattenUnits(units) {
  return units.map(function (_ref) {
    var value = _ref.value,
      label = _ref.label,
      disabled = _ref.disabled;
    return [value, label, disabled].join(',');
  }).join(';');
}
function TimeColumn(props) {
  var units = props.units,
    value = props.value,
    optionalValue = props.optionalValue,
    type = props.type,
    onChange = props.onChange,
    onHover = props.onHover,
    onDblClick = props.onDblClick,
    changeOnScroll = props.changeOnScroll;
  var _usePanelContext = (0, _context.usePanelContext)(),
    prefixCls = _usePanelContext.prefixCls,
    cellRender = _usePanelContext.cellRender,
    now = _usePanelContext.now,
    locale = _usePanelContext.locale,
    classNames = _usePanelContext.classNames,
    styles = _usePanelContext.styles;
  var panelPrefixCls = "".concat(prefixCls, "-time-panel");
  var cellPrefixCls = "".concat(prefixCls, "-time-panel-cell");

  // ========================== Refs ==========================
  var ulRef = React.useRef(null);

  // ========================= Scroll =========================
  var checkDelayRef = React.useRef();
  var clearDelayCheck = function clearDelayCheck() {
    clearTimeout(checkDelayRef.current);
  };

  // ========================== Sync ==========================
  var _useScrollTo = (0, _useScrollTo3.default)(ulRef, value !== null && value !== void 0 ? value : optionalValue),
    _useScrollTo2 = _slicedToArray(_useScrollTo, 3),
    syncScroll = _useScrollTo2[0],
    stopScroll = _useScrollTo2[1],
    isScrolling = _useScrollTo2[2];

  // Effect sync value scroll
  (0, _useLayoutEffect.default)(function () {
    syncScroll();
    clearDelayCheck();
    return function () {
      stopScroll();
      clearDelayCheck();
    };
  }, [value, optionalValue, flattenUnits(units)]);

  // ========================= Change =========================
  // Scroll event if sync onScroll
  var onInternalScroll = function onInternalScroll(event) {
    clearDelayCheck();
    var target = event.target;
    if (!isScrolling() && changeOnScroll) {
      checkDelayRef.current = setTimeout(function () {
        var ul = ulRef.current;
        var firstLiTop = ul.querySelector("li").offsetTop;
        var liList = Array.from(ul.querySelectorAll("li"));
        var liTopList = liList.map(function (li) {
          return li.offsetTop - firstLiTop;
        });
        var liDistList = liTopList.map(function (top, index) {
          if (units[index].disabled) {
            return Number.MAX_SAFE_INTEGER;
          }
          return Math.abs(top - target.scrollTop);
        });

        // Find min distance index
        var minDist = Math.min.apply(Math, _toConsumableArray(liDistList));
        var minDistIndex = liDistList.findIndex(function (dist) {
          return dist === minDist;
        });
        var targetUnit = units[minDistIndex];
        if (targetUnit && !targetUnit.disabled) {
          onChange(targetUnit.value);
        }
      }, SCROLL_DELAY);
    }
  };

  // ========================= Render =========================
  var columnPrefixCls = "".concat(panelPrefixCls, "-column");
  return /*#__PURE__*/React.createElement("ul", {
    className: columnPrefixCls,
    ref: ulRef,
    "data-type": type,
    onScroll: onInternalScroll
  }, units.map(function (_ref2) {
    var label = _ref2.label,
      unitValue = _ref2.value,
      disabled = _ref2.disabled;
    var inner = /*#__PURE__*/React.createElement("div", {
      className: "".concat(cellPrefixCls, "-inner")
    }, label);
    return /*#__PURE__*/React.createElement("li", {
      key: unitValue,
      style: styles.item,
      className: (0, _clsx2.clsx)(cellPrefixCls, classNames.item, _defineProperty(_defineProperty({}, "".concat(cellPrefixCls, "-selected"), value === unitValue), "".concat(cellPrefixCls, "-disabled"), disabled)),
      onClick: function onClick() {
        if (!disabled) {
          onChange(unitValue);
        }
      },
      onDoubleClick: function onDoubleClick() {
        if (!disabled && onDblClick) {
          onDblClick();
        }
      },
      onMouseEnter: function onMouseEnter() {
        onHover(unitValue);
      },
      onMouseLeave: function onMouseLeave() {
        onHover(null);
      },
      "data-value": unitValue
    }, cellRender ? cellRender(unitValue, {
      prefixCls: prefixCls,
      originNode: inner,
      today: now,
      type: 'time',
      subType: type,
      locale: locale
    }) : inner);
  }));
}