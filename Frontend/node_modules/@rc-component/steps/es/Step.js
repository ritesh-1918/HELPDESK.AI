function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
/* eslint react/prop-types: 0 */
import * as React from 'react';
import { clsx } from 'clsx';
import KeyCode from "@rc-component/util/es/KeyCode";
import Rail from "./Rail";
import { UnstableContext } from "./UnstableContext";
import StepIcon, { StepIconSemanticContext } from "./StepIcon";
import { StepsContext } from "./Context";
function hasContent(value) {
  return value !== undefined && value !== null;
}
export default function Step(props) {
  const {
    // style
    prefixCls,
    classNames,
    styles,
    // data
    data,
    last,
    nextStatus,
    active,
    index,
    // render
    itemRender,
    iconRender,
    itemWrapperRender,
    // events
    onClick
  } = props;
  const itemCls = `${prefixCls}-item`;

  // ======================== Contexts ========================
  const {
    railFollowPrevStatus
  } = React.useContext(UnstableContext);
  const {
    ItemComponent
  } = React.useContext(StepsContext);

  // ========================== Data ==========================
  const {
    onClick: onItemClick,
    title,
    subTitle,
    content,
    description,
    disabled,
    icon,
    status,
    className,
    style,
    classNames: itemClassNames = {},
    styles: itemStyles = {},
    ...restItemProps
  } = data;
  const mergedContent = content ?? description;
  const renderInfo = {
    item: {
      ...data,
      content: mergedContent
    },
    index,
    active
  };

  // ========================= Click ==========================
  const clickable = !!(onClick || onItemClick) && !disabled;
  const accessibilityProps = {};
  if (clickable) {
    accessibilityProps.role = 'button';
    accessibilityProps.tabIndex = 0;
    accessibilityProps.onClick = e => {
      onItemClick?.(e);
      onClick(index);
    };
    accessibilityProps.onKeyDown = e => {
      const {
        which
      } = e;
      if (which === KeyCode.ENTER || which === KeyCode.SPACE) {
        onClick(index);
      }
    };
  }

  // ========================= Render =========================
  const mergedStatus = status || 'wait';
  const hasTitle = hasContent(title);
  const hasSubTitle = hasContent(subTitle);
  const classString = clsx(itemCls, `${itemCls}-${mergedStatus}`, {
    [`${itemCls}-custom`]: icon,
    [`${itemCls}-active`]: active,
    [`${itemCls}-disabled`]: disabled === true,
    [`${itemCls}-empty-header`]: !hasTitle && !hasSubTitle
  }, className, classNames.item, itemClassNames.root);
  let iconNode = /*#__PURE__*/React.createElement(StepIcon, null);
  if (iconRender) {
    iconNode = iconRender(iconNode, {
      ...renderInfo,
      components: {
        Icon: StepIcon
      }
    });
  }
  const wrapperNode = /*#__PURE__*/React.createElement("div", {
    className: clsx(`${itemCls}-wrapper`, classNames.itemWrapper, itemClassNames.wrapper),
    style: {
      ...styles.itemWrapper,
      ...itemStyles.wrapper
    }
  }, /*#__PURE__*/React.createElement(StepIconSemanticContext.Provider, {
    value: {
      className: itemClassNames.icon,
      style: itemStyles.icon
    }
  }, iconNode), /*#__PURE__*/React.createElement("div", {
    className: clsx(`${itemCls}-section`, classNames.itemSection, itemClassNames.section),
    style: {
      ...styles.itemSection,
      ...itemStyles.section
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: clsx(`${itemCls}-header`, classNames.itemHeader, itemClassNames.header),
    style: {
      ...styles.itemHeader,
      ...itemStyles.header
    }
  }, hasTitle && /*#__PURE__*/React.createElement("div", {
    className: clsx(`${itemCls}-title`, classNames.itemTitle, itemClassNames.title),
    style: {
      ...styles.itemTitle,
      ...itemStyles.title
    }
  }, title), hasSubTitle && /*#__PURE__*/React.createElement("div", {
    title: typeof subTitle === 'string' ? subTitle : undefined,
    className: clsx(`${itemCls}-subtitle`, classNames.itemSubtitle, itemClassNames.subtitle),
    style: {
      ...styles.itemSubtitle,
      ...itemStyles.subtitle
    }
  }, subTitle), !last && /*#__PURE__*/React.createElement(Rail, {
    prefixCls: itemCls,
    className: clsx(classNames.itemRail, itemClassNames.rail),
    style: {
      ...styles.itemRail,
      ...itemStyles.rail
    },
    status: railFollowPrevStatus ? status : nextStatus
  })), hasContent(mergedContent) && /*#__PURE__*/React.createElement("div", {
    className: clsx(`${itemCls}-content`, classNames.itemContent, itemClassNames.content),
    style: {
      ...styles.itemContent,
      ...itemStyles.content
    }
  }, mergedContent)));
  let stepNode = /*#__PURE__*/React.createElement(ItemComponent, _extends({}, restItemProps, accessibilityProps, {
    className: classString,
    style: {
      ...styles.item,
      ...itemStyles.root,
      ...style
    }
  }), itemWrapperRender ? itemWrapperRender(wrapperNode) : wrapperNode);
  if (itemRender) {
    stepNode = itemRender(stepNode, renderInfo) || null;
  }
  return stepNode;
}