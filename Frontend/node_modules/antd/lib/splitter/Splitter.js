"use strict";
"use client";

/* eslint-disable react/no-array-index-key */
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _resizeObserver = _interopRequireDefault(require("@rc-component/resize-observer"));
var _util = require("@rc-component/util");
var _clsx = require("clsx");
var _hooks = require("../_util/hooks");
var _warning = require("../_util/warning");
var _context = require("../config-provider/context");
var _useCSSVarCls = _interopRequireDefault(require("../config-provider/hooks/useCSSVarCls"));
var _useItems = _interopRequireDefault(require("./hooks/useItems"));
var _useResizable = _interopRequireDefault(require("./hooks/useResizable"));
var _useResize = _interopRequireDefault(require("./hooks/useResize"));
var _useSizes = _interopRequireDefault(require("./hooks/useSizes"));
var _Panel = require("./Panel");
var _SplitBar = _interopRequireDefault(require("./SplitBar"));
var _style = _interopRequireDefault(require("./style"));
const Splitter = props => {
  const {
    prefixCls: customizePrefixCls,
    className,
    classNames,
    style,
    styles,
    layout,
    orientation,
    vertical,
    children,
    draggerIcon,
    collapsibleIcon,
    rootClassName,
    onDraggerDoubleClick,
    onResizeStart,
    onResize,
    onResizeEnd,
    lazy
  } = props;
  const {
    getPrefixCls,
    direction,
    className: contextClassName,
    style: contextStyle,
    classNames: contextClassNames,
    styles: contextStyles
  } = (0, _context.useComponentConfig)('splitter');
  const prefixCls = getPrefixCls('splitter', customizePrefixCls);
  const rootPrefixCls = getPrefixCls();
  const rootCls = (0, _useCSSVarCls.default)(prefixCls);
  const [hashId, cssVarCls] = (0, _style.default)(prefixCls, rootCls);
  // ======================== Direct ========================
  const [mergedOrientation, isVertical] = (0, _hooks.useOrientation)(orientation, vertical, layout);
  const isRTL = direction === 'rtl';
  const reverse = !isVertical && isRTL;
  // ====================== Items Data ======================
  const items = (0, _useItems.default)(children);
  // >>> Warning for uncontrolled
  if (process.env.NODE_ENV !== 'production') {
    const warning = (0, _warning.devUseWarning)('Splitter');
    const existSize = items.some(item => item.size !== undefined);
    const existUndefinedSize = items.some(item => item.size === undefined);
    if (existSize && existUndefinedSize && !onResize) {
      process.env.NODE_ENV !== "production" ? warning(false, 'usage', 'When part of `Splitter.Panel` has `size`, `onResize` is required or change `size` to `defaultSize`.') : void 0;
    }
    warning.deprecated(!layout, 'layout', 'orientation');
  }
  // ====================== Container =======================
  const [containerSize, setContainerSize] = (0, _react.useState)();
  const onContainerResize = size => {
    const {
      offsetWidth,
      offsetHeight
    } = size;
    const containerSize = isVertical ? offsetHeight : offsetWidth;
    // Skip when container has no size, Such as nested in a hidden tab panel
    // to fix: https://github.com/ant-design/ant-design/issues/51106
    if (containerSize === 0) {
      return;
    }
    setContainerSize(containerSize);
  };
  // ========================= Size =========================
  const [panelSizes, itemPxSizes, itemPtgSizes, itemPtgMinSizes, itemPtgMaxSizes, updateSizes] = (0, _useSizes.default)(items, containerSize);
  // ====================== Resizable =======================
  const resizableInfos = (0, _useResizable.default)(items, itemPxSizes, reverse);
  const [onOffsetStart, onOffsetUpdate, onOffsetEnd, onCollapse, movingIndex] = (0, _useResize.default)(items, resizableInfos, itemPtgSizes, containerSize, updateSizes, reverse);
  // ======================== Events ========================
  const onInternalResizeStart = (0, _util.useEvent)(index => {
    onOffsetStart(index);
    onResizeStart?.(itemPxSizes);
  });
  const onInternalResizeUpdate = (0, _util.useEvent)((index, offset, lazyEnd) => {
    const nextSizes = onOffsetUpdate(index, offset);
    if (lazyEnd) {
      onResizeEnd?.(nextSizes);
    } else {
      onResize?.(nextSizes);
    }
  });
  const onInternalResizeEnd = (0, _util.useEvent)(lazyEnd => {
    onOffsetEnd();
    if (!lazyEnd) {
      onResizeEnd?.(itemPxSizes);
    }
  });
  const onInternalCollapse = (0, _util.useEvent)((index, type) => {
    const nextSizes = onCollapse(index, type);
    onResize?.(nextSizes);
    onResizeEnd?.(nextSizes);
    const collapsed = nextSizes.map(size => Math.abs(size) < Number.EPSILON);
    props.onCollapse?.(collapsed, nextSizes);
  });
  // =========== Merged Props for Semantic ==========
  const mergedProps = {
    ...props,
    vertical: isVertical,
    orientation: mergedOrientation
  };
  // ======================== Styles ========================
  const [mergedClassNames, mergedStyles] = (0, _hooks.useMergeSemantic)([contextClassNames, classNames], [contextStyles, styles], {
    props: mergedProps
  }, {
    // Convert `classNames.dragger: 'a'` to
    // `classNames.dragger: { default: 'a' }`
    dragger: {
      _default: 'default'
    }
  });
  const containerClassName = (0, _clsx.clsx)(prefixCls, className, `${prefixCls}-${mergedOrientation}`, {
    [`${prefixCls}-rtl`]: isRTL
  }, rootClassName, mergedClassNames.root, contextClassName, cssVarCls, rootCls, hashId);
  // ======================== Render ========================
  const maskCls = `${prefixCls}-mask`;
  const stackSizes = _react.default.useMemo(() => {
    const mergedSizes = [];
    let stack = 0;
    const len = items.length;
    for (let i = 0; i < len; i += 1) {
      stack += itemPtgSizes[i];
      mergedSizes.push(stack);
    }
    return mergedSizes;
  }, [itemPtgSizes, items.length]);
  const mergedStyle = {
    ...mergedStyles.root,
    ...contextStyle,
    ...style
  };
  return /*#__PURE__*/_react.default.createElement(_resizeObserver.default, {
    onResize: onContainerResize
  }, /*#__PURE__*/_react.default.createElement("div", {
    style: mergedStyle,
    className: containerClassName
  }, items.map((item, idx) => {
    const panelProps = {
      ...item,
      className: (0, _clsx.clsx)(mergedClassNames.panel, item.className),
      style: {
        ...mergedStyles.panel,
        ...item.style
      }
    };
    // Panel
    const panel = /*#__PURE__*/_react.default.createElement(_Panel.InternalPanel, {
      ...panelProps,
      prefixCls: prefixCls,
      size: panelSizes[idx]
    });
    // Split Bar
    let splitBar = null;
    const resizableInfo = resizableInfos[idx];
    if (resizableInfo) {
      const ariaMinStart = (stackSizes[idx - 1] || 0) + itemPtgMinSizes[idx];
      const ariaMinEnd = (stackSizes[idx + 1] || 100) - itemPtgMaxSizes[idx + 1];
      const ariaMaxStart = (stackSizes[idx - 1] || 0) + itemPtgMaxSizes[idx];
      const ariaMaxEnd = (stackSizes[idx + 1] || 100) - itemPtgMinSizes[idx + 1];
      splitBar = /*#__PURE__*/_react.default.createElement(_SplitBar.default, {
        lazy: lazy,
        index: idx,
        active: movingIndex === idx,
        prefixCls: prefixCls,
        rootPrefixCls: rootPrefixCls,
        vertical: isVertical,
        resizable: resizableInfo.resizable,
        draggerStyle: mergedStyles.dragger,
        draggerClassName: mergedClassNames.dragger,
        draggerIcon: draggerIcon,
        collapsibleIcon: collapsibleIcon,
        ariaNow: stackSizes[idx] * 100,
        ariaMin: Math.max(ariaMinStart, ariaMinEnd) * 100,
        ariaMax: Math.min(ariaMaxStart, ariaMaxEnd) * 100,
        startCollapsible: resizableInfo.startCollapsible,
        endCollapsible: resizableInfo.endCollapsible,
        showStartCollapsibleIcon: resizableInfo.showStartCollapsibleIcon,
        showEndCollapsibleIcon: resizableInfo.showEndCollapsibleIcon,
        onDraggerDoubleClick: onDraggerDoubleClick,
        onOffsetStart: onInternalResizeStart,
        onOffsetUpdate: (index, offsetX, offsetY, lazyEnd) => {
          let offset = isVertical ? offsetY : offsetX;
          if (reverse) {
            offset = -offset;
          }
          onInternalResizeUpdate(index, offset, lazyEnd);
        },
        onOffsetEnd: onInternalResizeEnd,
        onCollapse: onInternalCollapse,
        containerSize: containerSize || 0
      });
    }
    return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, {
      key: `split-panel-${idx}`
    }, panel, splitBar);
  }), typeof movingIndex === 'number' && (/*#__PURE__*/_react.default.createElement("div", {
    "aria-hidden": true,
    className: (0, _clsx.clsx)(maskCls, `${maskCls}-${mergedOrientation}`)
  }))));
};
if (process.env.NODE_ENV !== 'production') {
  Splitter.displayName = 'Splitter';
}
var _default = exports.default = Splitter;