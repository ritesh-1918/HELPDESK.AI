"use client";

import React from 'react';
import RCTour from '@rc-component/tour';
import { clsx } from 'clsx';
import { useMergeSemantic, useZIndex } from '../_util/hooks';
import getPlacements from '../_util/placements';
import ZIndexContext from '../_util/zindexContext';
import { useComponentConfig } from '../config-provider/context';
import { useToken } from '../theme/internal';
import TourPanel from './panelRender';
import PurePanel from './PurePanel';
import useStyle from './style';
const Tour = props => {
  const {
    prefixCls: customizePrefixCls,
    type,
    rootClassName,
    indicatorsRender,
    actionsRender,
    steps,
    closeIcon,
    keyboard = true,
    classNames,
    styles,
    className,
    style,
    ...restProps
  } = props;
  const {
    getPrefixCls,
    direction,
    closeIcon: contextCloseIcon,
    className: contextClassName,
    style: contextStyle,
    classNames: contextClassNames,
    styles: contextStyles
  } = useComponentConfig('tour');
  const prefixCls = getPrefixCls('tour', customizePrefixCls);
  const [hashId, cssVarCls] = useStyle(prefixCls);
  const [, token] = useToken();
  const mergedSteps = React.useMemo(() => steps?.map(step => ({
    ...step,
    className: clsx(step.className, {
      [`${prefixCls}-primary`]: (step.type ?? type) === 'primary'
    })
  })), [prefixCls, steps, type]);
  // =========== Merged Props for Semantic ===========
  const mergedProps = {
    ...props,
    steps: mergedSteps
  };
  const [mergedClassNames, mergedStyles] = useMergeSemantic([contextClassNames, classNames], [contextStyles, styles], {
    props: mergedProps
  });
  const builtinPlacements = config => getPlacements({
    arrowPointAtCenter: config?.arrowPointAtCenter ?? true,
    autoAdjustOverflow: true,
    offset: token.marginXXS,
    arrowWidth: token.sizePopupArrow,
    borderRadius: token.borderRadius
  });
  const mergedRootClassName = clsx({
    [`${prefixCls}-rtl`]: direction === 'rtl'
  }, hashId, cssVarCls, rootClassName, contextClassName, mergedClassNames.root, className);
  const semanticStyles = {
    ...mergedStyles,
    mask: {
      ...mergedStyles.root,
      ...mergedStyles.mask,
      ...contextStyle,
      ...style
    }
  };
  const mergedRenderPanel = (stepProps, stepCurrent) => (/*#__PURE__*/React.createElement(TourPanel, {
    styles: semanticStyles,
    classNames: mergedClassNames,
    type: type,
    stepProps: stepProps,
    current: stepCurrent,
    indicatorsRender: indicatorsRender,
    actionsRender: actionsRender
  }));
  // ============================ zIndex ============================
  const [zIndex, contextZIndex] = useZIndex('Tour', restProps.zIndex);
  return /*#__PURE__*/React.createElement(ZIndexContext.Provider, {
    value: contextZIndex
  }, /*#__PURE__*/React.createElement(RCTour, {
    ...restProps,
    styles: semanticStyles,
    classNames: mergedClassNames,
    closeIcon: closeIcon ?? contextCloseIcon,
    keyboard: keyboard,
    zIndex: zIndex,
    rootClassName: mergedRootClassName,
    prefixCls: prefixCls,
    animated: true,
    renderPanel: mergedRenderPanel,
    builtinPlacements: builtinPlacements,
    steps: mergedSteps
  }));
};
if (process.env.NODE_ENV !== 'production') {
  Tour.displayName = 'Tour';
}
Tour._InternalPanelDoNotUseOrYouWillBeFired = PurePanel;
export default Tour;