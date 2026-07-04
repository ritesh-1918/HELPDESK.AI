"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _reactDom = require("react-dom");
var _util = require("../util");
var _Handle = _interopRequireDefault(require("./Handle"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
const Handles = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    prefixCls,
    style,
    onStartMove,
    onOffsetChange,
    values,
    handleRender,
    activeHandleRender,
    draggingIndex,
    draggingDelete,
    onFocus,
    ...restProps
  } = props;
  const handlesRef = React.useRef({});

  // =========================== Active ===========================
  const [activeVisible, setActiveVisible] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const onActive = index => {
    setActiveIndex(index);
    setActiveVisible(true);
  };
  const onHandleFocus = (e, index) => {
    onActive(index);
    onFocus?.(e);
  };
  const onHandleMouseEnter = (e, index) => {
    onActive(index);
  };

  // =========================== Render ===========================
  React.useImperativeHandle(ref, () => ({
    focus: index => {
      handlesRef.current[index]?.focus();
    },
    hideHelp: () => {
      (0, _reactDom.flushSync)(() => {
        setActiveVisible(false);
      });
    }
  }));

  // =========================== Render ===========================
  // Handle Props
  const handleProps = {
    prefixCls,
    onStartMove,
    onOffsetChange,
    render: handleRender,
    onFocus: onHandleFocus,
    onMouseEnter: onHandleMouseEnter,
    ...restProps
  };
  return /*#__PURE__*/React.createElement(React.Fragment, null, values.map((value, index) => {
    const dragging = draggingIndex === index;
    return /*#__PURE__*/React.createElement(_Handle.default, _extends({
      ref: node => {
        if (!node) {
          delete handlesRef.current[index];
        } else {
          handlesRef.current[index] = node;
        }
      },
      dragging: dragging,
      draggingDelete: dragging && draggingDelete,
      style: (0, _util.getIndex)(style, index),
      key: index,
      value: value,
      valueIndex: index
    }, handleProps));
  }), activeHandleRender && activeVisible && /*#__PURE__*/React.createElement(_Handle.default, _extends({
    key: "a11y"
  }, handleProps, {
    value: values[activeIndex],
    valueIndex: null,
    dragging: draggingIndex !== -1,
    draggingDelete: draggingDelete,
    render: activeHandleRender,
    style: {
      pointerEvents: 'none'
    },
    tabIndex: null,
    "aria-hidden": true
  })));
});
if (process.env.NODE_ENV !== 'production') {
  Handles.displayName = 'Handles';
}
var _default = exports.default = Handles;