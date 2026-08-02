import { getTransitionName } from '../../_util/motion';
const motion = {
  motionAppear: false,
  motionEnter: true,
  motionLeave: true
};
export default function useAnimateConfig(prefixCls, animated = {
  inkBar: true,
  tabPane: false
}) {
  let mergedAnimated;
  if (animated === false) {
    mergedAnimated = {
      inkBar: false,
      tabPane: false
    };
  } else if (animated === true) {
    mergedAnimated = {
      inkBar: true,
      tabPane: true
    };
  } else {
    mergedAnimated = {
      inkBar: true,
      ...(typeof animated === 'object' ? animated : {})
    };
  }
  if (mergedAnimated.tabPane) {
    mergedAnimated.tabPaneMotion = {
      ...motion,
      motionName: getTransitionName(prefixCls, 'switch')
    };
  }
  return mergedAnimated;
}