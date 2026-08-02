function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
import { clsx } from 'clsx';
import CSSMotion from '@rc-component/motion';
import useLayoutEffect from "@rc-component/util/es/hooks/useLayoutEffect";
import * as React from 'react';
import { TreeContext } from "./contextTypes";
import TreeNode from "./TreeNode";
import useUnmount from "./useUnmount";
import { getTreeNodeProps } from "./utils/treeUtil";
const MotionTreeNode = /*#__PURE__*/React.forwardRef((oriProps, ref) => {
  const {
    className,
    style,
    motion,
    motionNodes,
    motionType,
    onMotionStart: onOriginMotionStart,
    onMotionEnd: onOriginMotionEnd,
    active,
    treeNodeRequiredProps,
    ...props
  } = oriProps;
  const [visible, setVisible] = React.useState(true);
  const {
    prefixCls
  } = React.useContext(TreeContext);

  // Calculate target visible here.
  // And apply in effect to make `leave` motion work.
  const targetVisible = motionNodes && motionType !== 'hide';
  useLayoutEffect(() => {
    if (motionNodes) {
      if (targetVisible !== visible) {
        setVisible(targetVisible);
      }
    }
  }, [motionNodes]);
  const triggerMotionStart = () => {
    if (motionNodes) {
      onOriginMotionStart();
    }
  };

  // Should only trigger once
  const triggerMotionEndRef = React.useRef(false);
  const triggerMotionEnd = () => {
    if (motionNodes && !triggerMotionEndRef.current) {
      triggerMotionEndRef.current = true;
      onOriginMotionEnd();
    }
  };

  // Effect if unmount
  useUnmount(triggerMotionStart, triggerMotionEnd);

  // Motion end event
  const onVisibleChanged = nextVisible => {
    if (targetVisible === nextVisible) {
      triggerMotionEnd();
    }
  };
  if (motionNodes) {
    return /*#__PURE__*/React.createElement(CSSMotion, _extends({
      ref: ref,
      visible: visible
    }, motion, {
      motionAppear: motionType === 'show',
      onVisibleChanged: onVisibleChanged
    }), ({
      className: motionClassName,
      style: motionStyle
    }, motionRef) => /*#__PURE__*/React.createElement("div", {
      ref: motionRef,
      className: clsx(`${prefixCls}-treenode-motion`, motionClassName),
      style: motionStyle
    }, motionNodes.map(treeNode => {
      const {
        data: {
          ...restProps
        },
        title,
        key,
        isStart,
        isEnd
      } = treeNode;
      delete restProps.children;
      const treeNodeProps = getTreeNodeProps(key, treeNodeRequiredProps);
      return /*#__PURE__*/React.createElement(TreeNode, _extends({}, restProps, treeNodeProps, {
        title: title,
        active: active,
        data: treeNode.data,
        key: key,
        isStart: isStart,
        isEnd: isEnd
      }));
    })));
  }
  return /*#__PURE__*/React.createElement(TreeNode, _extends({
    domRef: ref,
    className: className,
    style: style
  }, props, {
    active: active
  }));
});
if (process.env.NODE_ENV !== 'production') {
  MotionTreeNode.displayName = 'MotionTreeNode';
}
export default MotionTreeNode;