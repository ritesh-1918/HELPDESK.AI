function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
import * as React from 'react';
import CSSMotion from '@rc-component/motion';
import { getMotion } from "../utils/motionUtil";
import MenuContextProvider, { MenuContext } from "../context/MenuContext";
import SubMenuList from "./SubMenuList";
export default function InlineSubMenuList({
  id,
  open,
  keyPath,
  children
}) {
  const fixedMode = 'inline';
  const {
    prefixCls,
    forceSubMenuRender,
    motion,
    defaultMotions,
    mode
  } = React.useContext(MenuContext);

  // Always use latest mode check
  const sameModeRef = React.useRef(false);
  sameModeRef.current = mode === fixedMode;

  // We record `destroy` mark here since when mode change from `inline` to others.
  // The inline list should remove when motion end.
  const [destroy, setDestroy] = React.useState(!sameModeRef.current);
  const mergedOpen = sameModeRef.current ? open : false;

  // ================================= Effect =================================
  // Reset destroy state when mode change back
  React.useEffect(() => {
    if (sameModeRef.current) {
      setDestroy(false);
    }
  }, [mode]);

  // ================================= Render =================================
  const mergedMotion = {
    ...getMotion(fixedMode, motion, defaultMotions)
  };

  // No need appear since nest inlineCollapse changed
  if (keyPath.length > 1) {
    mergedMotion.motionAppear = false;
  }

  // Hide inline list when mode changed and motion end
  const originOnVisibleChanged = mergedMotion.onVisibleChanged;
  mergedMotion.onVisibleChanged = newVisible => {
    if (!sameModeRef.current && !newVisible) {
      setDestroy(true);
    }
    return originOnVisibleChanged?.(newVisible);
  };
  if (destroy) {
    return null;
  }
  return /*#__PURE__*/React.createElement(MenuContextProvider, {
    mode: fixedMode,
    locked: !sameModeRef.current
  }, /*#__PURE__*/React.createElement(CSSMotion, _extends({
    visible: mergedOpen
  }, mergedMotion, {
    forceRender: forceSubMenuRender,
    removeOnLeave: false,
    leavedClassName: `${prefixCls}-hidden`
  }), ({
    className: motionClassName,
    style: motionStyle
  }) => {
    return /*#__PURE__*/React.createElement(SubMenuList, {
      id: id,
      className: motionClassName,
      style: motionStyle
    }, children);
  }));
}