"use strict";
"use client";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _clsx = require("clsx");
var _hooks = require("../_util/hooks");
var _context = require("../config-provider/context");
const CardMeta = props => {
  const {
    prefixCls: customizePrefixCls,
    className,
    avatar,
    title,
    description,
    style,
    classNames: cardMetaClassNames,
    styles,
    ...restProps
  } = props;
  const {
    getPrefixCls,
    className: contextClassName,
    style: contextStyle,
    classNames: contextClassNames,
    styles: contextStyles
  } = (0, _context.useComponentConfig)('cardMeta');
  const prefixCls = getPrefixCls('card', customizePrefixCls);
  const metaPrefixCls = `${prefixCls}-meta`;
  const [mergedClassNames, mergedStyles] = (0, _hooks.useMergeSemantic)([contextClassNames, cardMetaClassNames], [contextStyles, styles], {
    props
  });
  const rootClassNames = (0, _clsx.clsx)(metaPrefixCls, className, contextClassName, mergedClassNames.root);
  const rootStyles = {
    ...contextStyle,
    ...mergedStyles.root,
    ...style
  };
  const avatarClassNames = (0, _clsx.clsx)(`${metaPrefixCls}-avatar`, mergedClassNames.avatar);
  const titleClassNames = (0, _clsx.clsx)(`${metaPrefixCls}-title`, mergedClassNames.title);
  const descriptionClassNames = (0, _clsx.clsx)(`${metaPrefixCls}-description`, mergedClassNames.description);
  const sectionClassNames = (0, _clsx.clsx)(`${metaPrefixCls}-section`, mergedClassNames.section);
  const avatarDom = avatar ? (/*#__PURE__*/React.createElement("div", {
    className: avatarClassNames,
    style: mergedStyles.avatar
  }, avatar)) : null;
  const titleDom = title ? (/*#__PURE__*/React.createElement("div", {
    className: titleClassNames,
    style: mergedStyles.title
  }, title)) : null;
  const descriptionDom = description ? (/*#__PURE__*/React.createElement("div", {
    className: descriptionClassNames,
    style: mergedStyles.description
  }, description)) : null;
  const MetaDetail = titleDom || descriptionDom ? (/*#__PURE__*/React.createElement("div", {
    className: sectionClassNames,
    style: mergedStyles.section
  }, titleDom, descriptionDom)) : null;
  return /*#__PURE__*/React.createElement("div", {
    ...restProps,
    className: rootClassNames,
    style: rootStyles
  }, avatarDom, MetaDetail);
};
if (process.env.NODE_ENV !== 'production') {
  CardMeta.displayName = 'CardMeta';
}
var _default = exports.default = CardMeta;