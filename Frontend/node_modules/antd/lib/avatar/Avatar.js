"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _resizeObserver = _interopRequireDefault(require("@rc-component/resize-observer"));
var _ref = require("@rc-component/util/lib/ref");
var _clsx = require("clsx");
var _responsiveObserver = require("../_util/responsiveObserver");
var _warning = require("../_util/warning");
var _context = require("../config-provider/context");
var _useCSSVarCls = _interopRequireDefault(require("../config-provider/hooks/useCSSVarCls"));
var _useSize = _interopRequireDefault(require("../config-provider/hooks/useSize"));
var _useBreakpoint = _interopRequireDefault(require("../grid/hooks/useBreakpoint"));
var _AvatarContext = _interopRequireDefault(require("./AvatarContext"));
var _style = _interopRequireDefault(require("./style"));
const Avatar = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    prefixCls: customizePrefixCls,
    shape,
    size: customSize,
    src,
    srcSet,
    icon,
    className,
    rootClassName,
    style,
    alt,
    draggable,
    children,
    crossOrigin,
    gap = 4,
    onError,
    ...others
  } = props;
  const [scale, setScale] = React.useState(1);
  const [mounted, setMounted] = React.useState(false);
  const [isImgExist, setIsImgExist] = React.useState(true);
  const avatarNodeRef = React.useRef(null);
  const avatarChildrenRef = React.useRef(null);
  const avatarNodeMergedRef = (0, _ref.composeRef)(ref, avatarNodeRef);
  const {
    getPrefixCls,
    className: contextClassName,
    style: contextStyle
  } = (0, _context.useComponentConfig)('avatar');
  const avatarCtx = React.useContext(_AvatarContext.default);
  const setScaleParam = () => {
    if (!avatarChildrenRef.current || !avatarNodeRef.current) {
      return;
    }
    const childrenWidth = avatarChildrenRef.current.offsetWidth; // offsetWidth avoid affecting be transform scale
    const nodeWidth = avatarNodeRef.current.offsetWidth;
    // denominator is 0 is no meaning
    if (childrenWidth !== 0 && nodeWidth !== 0) {
      if (gap * 2 < nodeWidth) {
        setScale(nodeWidth - gap * 2 < childrenWidth ? (nodeWidth - gap * 2) / childrenWidth : 1);
      }
    }
  };
  React.useEffect(() => {
    setMounted(true);
  }, []);
  React.useEffect(() => {
    setIsImgExist(true);
    setScale(1);
  }, [src]);
  React.useEffect(setScaleParam, [gap]);
  const handleImgLoadError = () => {
    const errorFlag = onError?.();
    if (errorFlag !== false) {
      setIsImgExist(false);
    }
  };
  const size = (0, _useSize.default)(ctxSize => customSize ?? avatarCtx?.size ?? ctxSize ?? 'medium');
  const needResponsive = Object.keys(typeof size === 'object' ? size || {} : {}).some(key => _responsiveObserver.responsiveArray.includes(key));
  const screens = (0, _useBreakpoint.default)(needResponsive);
  const responsiveSizeStyle = React.useMemo(() => {
    if (typeof size !== 'object') {
      return {};
    }
    const currentBreakpoint = _responsiveObserver.responsiveArray.find(screen => screens[screen]);
    const currentSize = size[currentBreakpoint];
    return currentSize ? {
      width: currentSize,
      height: currentSize,
      fontSize: currentSize && (icon || children) ? currentSize / 2 : 18
    } : {};
  }, [screens, size, icon, children]);
  if (process.env.NODE_ENV !== 'production') {
    const warning = (0, _warning.devUseWarning)('Avatar');
    process.env.NODE_ENV !== "production" ? warning(!(typeof icon === 'string' && icon.length > 2), 'breaking', `\`icon\` is using ReactNode instead of string naming in v4. Please check \`${icon}\` at https://ant.design/components/icon`) : void 0;
  }
  const prefixCls = getPrefixCls('avatar', customizePrefixCls);
  const rootCls = (0, _useCSSVarCls.default)(prefixCls);
  const [hashId, cssVarCls] = (0, _style.default)(prefixCls, rootCls);
  const sizeCls = (0, _clsx.clsx)({
    [`${prefixCls}-lg`]: size === 'large',
    [`${prefixCls}-sm`]: size === 'small'
  });
  const hasImageElement = /*#__PURE__*/React.isValidElement(src);
  const mergedShape = shape || avatarCtx?.shape || 'circle';
  const classString = (0, _clsx.clsx)(prefixCls, sizeCls, contextClassName, `${prefixCls}-${mergedShape}`, {
    [`${prefixCls}-image`]: hasImageElement || src && isImgExist,
    [`${prefixCls}-icon`]: !!icon
  }, cssVarCls, rootCls, className, rootClassName, hashId);
  const sizeStyle = typeof size === 'number' ? {
    width: size,
    height: size,
    fontSize: icon ? size / 2 : 18
  } : {};
  let childrenToRender;
  if (typeof src === 'string' && isImgExist) {
    childrenToRender = /*#__PURE__*/React.createElement("img", {
      src: src,
      draggable: draggable,
      srcSet: srcSet,
      onError: handleImgLoadError,
      alt: alt,
      crossOrigin: crossOrigin
    });
  } else if (hasImageElement) {
    childrenToRender = src;
  } else if (icon) {
    childrenToRender = icon;
  } else if (mounted || scale !== 1) {
    const transformString = `scale(${scale})`;
    const childrenStyle = {
      msTransform: transformString,
      WebkitTransform: transformString,
      transform: transformString
    };
    childrenToRender = /*#__PURE__*/React.createElement(_resizeObserver.default, {
      onResize: setScaleParam
    }, /*#__PURE__*/React.createElement("span", {
      className: `${prefixCls}-string`,
      ref: avatarChildrenRef,
      style: childrenStyle
    }, children));
  } else {
    childrenToRender = /*#__PURE__*/React.createElement("span", {
      className: `${prefixCls}-string`,
      style: {
        opacity: 0
      },
      ref: avatarChildrenRef
    }, children);
  }
  return /*#__PURE__*/React.createElement("span", {
    ...others,
    style: {
      ...sizeStyle,
      ...responsiveSizeStyle,
      ...contextStyle,
      ...style
    },
    className: classString,
    ref: avatarNodeMergedRef
  }, childrenToRender);
});
if (process.env.NODE_ENV !== 'production') {
  Avatar.displayName = 'Avatar';
}
var _default = exports.default = Avatar;