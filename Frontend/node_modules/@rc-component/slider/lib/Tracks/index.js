"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _clsx = require("clsx");
var React = _interopRequireWildcard(require("react"));
var _context = _interopRequireDefault(require("../context"));
var _util = require("../util");
var _Track = _interopRequireDefault(require("./Track"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const Tracks = props => {
  const {
    prefixCls,
    style,
    values,
    startPoint,
    onStartMove
  } = props;
  const {
    included,
    range,
    min,
    styles,
    classNames
  } = React.useContext(_context.default);

  // =========================== List ===========================
  const trackList = React.useMemo(() => {
    if (!range) {
      // null value do not have track
      if (values.length === 0) {
        return [];
      }
      const startValue = startPoint ?? min;
      const endValue = values[0];
      return [{
        start: Math.min(startValue, endValue),
        end: Math.max(startValue, endValue)
      }];
    }

    // Multiple
    const list = [];
    for (let i = 0; i < values.length - 1; i += 1) {
      list.push({
        start: values[i],
        end: values[i + 1]
      });
    }
    return list;
  }, [values, range, startPoint, min]);
  if (!included) {
    return null;
  }

  // ========================== Render ==========================
  const tracksNode = trackList?.length && (classNames.tracks || styles.tracks) ? /*#__PURE__*/React.createElement(_Track.default, {
    index: null,
    prefixCls: prefixCls,
    start: trackList[0].start,
    end: trackList[trackList.length - 1].end,
    replaceCls: (0, _clsx.clsx)(classNames.tracks, `${prefixCls}-tracks`),
    style: styles.tracks
  }) : null;
  return /*#__PURE__*/React.createElement(React.Fragment, null, tracksNode, trackList.map(({
    start,
    end
  }, index) => /*#__PURE__*/React.createElement(_Track.default, {
    index: index,
    prefixCls: prefixCls,
    style: {
      ...(0, _util.getIndex)(style, index),
      ...styles.track
    },
    start: start,
    end: end,
    key: index,
    onStartMove: onStartMove
  })));
};
var _default = exports.default = Tracks;