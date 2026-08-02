"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _portal = _interopRequireDefault(require("@rc-component/portal"));
var _context = _interopRequireWildcard(require("../context"));
var _useDelay = _interopRequireDefault(require("../hooks/useDelay"));
var _useAlign = _interopRequireDefault(require("../hooks/useAlign"));
var _Popup = _interopRequireDefault(require("../Popup"));
var _util = require("@rc-component/util");
var _useTargetState = _interopRequireDefault(require("./useTargetState"));
var _findDOMNode = require("@rc-component/util/lib/Dom/findDOMNode");
var _UniqueContainer = _interopRequireDefault(require("./UniqueContainer"));
var _clsx = require("clsx");
var _util2 = require("../util");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const UniqueProvider = ({
  children,
  postTriggerProps
}) => {
  const [trigger, open, options, onTargetVisibleChanged] = (0, _useTargetState.default)();

  // ========================== Options ===========================
  const mergedOptions = React.useMemo(() => {
    if (!options || !postTriggerProps) {
      return options;
    }
    return postTriggerProps(options);
  }, [options, postTriggerProps]);

  // =========================== Popup ============================
  const [popupEle, setPopupEle] = React.useState(null);
  const [popupSize, setPopupSize] = React.useState(null);

  // Used for forwardRef popup. Not use internal
  const externalPopupRef = React.useRef(null);
  const setPopupRef = (0, _util.useEvent)(node => {
    externalPopupRef.current = node;
    if ((0, _findDOMNode.isDOM)(node) && popupEle !== node) {
      setPopupEle(node);
    }
  });

  // ========================== Register ==========================
  // Store the isOpen function from the latest show call
  const isOpenRef = React.useRef(null);
  const delayInvoke = (0, _useDelay.default)();
  const show = (0, _util.useEvent)((showOptions, isOpen) => {
    // Store the isOpen function for later use in hide
    isOpenRef.current = isOpen;
    delayInvoke(() => {
      trigger(showOptions);
    }, showOptions.delay);
  });
  const hide = delay => {
    delayInvoke(() => {
      // Check if we should still hide by calling the isOpen function
      // If isOpen returns true, it means another trigger wants to keep it open
      if (isOpenRef.current?.()) {
        return; // Don't hide if something else wants it open
      }
      trigger(false);
      // Don't clear target, currentNode, options immediately, wait until animation completes
    }, delay);
  };

  // Callback after animation completes
  const onVisibleChanged = (0, _util.useEvent)(visible => {
    // Call useTargetState callback to handle animation state
    onTargetVisibleChanged(visible);
  });

  // =========================== Align ============================
  const [ready, offsetX, offsetY, offsetR, offsetB, arrowX, arrowY,

    // scaleX - not used in UniqueProvider
  ,,
  // scaleY - not used in UniqueProvider
  alignInfo, onAlign] = (0, _useAlign.default)(open, popupEle, mergedOptions?.target, mergedOptions?.popupPlacement, mergedOptions?.builtinPlacements || {}, mergedOptions?.popupAlign, undefined,
  // onPopupAlign
  false // isMobile
  );
  const alignedClassName = React.useMemo(() => {
    if (!mergedOptions) {
      return '';
    }
    const baseClassName = (0, _util2.getAlignPopupClassName)(mergedOptions.builtinPlacements || {}, mergedOptions.prefixCls || '', alignInfo, false // alignPoint is false for UniqueProvider
    );
    return (0, _clsx.clsx)(baseClassName, mergedOptions.getPopupClassNameFromAlign?.(alignInfo));
  }, [alignInfo, mergedOptions?.getPopupClassNameFromAlign, mergedOptions?.builtinPlacements, mergedOptions?.prefixCls]);
  const contextValue = React.useMemo(() => ({
    show,
    hide
  }), []);

  // =========================== Align ============================
  React.useEffect(() => {
    onAlign();
  }, [mergedOptions?.target]);

  // =========================== Motion ===========================
  const onPrepare = (0, _util.useEvent)(() => {
    onAlign();
    return Promise.resolve();
  });

  // ======================== Trigger Context =====================
  const subPopupElements = React.useRef({});
  const parentContext = React.useContext(_context.default);
  const triggerContextValue = React.useMemo(() => ({
    registerSubPopup: (id, subPopupEle) => {
      subPopupElements.current[id] = subPopupEle;
      parentContext?.registerSubPopup(id, subPopupEle);
    }
  }), [parentContext]);

  // =========================== Render ===========================
  const prefixCls = mergedOptions?.prefixCls;
  return /*#__PURE__*/React.createElement(_context.UniqueContext.Provider, {
    value: contextValue
  }, children, mergedOptions && /*#__PURE__*/React.createElement(_context.default.Provider, {
    value: triggerContextValue
  }, /*#__PURE__*/React.createElement(_Popup.default, {
    ref: setPopupRef,
    portal: _portal.default,
    onEsc: mergedOptions.onEsc,
    prefixCls: prefixCls,
    popup: mergedOptions.popup,
    className: (0, _clsx.clsx)(mergedOptions.popupClassName, alignedClassName, `${prefixCls}-unique-controlled`),
    style: mergedOptions.popupStyle,
    target: mergedOptions.target,
    open: open,
    keepDom: true,
    fresh: true,
    autoDestroy: false,
    onVisibleChanged: onVisibleChanged,
    ready: ready,
    offsetX: offsetX,
    offsetY: offsetY,
    offsetR: offsetR,
    offsetB: offsetB,
    onAlign: onAlign,
    onPrepare: onPrepare,
    onResize: size => setPopupSize({
      width: size.offsetWidth,
      height: size.offsetHeight
    }),
    arrowPos: {
      x: arrowX,
      y: arrowY
    },
    align: alignInfo,
    zIndex: mergedOptions.zIndex,
    mask: mergedOptions.mask,
    arrow: mergedOptions.arrow,
    motion: mergedOptions.popupMotion,
    maskMotion: mergedOptions.maskMotion,
    getPopupContainer: mergedOptions.getPopupContainer
  }, /*#__PURE__*/React.createElement(_UniqueContainer.default, {
    prefixCls: prefixCls,
    isMobile: false,
    ready: ready,
    open: open,
    align: alignInfo,
    offsetR: offsetR,
    offsetB: offsetB,
    offsetX: offsetX,
    offsetY: offsetY,
    arrowPos: {
      x: arrowX,
      y: arrowY
    },
    popupSize: popupSize,
    motion: mergedOptions.popupMotion,
    uniqueContainerClassName: (0, _clsx.clsx)(mergedOptions.uniqueContainerClassName, alignedClassName),
    uniqueContainerStyle: mergedOptions.uniqueContainerStyle
  }))));
};
var _default = exports.default = UniqueProvider;