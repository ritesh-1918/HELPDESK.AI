"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _useControlledState = _interopRequireDefault(require("@rc-component/util/lib/hooks/useControlledState"));
var _clsx = require("clsx");
var _react = _interopRequireWildcard(require("react"));
var React = _react;
var _Preview = _interopRequireDefault(require("./Preview"));
var _PreviewGroup = _interopRequireDefault(require("./PreviewGroup"));
var _common = require("./common");
var _context = require("./context");
var _useRegisterImage = _interopRequireDefault(require("./hooks/useRegisterImage"));
var _useStatus = _interopRequireDefault(require("./hooks/useStatus"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
const ImageInternal = props => {
  const {
    // Misc
    prefixCls = 'rc-image',
    previewPrefixCls = `${prefixCls}-preview`,
    // Style
    rootClassName,
    className,
    style,
    classNames = {},
    styles = {},
    width,
    height,
    // Image
    src: imgSrc,
    alt,
    placeholder,
    fallback,
    // Preview
    preview = true,
    // Events
    onClick,
    onError,
    ...otherProps
  } = props;
  const groupContext = (0, _react.useContext)(_context.PreviewGroupContext);

  // ========================== Preview ===========================
  const canPreview = !!preview;
  const {
    src: previewSrc,
    open: previewOpen,
    onOpenChange: onPreviewOpenChange,
    cover,
    rootClassName: previewRootClassName,
    ...restProps
  } = preview && typeof preview === 'object' ? preview : {};
  const coverPlacement = typeof cover === 'object' && cover.placement ? cover.placement || 'center' : 'center';
  const coverNode = typeof cover === 'object' && cover.coverNode ? cover.coverNode : cover;

  // ============================ Open ============================
  const [isShowPreview, setShowPreview] = (0, _useControlledState.default)(!!previewOpen, previewOpen);
  const [mousePosition, setMousePosition] = (0, _react.useState)(null);
  const triggerPreviewOpen = nextOpen => {
    setShowPreview(nextOpen);
    onPreviewOpenChange?.(nextOpen);
  };
  const onPreviewClose = () => {
    triggerPreviewOpen(false);
  };

  // ========================= ImageProps =========================
  const isCustomPlaceholder = placeholder && placeholder !== true;
  const src = previewSrc ?? imgSrc;
  const [getImgRef, srcAndOnload, status] = (0, _useStatus.default)({
    src: imgSrc,
    isCustomPlaceholder,
    fallback
  });
  const imgCommonProps = (0, _react.useMemo)(() => {
    const obj = {};
    _common.COMMON_PROPS.forEach(prop => {
      if (props[prop] !== undefined) {
        obj[prop] = props[prop];
      }
    });
    return obj;
  }, _common.COMMON_PROPS.map(prop => props[prop]));

  // ========================== Register ==========================
  const registerData = (0, _react.useMemo)(() => ({
    ...imgCommonProps,
    src
  }), [src, imgCommonProps]);
  const imageId = (0, _useRegisterImage.default)(canPreview, registerData);

  // ========================== Preview ===========================
  const onPreview = e => {
    const rect = e.target.getBoundingClientRect();
    const left = rect.x + rect.width / 2;
    const top = rect.y + rect.height / 2;
    if (groupContext) {
      groupContext.onPreview(imageId, src, left, top);
    } else {
      setMousePosition({
        x: left,
        y: top
      });
      triggerPreviewOpen(true);
    }
    onClick?.(e);
  };

  // =========================== Render ===========================
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", _extends({}, otherProps, {
    className: (0, _clsx.clsx)(prefixCls, rootClassName, classNames.root, {
      [`${prefixCls}-error`]: status === 'error'
    }),
    onClick: canPreview ? onPreview : onClick,
    style: {
      width,
      height,
      ...styles.root
    }
  }), /*#__PURE__*/React.createElement("img", _extends({}, imgCommonProps, {
    className: (0, _clsx.clsx)(`${prefixCls}-img`, {
      [`${prefixCls}-img-placeholder`]: placeholder === true
    }, classNames.image, className),
    style: {
      height,
      ...styles.image,
      ...style
    },
    ref: getImgRef
  }, srcAndOnload, {
    width: width,
    height: height,
    onError: onError
  })), status === 'loading' && /*#__PURE__*/React.createElement("div", {
    "aria-hidden": "true",
    className: `${prefixCls}-placeholder`
  }, placeholder), cover !== false && canPreview && /*#__PURE__*/React.createElement("div", {
    className: (0, _clsx.clsx)(`${prefixCls}-cover`, classNames.cover, `${prefixCls}-cover-${coverPlacement}`),
    style: {
      display: style?.display === 'none' ? 'none' : undefined,
      ...styles.cover
    }
  }, coverNode)), !groupContext && canPreview && /*#__PURE__*/React.createElement(_Preview.default, _extends({
    "aria-hidden": !isShowPreview,
    open: isShowPreview,
    prefixCls: previewPrefixCls,
    onClose: onPreviewClose,
    mousePosition: mousePosition,
    src: src,
    alt: alt,
    imageInfo: {
      width,
      height
    },
    fallback: fallback,
    imgCommonProps: imgCommonProps
  }, restProps, {
    classNames: classNames?.popup,
    styles: styles?.popup,
    rootClassName: (0, _clsx.clsx)(previewRootClassName, rootClassName)
  })));
};
ImageInternal.PreviewGroup = _PreviewGroup.default;
if (process.env.NODE_ENV !== 'production') {
  ImageInternal.displayName = 'Image';
}
var _default = exports.default = ImageInternal;