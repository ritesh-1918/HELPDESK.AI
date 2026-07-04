function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
import { clsx } from 'clsx';
import CSSMotion from '@rc-component/motion';
import * as React from 'react';
import TabContext from "../TabContext";
import TabPane from "./TabPane";
const TabPanelList = props => {
  const {
    id,
    activeKey,
    animated,
    tabPosition,
    destroyOnHidden,
    contentStyle,
    contentClassName
  } = props;
  const {
    prefixCls,
    tabs
  } = React.useContext(TabContext);
  const tabPaneAnimated = animated.tabPane;
  const tabPanePrefixCls = `${prefixCls}-tabpane`;
  return /*#__PURE__*/React.createElement("div", {
    className: clsx(`${prefixCls}-content-holder`)
  }, /*#__PURE__*/React.createElement("div", {
    className: clsx(`${prefixCls}-content`, `${prefixCls}-content-${tabPosition}`, {
      [`${prefixCls}-content-animated`]: tabPaneAnimated
    })
  }, tabs.map(item => {
    const {
      key,
      forceRender,
      style: paneStyle,
      className: paneClassName,
      destroyOnHidden: itemDestroyOnHidden,
      ...restTabProps
    } = item;
    const active = key === activeKey;
    return /*#__PURE__*/React.createElement(CSSMotion, _extends({
      key: key,
      visible: active,
      forceRender: forceRender,
      removeOnLeave: !!(destroyOnHidden ?? itemDestroyOnHidden),
      leavedClassName: `${tabPanePrefixCls}-hidden`
    }, animated.tabPaneMotion), ({
      style: motionStyle,
      className: motionClassName
    }, ref) => /*#__PURE__*/React.createElement(TabPane, _extends({}, restTabProps, {
      prefixCls: tabPanePrefixCls,
      id: id,
      tabKey: key,
      animated: tabPaneAnimated,
      active: active,
      style: {
        ...contentStyle,
        ...paneStyle,
        ...motionStyle
      },
      className: clsx(contentClassName, paneClassName, motionClassName),
      ref: ref
    })));
  })));
};
export default TabPanelList;