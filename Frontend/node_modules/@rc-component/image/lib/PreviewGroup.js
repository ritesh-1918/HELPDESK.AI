"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _useControlledState = _interopRequireDefault(require("@rc-component/util/lib/hooks/useControlledState"));
var _useEvent = _interopRequireDefault(require("@rc-component/util/lib/hooks/useEvent"));
var _react = _interopRequireWildcard(require("react"));
var React = _react;
var _Preview = _interopRequireDefault(require("./Preview"));
var _context = require("./context");
var _usePreviewItems = _interopRequireDefault(require("./hooks/usePreviewItems"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
const Group = ({
  previewPrefixCls = 'rc-image-preview',
  classNames,
  styles,
  children,
  icons = {},
  items,
  preview,
  fallback
}) => {
  const {
    open: previewOpen,
    onOpenChange,
    current: currentIndex,
    onChange,
    ...restProps
  } = preview && typeof preview === 'object' ? preview : {};

  // ========================== Items ===========================
  const [mergedItems, register, fromItems] = (0, _usePreviewItems.default)(items);

  // ========================= Preview ==========================
  // >>> Index
  const [current, setCurrent] = (0, _useControlledState.default)(0, currentIndex);
  const [keepOpenIndex, setKeepOpenIndex] = (0, _react.useState)(false);

  // >>> Image
  const {
    src,
    ...imgCommonProps
  } = mergedItems[current]?.data || {};
  // >>> Visible
  const [isShowPreview, setShowPreview] = (0, _useControlledState.default)(!!previewOpen, previewOpen);
  const triggerShowPreview = (0, _useEvent.default)(next => {
    setShowPreview(next);
    if (next !== isShowPreview) {
      onOpenChange?.(next, {
        current
      });
    }
  });

  // >>> Position
  const [mousePosition, setMousePosition] = (0, _react.useState)(null);
  const onPreviewFromImage = React.useCallback((id, imageSrc, mouseX, mouseY) => {
    const index = fromItems ? mergedItems.findIndex(item => item.data.src === imageSrc) : mergedItems.findIndex(item => item.id === id);
    setCurrent(index < 0 ? 0 : index);
    triggerShowPreview(true);
    setMousePosition({
      x: mouseX,
      y: mouseY
    });
    setKeepOpenIndex(true);
  }, [mergedItems, fromItems]);

  // Reset current when reopen
  React.useEffect(() => {
    if (isShowPreview) {
      if (!keepOpenIndex) {
        setCurrent(0);
      }
    } else {
      setKeepOpenIndex(false);
    }
  }, [isShowPreview]);

  // ========================== Events ==========================
  const onInternalChange = (next, prev) => {
    setCurrent(next);
    onChange?.(next, prev);
  };
  const onPreviewClose = () => {
    triggerShowPreview(false);
    setMousePosition(null);
  };

  // ========================= Context ==========================
  const previewGroupContext = React.useMemo(() => ({
    register,
    onPreview: onPreviewFromImage
  }), [register, onPreviewFromImage]);

  // ========================== Render ==========================
  return /*#__PURE__*/React.createElement(_context.PreviewGroupContext.Provider, {
    value: previewGroupContext
  }, children, /*#__PURE__*/React.createElement(_Preview.default, _extends({
    "aria-hidden": !isShowPreview,
    open: isShowPreview,
    prefixCls: previewPrefixCls,
    onClose: onPreviewClose,
    mousePosition: mousePosition,
    imgCommonProps: imgCommonProps,
    src: src,
    fallback: fallback,
    icons: icons,
    current: current,
    count: mergedItems.length,
    onChange: onInternalChange
  }, restProps, {
    classNames: classNames?.popup,
    styles: styles?.popup
  })));
};
var _default = exports.default = Group;