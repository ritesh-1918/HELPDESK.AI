function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
import * as React from 'react';
import { flushSync } from 'react-dom';
import { getIndex } from "../util";
import Handle from "./Handle";
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
      flushSync(() => {
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
    return /*#__PURE__*/React.createElement(Handle, _extends({
      ref: node => {
        if (!node) {
          delete handlesRef.current[index];
        } else {
          handlesRef.current[index] = node;
        }
      },
      dragging: dragging,
      draggingDelete: dragging && draggingDelete,
      style: getIndex(style, index),
      key: index,
      value: value,
      valueIndex: index
    }, handleProps));
  }), activeHandleRender && activeVisible && /*#__PURE__*/React.createElement(Handle, _extends({
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
export default Handles;