const genCollapseMotion = token => {
  const {
    componentCls,
    antCls,
    motionDurationMid,
    motionEaseInOut
  } = token;
  return {
    [componentCls]: {
      // For common/openAnimation
      [`${antCls}-motion-collapse-legacy`]: {
        overflow: 'hidden',
        '&-active': {
          transition: `${['height', 'opacity'].map(prop => `${prop} ${motionDurationMid} ${motionEaseInOut}`).join(', ')} !important`
        }
      },
      [`${antCls}-motion-collapse`]: {
        overflow: 'hidden',
        transition: `${['height', 'opacity'].map(prop => `${prop} ${motionDurationMid} ${motionEaseInOut}`).join(', ')} !important`
      }
    }
  };
};
export default genCollapseMotion;