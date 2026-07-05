const getBuiltInPlacements = popupOverflow => {
  const htmlRegion = popupOverflow === 'scroll' ? 'scroll' : 'visible';
  const sharedConfig = {
    overflow: {
      adjustX: true,
      adjustY: true,
      shiftY: true
    },
    htmlRegion,
    dynamicInset: true
  };
  return {
    bottomLeft: {
      ...sharedConfig,
      points: ['tl', 'bl'],
      offset: [0, 4]
    },
    bottomRight: {
      ...sharedConfig,
      points: ['tr', 'br'],
      offset: [0, 4]
    },
    topLeft: {
      ...sharedConfig,
      points: ['bl', 'tl'],
      offset: [0, -4]
    },
    topRight: {
      ...sharedConfig,
      points: ['br', 'tr'],
      offset: [0, -4]
    }
  };
};
function mergedBuiltinPlacements(buildInPlacements, popupOverflow) {
  return buildInPlacements || getBuiltInPlacements(popupOverflow);
}
export default mergedBuiltinPlacements;