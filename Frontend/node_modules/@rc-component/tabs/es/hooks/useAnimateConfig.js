import warning from "@rc-component/util/es/warning";
export default function useAnimateConfig(animated = {
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
      tabPane: false
    };
  } else {
    mergedAnimated = {
      inkBar: true,
      ...(typeof animated === 'object' ? animated : {})
    };
  }

  // Enable tabPane animation if provide motion
  if (mergedAnimated.tabPaneMotion && mergedAnimated.tabPane === undefined) {
    mergedAnimated.tabPane = true;
  }
  if (!mergedAnimated.tabPaneMotion && mergedAnimated.tabPane) {
    if (process.env.NODE_ENV !== 'production') {
      warning(false, '`animated.tabPane` is true but `animated.tabPaneMotion` is not provided. Motion will not work.');
    }
    mergedAnimated.tabPane = false;
  }
  return mergedAnimated;
}