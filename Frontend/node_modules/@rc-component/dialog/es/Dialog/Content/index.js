function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
import * as React from 'react';
import { useRef } from 'react';
import { clsx } from 'clsx';
import CSSMotion from '@rc-component/motion';
import { offset } from "../../util";
import Panel from "./Panel";
const Content = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    prefixCls,
    title,
    style,
    className,
    visible,
    forceRender,
    destroyOnHidden,
    motionName,
    ariaId,
    onVisibleChanged,
    mousePosition
  } = props;
  const dialogRef = useRef(null);
  const panelRef = useRef(null);

  // ============================== Refs ==============================
  React.useImperativeHandle(ref, () => ({
    ...panelRef.current,
    inMotion: dialogRef.current.inMotion,
    enableMotion: dialogRef.current.enableMotion
  }));

  // ============================= Style ==============================
  const [transformOrigin, setTransformOrigin] = React.useState();
  const contentStyle = {};
  if (transformOrigin) {
    contentStyle.transformOrigin = transformOrigin;
  }
  function onPrepare() {
    if (!dialogRef.current?.nativeElement) {
      return;
    }
    const elementOffset = offset(dialogRef.current.nativeElement);
    setTransformOrigin(mousePosition && (mousePosition.x || mousePosition.y) ? `${mousePosition.x - elementOffset.left}px ${mousePosition.y - elementOffset.top}px` : '');
  }

  // ============================= Render =============================
  return /*#__PURE__*/React.createElement(CSSMotion, {
    visible: visible,
    onVisibleChanged: onVisibleChanged,
    onAppearPrepare: onPrepare,
    onEnterPrepare: onPrepare,
    forceRender: forceRender,
    motionName: motionName,
    removeOnLeave: destroyOnHidden,
    ref: dialogRef
  }, ({
    className: motionClassName,
    style: motionStyle
  }, motionRef) => /*#__PURE__*/React.createElement(Panel, _extends({}, props, {
    ref: panelRef,
    title: title,
    ariaId: ariaId,
    prefixCls: prefixCls,
    holderRef: motionRef,
    style: {
      ...motionStyle,
      ...style,
      ...contentStyle
    },
    className: clsx(className, motionClassName)
  })));
});
if (process.env.NODE_ENV !== 'production') {
  Content.displayName = 'Content';
}
export default Content;