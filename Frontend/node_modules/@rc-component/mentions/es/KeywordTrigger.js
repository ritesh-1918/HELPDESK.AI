import Trigger from '@rc-component/trigger';
import * as React from 'react';
import { useMemo } from 'react';
import DropdownMenu from "./DropdownMenu";
const BUILT_IN_PLACEMENTS = {
  bottomRight: {
    points: ['tl', 'br'],
    offset: [0, 4],
    overflow: {
      adjustX: 1,
      adjustY: 1
    }
  },
  bottomLeft: {
    points: ['tr', 'bl'],
    offset: [0, 4],
    overflow: {
      adjustX: 1,
      adjustY: 1
    }
  },
  topRight: {
    points: ['bl', 'tr'],
    offset: [0, -4],
    overflow: {
      adjustX: 1,
      adjustY: 1
    }
  },
  topLeft: {
    points: ['br', 'tl'],
    offset: [0, -4],
    overflow: {
      adjustX: 1,
      adjustY: 1
    }
  }
};
const KeywordTrigger = props => {
  const {
    prefixCls,
    options,
    children,
    visible,
    transitionName,
    getPopupContainer,
    popupClassName,
    popupStyle,
    direction,
    placement
  } = props;
  const dropdownPrefix = `${prefixCls}-dropdown`;
  const [opened, setOpened] = React.useState(false);
  const dropdownElement = /*#__PURE__*/React.createElement(DropdownMenu, {
    prefixCls: dropdownPrefix,
    options: options,
    opened: opened
  });
  const dropdownPlacement = useMemo(() => {
    let popupPlacement;
    if (direction === 'rtl') {
      popupPlacement = placement === 'top' ? 'topLeft' : 'bottomLeft';
    } else {
      popupPlacement = placement === 'top' ? 'topRight' : 'bottomRight';
    }
    return popupPlacement;
  }, [direction, placement]);
  return /*#__PURE__*/React.createElement(Trigger, {
    prefixCls: dropdownPrefix,
    popupVisible: visible,
    popup: dropdownElement,
    popupPlacement: dropdownPlacement,
    popupMotion: {
      motionName: transitionName
    },
    builtinPlacements: BUILT_IN_PLACEMENTS,
    getPopupContainer: getPopupContainer,
    popupClassName: popupClassName,
    popupStyle: popupStyle,
    afterOpenChange: setOpened
  }, children);
};
export default KeywordTrigger;