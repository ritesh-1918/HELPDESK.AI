function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
import Trigger from '@rc-component/trigger';
import useId from "@rc-component/util/es/hooks/useId";
import { clsx } from 'clsx';
import * as React from 'react';
import { useImperativeHandle, useRef } from 'react';
import { placements } from "./placements";
import Popup from "./Popup";
const Tooltip = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    trigger = ['hover'],
    mouseEnterDelay = 0,
    mouseLeaveDelay = 0.1,
    prefixCls = 'rc-tooltip',
    children,
    onVisibleChange,
    afterVisibleChange,
    motion,
    placement = 'right',
    align = {},
    destroyOnHidden = false,
    defaultVisible,
    getTooltipContainer,
    arrowContent,
    overlay,
    id,
    showArrow = true,
    classNames,
    styles,
    ...restProps
  } = props;
  const mergedId = useId(id);
  const triggerRef = useRef(null);
  useImperativeHandle(ref, () => triggerRef.current);
  const extraProps = {
    ...restProps
  };
  if ('visible' in props) {
    extraProps.popupVisible = props.visible;
  }

  // ========================= Arrow ==========================
  // Process arrow configuration
  const mergedArrow = React.useMemo(() => {
    if (!showArrow) {
      return false;
    }

    // Convert true to object for unified processing
    const arrowConfig = showArrow === true ? {} : showArrow;

    // Apply semantic styles with unified logic
    return {
      ...arrowConfig,
      className: clsx(arrowConfig.className, classNames?.arrow),
      style: {
        ...arrowConfig.style,
        ...styles?.arrow
      },
      content: arrowConfig.content ?? arrowContent
    };
  }, [showArrow, classNames?.arrow, styles?.arrow, arrowContent]);

  // ======================== Children ========================
  const getChildren = ({
    open
  }) => {
    const child = React.Children.only(children);
    const ariaProps = {
      'aria-describedby': overlay && open ? mergedId : undefined
    };
    return /*#__PURE__*/React.cloneElement(child, ariaProps);
  };

  // ========================= Render =========================
  return /*#__PURE__*/React.createElement(Trigger, _extends({
    popupClassName: classNames?.root,
    prefixCls: prefixCls,
    popup: /*#__PURE__*/React.createElement(Popup, {
      key: "content",
      prefixCls: prefixCls,
      id: mergedId,
      classNames: classNames,
      styles: styles
    }, overlay),
    action: trigger,
    builtinPlacements: placements,
    popupPlacement: placement,
    ref: triggerRef,
    popupAlign: align,
    getPopupContainer: getTooltipContainer,
    onOpenChange: onVisibleChange,
    afterOpenChange: afterVisibleChange,
    popupMotion: motion,
    defaultPopupVisible: defaultVisible,
    autoDestroy: destroyOnHidden,
    mouseLeaveDelay: mouseLeaveDelay,
    popupStyle: styles?.root,
    mouseEnterDelay: mouseEnterDelay,
    arrow: mergedArrow,
    uniqueContainerClassName: classNames?.uniqueContainer,
    uniqueContainerStyle: styles?.uniqueContainer
  }, extraProps), getChildren);
});
export default Tooltip;