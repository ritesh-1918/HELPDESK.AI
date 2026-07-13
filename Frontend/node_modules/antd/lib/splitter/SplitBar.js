"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _DownOutlined = _interopRequireDefault(require("@ant-design/icons/DownOutlined"));
var _LeftOutlined = _interopRequireDefault(require("@ant-design/icons/LeftOutlined"));
var _RightOutlined = _interopRequireDefault(require("@ant-design/icons/RightOutlined"));
var _UpOutlined = _interopRequireDefault(require("@ant-design/icons/UpOutlined"));
var _util = require("@rc-component/util");
var _useLayoutEffect = _interopRequireDefault(require("@rc-component/util/lib/hooks/useLayoutEffect"));
var _clsx = require("clsx");
var _genStyleUtils = require("../theme/util/genStyleUtils");
function getValidNumber(num) {
  return typeof num === 'number' && !Number.isNaN(num) && Number.isFinite(num) ? Math.round(num) : 0;
}
const DOUBLE_CLICK_TIME_GAP = 300;
const SplitBar = props => {
  const {
    prefixCls,
    rootPrefixCls,
    vertical,
    index,
    active,
    ariaNow,
    ariaMin,
    ariaMax,
    resizable,
    draggerIcon,
    draggerStyle,
    draggerClassName,
    collapsibleIcon,
    startCollapsible,
    endCollapsible,
    onDraggerDoubleClick,
    onOffsetStart,
    onOffsetUpdate,
    onOffsetEnd,
    onCollapse,
    lazy,
    containerSize,
    showStartCollapsibleIcon,
    showEndCollapsibleIcon
  } = props;
  const splitBarPrefixCls = `${prefixCls}-bar`;
  const lastClickTimeRef = (0, _react.useRef)(0);
  const [varName] = (0, _genStyleUtils.genCssVar)(rootPrefixCls, 'splitter');
  // ======================== Resize ========================
  const [startPos, setStartPos] = (0, _react.useState)(null);
  const [constrainedOffset, setConstrainedOffset] = (0, _react.useState)(0);
  const constrainedOffsetX = vertical ? 0 : constrainedOffset;
  const constrainedOffsetY = vertical ? constrainedOffset : 0;
  const onMouseDown = e => {
    e.stopPropagation();
    const currentTime = Date.now();
    const timeGap = currentTime - lastClickTimeRef.current;
    if (timeGap > 0 && timeGap < DOUBLE_CLICK_TIME_GAP) {
      // Prevent drag start if it's a double-click action
      return;
    }
    lastClickTimeRef.current = currentTime;
    if (resizable && e.currentTarget) {
      setStartPos([e.pageX, e.pageY]);
      onOffsetStart(index);
    }
  };
  const onTouchStart = e => {
    if (resizable && e.touches.length === 1) {
      const touch = e.touches[0];
      setStartPos([touch.pageX, touch.pageY]);
      onOffsetStart(index);
    }
  };
  // Updated constraint calculation
  const getConstrainedOffset = rawOffset => {
    const currentPos = containerSize * ariaNow / 100;
    const newPos = currentPos + rawOffset;
    // Calculate available space
    const minAllowed = Math.max(0, containerSize * ariaMin / 100);
    const maxAllowed = Math.min(containerSize, containerSize * ariaMax / 100);
    // Constrain new position within bounds
    const clampedPos = Math.max(minAllowed, Math.min(maxAllowed, newPos));
    return clampedPos - currentPos;
  };
  const handleLazyMove = (0, _util.useEvent)((offsetX, offsetY) => {
    const constrainedOffsetValue = getConstrainedOffset(vertical ? offsetY : offsetX);
    setConstrainedOffset(constrainedOffsetValue);
  });
  const handleLazyEnd = (0, _util.useEvent)(() => {
    onOffsetUpdate(index, constrainedOffsetX, constrainedOffsetY, true);
    setConstrainedOffset(0);
    onOffsetEnd(true);
  });
  const getVisibilityClass = mode => {
    switch (mode) {
      case true:
        return `${splitBarPrefixCls}-collapse-bar-always-visible`;
      case false:
        return `${splitBarPrefixCls}-collapse-bar-always-hidden`;
      case 'auto':
        return `${splitBarPrefixCls}-collapse-bar-hover-only`;
    }
  };
  (0, _useLayoutEffect.default)(() => {
    if (!startPos) {
      return;
    }
    const onMouseMove = e => {
      const {
        pageX,
        pageY
      } = e;
      const offsetX = pageX - startPos[0];
      const offsetY = pageY - startPos[1];
      if (lazy) {
        handleLazyMove(offsetX, offsetY);
      } else {
        onOffsetUpdate(index, offsetX, offsetY);
      }
    };
    const onMouseUp = () => {
      if (lazy) {
        handleLazyEnd();
      } else {
        onOffsetEnd();
      }
      setStartPos(null);
    };
    const handleTouchMove = e => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        const offsetX = touch.pageX - startPos[0];
        const offsetY = touch.pageY - startPos[1];
        if (lazy) {
          handleLazyMove(offsetX, offsetY);
        } else {
          onOffsetUpdate(index, offsetX, offsetY);
        }
      }
    };
    const handleTouchEnd = () => {
      if (lazy) {
        handleLazyEnd();
      } else {
        onOffsetEnd();
      }
      setStartPos(null);
    };
    const eventHandlerMap = {
      mousemove: onMouseMove,
      mouseup: onMouseUp,
      touchmove: handleTouchMove,
      touchend: handleTouchEnd
    };
    for (const [event, handler] of Object.entries(eventHandlerMap)) {
      // eslint-disable-next-line react-web-api/no-leaked-event-listener
      window.addEventListener(event, handler);
    }
    return () => {
      for (const [event, handler] of Object.entries(eventHandlerMap)) {
        window.removeEventListener(event, handler);
      }
    };
  }, [startPos, index, lazy]);
  const transformStyle = {
    [varName('bar-preview-offset')]: `${constrainedOffset}px`
  };
  // ======================== Render ========================
  const [startIcon, endIcon, startCustomize, endCustomize] = _react.default.useMemo(() => {
    let startIcon = null;
    let endIcon = null;
    const startCustomize = collapsibleIcon?.start !== undefined;
    const endCustomize = collapsibleIcon?.end !== undefined;
    if (vertical) {
      startIcon = startCustomize ? collapsibleIcon.start : /*#__PURE__*/_react.default.createElement(_UpOutlined.default, null);
      endIcon = endCustomize ? collapsibleIcon.end : /*#__PURE__*/_react.default.createElement(_DownOutlined.default, null);
    } else {
      startIcon = startCustomize ? collapsibleIcon.start : /*#__PURE__*/_react.default.createElement(_LeftOutlined.default, null);
      endIcon = endCustomize ? collapsibleIcon.end : /*#__PURE__*/_react.default.createElement(_RightOutlined.default, null);
    }
    return [startIcon, endIcon, startCustomize, endCustomize];
  }, [collapsibleIcon, vertical]);
  return /*#__PURE__*/_react.default.createElement("div", {
    className: splitBarPrefixCls,
    role: "separator",
    "aria-valuenow": getValidNumber(ariaNow),
    "aria-valuemin": getValidNumber(ariaMin),
    "aria-valuemax": getValidNumber(ariaMax)
  }, lazy && (/*#__PURE__*/_react.default.createElement("div", {
    className: (0, _clsx.clsx)(`${splitBarPrefixCls}-preview`, {
      [`${splitBarPrefixCls}-preview-active`]: !!constrainedOffset
    }),
    style: transformStyle
  })), /*#__PURE__*/_react.default.createElement("div", {
    style: draggerStyle,
    className: (0, _clsx.clsx)(`${splitBarPrefixCls}-dragger`, {
      [`${splitBarPrefixCls}-dragger-disabled`]: !resizable,
      [`${splitBarPrefixCls}-dragger-active`]: active,
      [`${splitBarPrefixCls}-dragger-customize`]: draggerIcon !== undefined
    }, draggerClassName?.default, active && draggerClassName?.active),
    onMouseDown: onMouseDown,
    onTouchStart: onTouchStart,
    onDoubleClick: () => onDraggerDoubleClick?.(index)
  }, draggerIcon !== undefined ? (/*#__PURE__*/_react.default.createElement("div", {
    className: (0, _clsx.clsx)(`${splitBarPrefixCls}-dragger-icon`)
  }, draggerIcon)) : null), startCollapsible && (/*#__PURE__*/_react.default.createElement("div", {
    className: (0, _clsx.clsx)(`${splitBarPrefixCls}-collapse-bar`, `${splitBarPrefixCls}-collapse-bar-start`, {
      [`${splitBarPrefixCls}-collapse-bar-customize`]: startCustomize
    }, getVisibilityClass(showStartCollapsibleIcon)),
    onClick: () => onCollapse(index, 'start')
  }, /*#__PURE__*/_react.default.createElement("span", {
    className: (0, _clsx.clsx)(`${splitBarPrefixCls}-collapse-icon`, `${splitBarPrefixCls}-collapse-start`)
  }, startIcon))), endCollapsible && (/*#__PURE__*/_react.default.createElement("div", {
    className: (0, _clsx.clsx)(`${splitBarPrefixCls}-collapse-bar`, `${splitBarPrefixCls}-collapse-bar-end`, {
      [`${splitBarPrefixCls}-collapse-bar-customize`]: endCustomize
    }, getVisibilityClass(showEndCollapsibleIcon)),
    onClick: () => onCollapse(index, 'end')
  }, /*#__PURE__*/_react.default.createElement("span", {
    className: (0, _clsx.clsx)(`${splitBarPrefixCls}-collapse-icon`, `${splitBarPrefixCls}-collapse-end`)
  }, endIcon))));
};
var _default = exports.default = SplitBar;