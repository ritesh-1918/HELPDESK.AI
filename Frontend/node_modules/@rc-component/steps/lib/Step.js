"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = Step;
var React = _interopRequireWildcard(require("react"));
var _clsx = require("clsx");
var _KeyCode = _interopRequireDefault(require("@rc-component/util/lib/KeyCode"));
var _Rail = _interopRequireDefault(require("./Rail"));
var _UnstableContext = require("./UnstableContext");
var _StepIcon = _interopRequireWildcard(require("./StepIcon"));
var _Context = require("./Context");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } /* eslint react/prop-types: 0 */
function hasContent(value) {
  return value !== undefined && value !== null;
}
function Step(props) {
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
  } = React.useContext(_UnstableContext.UnstableContext);
  const {
    ItemComponent
  } = React.useContext(_Context.StepsContext);

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
      if (which === _KeyCode.default.ENTER || which === _KeyCode.default.SPACE) {
        onClick(index);
      }
    };
  }

  // ========================= Render =========================
  const mergedStatus = status || 'wait';
  const hasTitle = hasContent(title);
  const hasSubTitle = hasContent(subTitle);
  const classString = (0, _clsx.clsx)(itemCls, `${itemCls}-${mergedStatus}`, {
    [`${itemCls}-custom`]: icon,
    [`${itemCls}-active`]: active,
    [`${itemCls}-disabled`]: disabled === true,
    [`${itemCls}-empty-header`]: !hasTitle && !hasSubTitle
  }, className, classNames.item, itemClassNames.root);
  let iconNode = /*#__PURE__*/React.createElement(_StepIcon.default, null);
  if (iconRender) {
    iconNode = iconRender(iconNode, {
      ...renderInfo,
      components: {
        Icon: _StepIcon.default
      }
    });
  }
  const wrapperNode = /*#__PURE__*/React.createElement("div", {
    className: (0, _clsx.clsx)(`${itemCls}-wrapper`, classNames.itemWrapper, itemClassNames.wrapper),
    style: {
      ...styles.itemWrapper,
      ...itemStyles.wrapper
    }
  }, /*#__PURE__*/React.createElement(_StepIcon.StepIconSemanticContext.Provider, {
    value: {
      className: itemClassNames.icon,
      style: itemStyles.icon
    }
  }, iconNode), /*#__PURE__*/React.createElement("div", {
    className: (0, _clsx.clsx)(`${itemCls}-section`, classNames.itemSection, itemClassNames.section),
    style: {
      ...styles.itemSection,
      ...itemStyles.section
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: (0, _clsx.clsx)(`${itemCls}-header`, classNames.itemHeader, itemClassNames.header),
    style: {
      ...styles.itemHeader,
      ...itemStyles.header
    }
  }, hasTitle && /*#__PURE__*/React.createElement("div", {
    className: (0, _clsx.clsx)(`${itemCls}-title`, classNames.itemTitle, itemClassNames.title),
    style: {
      ...styles.itemTitle,
      ...itemStyles.title
    }
  }, title), hasSubTitle && /*#__PURE__*/React.createElement("div", {
    title: typeof subTitle === 'string' ? subTitle : undefined,
    className: (0, _clsx.clsx)(`${itemCls}-subtitle`, classNames.itemSubtitle, itemClassNames.subtitle),
    style: {
      ...styles.itemSubtitle,
      ...itemStyles.subtitle
    }
  }, subTitle), !last && /*#__PURE__*/React.createElement(_Rail.default, {
    prefixCls: itemCls,
    className: (0, _clsx.clsx)(classNames.itemRail, itemClassNames.rail),
    style: {
      ...styles.itemRail,
      ...itemStyles.rail
    },
    status: railFollowPrevStatus ? status : nextStatus
  })), hasContent(mergedContent) && /*#__PURE__*/React.createElement("div", {
    className: (0, _clsx.clsx)(`${itemCls}-content`, classNames.itemContent, itemClassNames.content),
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