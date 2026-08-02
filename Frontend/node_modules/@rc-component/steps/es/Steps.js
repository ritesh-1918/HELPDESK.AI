function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
/* eslint react/no-did-mount-set-state: 0, react/prop-types: 0 */
import { clsx } from 'clsx';
import React from 'react';
import Step from "./Step";
import { StepsContext } from "./Context";
const EmptyObject = {};
export default function Steps(props) {
  const {
    // style
    prefixCls = 'rc-steps',
    style,
    className,
    classNames = EmptyObject,
    styles = EmptyObject,
    rootClassName,
    // layout
    orientation,
    titlePlacement,
    components,
    // data
    status = 'process',
    current = 0,
    initial = 0,
    onChange,
    items,
    // render
    iconRender,
    itemRender,
    itemWrapperRender,
    ...restProps
  } = props;

  // ============================= layout =============================
  const isVertical = orientation === 'vertical';
  const mergedOrientation = isVertical ? 'vertical' : 'horizontal';
  const mergeTitlePlacement = !isVertical && titlePlacement === 'vertical' ? 'vertical' : 'horizontal';

  // ============================= styles =============================
  const classString = clsx(prefixCls, `${prefixCls}-${mergedOrientation}`, `${prefixCls}-title-${mergeTitlePlacement}`, rootClassName, className, classNames.root);

  // ============================== Data ==============================
  const mergedItems = React.useMemo(() => (items || []).filter(Boolean), [items]);
  const statuses = React.useMemo(() => mergedItems.map(({
    status: itemStatus
  }, index) => {
    const stepNumber = initial + index;
    if (!itemStatus) {
      if (stepNumber === current) {
        return status;
      } else if (stepNumber < current) {
        return 'finish';
      }
      return 'wait';
    }
    return itemStatus;
  }), [mergedItems, status, current, initial]);

  // ============================= events =============================
  const onStepClick = next => {
    if (onChange && current !== next) {
      onChange(next);
    }
  };

  // =========================== components ===========================
  const {
    root: RootComponent = 'div',
    item: ItemComponent = 'div'
  } = components || {};

  // ============================ contexts ============================
  const stepIconContext = React.useMemo(() => ({
    prefixCls,
    classNames,
    styles,
    ItemComponent
  }), [prefixCls, classNames, styles, ItemComponent]);

  // ============================= render =============================
  const renderStep = (item, index) => {
    const stepIndex = initial + index;
    const itemStatus = statuses[index];
    const nextStatus = statuses[index + 1];
    const data = {
      ...item,
      status: itemStatus
    };
    return /*#__PURE__*/React.createElement(Step, {
      key: stepIndex
      // Style
      ,
      prefixCls: prefixCls,
      classNames: classNames,
      styles: styles
      // Data
      ,
      data: data,
      nextStatus: nextStatus,
      active: stepIndex === current,
      index: stepIndex,
      last: mergedItems.length - 1 === index
      // Render
      ,
      iconRender: iconRender,
      itemRender: itemRender,
      itemWrapperRender: itemWrapperRender,
      onClick: onChange && onStepClick
    });
  };
  return /*#__PURE__*/React.createElement(RootComponent, _extends({
    className: classString,
    style: {
      ...style,
      ...styles?.root
    }
  }, restProps), /*#__PURE__*/React.createElement(StepsContext.Provider, {
    value: stepIconContext
  }, mergedItems.map(renderStep)));
}