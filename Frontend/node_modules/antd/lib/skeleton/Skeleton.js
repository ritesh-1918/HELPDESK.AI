"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _clsx = require("clsx");
var _hooks = require("../_util/hooks");
var _context = require("../config-provider/context");
var _Avatar = _interopRequireDefault(require("./Avatar"));
var _Button = _interopRequireDefault(require("./Button"));
var _Element = _interopRequireDefault(require("./Element"));
var _Image = _interopRequireDefault(require("./Image"));
var _Input = _interopRequireDefault(require("./Input"));
var _Node = _interopRequireDefault(require("./Node"));
var _Paragraph = _interopRequireDefault(require("./Paragraph"));
var _style = _interopRequireDefault(require("./style"));
var _Title = _interopRequireDefault(require("./Title"));
function getComponentProps(prop) {
  if (prop && typeof prop === 'object') {
    return prop;
  }
  return {};
}
function getAvatarBasicProps(hasTitle, hasParagraph) {
  if (hasTitle && !hasParagraph) {
    // Square avatar
    return {
      size: 'large',
      shape: 'square'
    };
  }
  return {
    size: 'large',
    shape: 'circle'
  };
}
function getTitleBasicProps(hasAvatar, hasParagraph) {
  if (!hasAvatar && hasParagraph) {
    return {
      width: '38%'
    };
  }
  if (hasAvatar && hasParagraph) {
    return {
      width: '50%'
    };
  }
  return {};
}
function getParagraphBasicProps(hasAvatar, hasTitle) {
  const basicProps = {};
  // Width
  if (!hasAvatar || !hasTitle) {
    basicProps.width = '61%';
  }
  // Rows
  if (!hasAvatar && hasTitle) {
    basicProps.rows = 3;
  } else {
    basicProps.rows = 2;
  }
  return basicProps;
}
// Tips: ctx.classNames.root < ctx.className < cpns.classNames.root < cpns.className < rootClassName
const Skeleton = props => {
  const {
    prefixCls: customizePrefixCls,
    loading,
    className,
    rootClassName,
    classNames,
    style,
    styles,
    children,
    avatar = false,
    title = true,
    paragraph = true,
    active,
    round
  } = props;
  const {
    getPrefixCls,
    direction,
    className: contextClassName,
    style: contextStyle,
    classNames: contextClassNames,
    styles: contextStyles
  } = (0, _context.useComponentConfig)('skeleton');
  const prefixCls = getPrefixCls('skeleton', customizePrefixCls);
  const [hashId, cssVarCls] = (0, _style.default)(prefixCls);
  const mergedProps = {
    ...props,
    avatar,
    title,
    paragraph
  };
  const [mergedClassNames, mergedStyles] = (0, _hooks.useMergeSemantic)([contextClassNames, classNames], [contextStyles, styles], {
    props: mergedProps
  });
  if (loading || !('loading' in props)) {
    const hasAvatar = !!avatar;
    const hasTitle = !!title;
    const hasParagraph = !!paragraph;
    // Avatar
    let avatarNode;
    if (hasAvatar) {
      const avatarProps = {
        className: mergedClassNames.avatar,
        prefixCls: `${prefixCls}-avatar`,
        ...getAvatarBasicProps(hasTitle, hasParagraph),
        ...getComponentProps(avatar),
        style: mergedStyles.avatar
      };
      // We direct use SkeletonElement as avatar in skeleton internal.
      avatarNode = /*#__PURE__*/React.createElement("div", {
        className: (0, _clsx.clsx)(mergedClassNames.header, `${prefixCls}-header`),
        style: mergedStyles.header
      }, /*#__PURE__*/React.createElement(_Element.default, {
        ...avatarProps
      }));
    }
    let contentNode;
    if (hasTitle || hasParagraph) {
      // Title
      let $title;
      if (hasTitle) {
        const titleProps = {
          className: mergedClassNames.title,
          prefixCls: `${prefixCls}-title`,
          ...getTitleBasicProps(hasAvatar, hasParagraph),
          ...getComponentProps(title),
          style: mergedStyles.title
        };
        $title = /*#__PURE__*/React.createElement(_Title.default, {
          ...titleProps
        });
      }
      // Paragraph
      let paragraphNode;
      if (hasParagraph) {
        const paragraphProps = {
          className: mergedClassNames.paragraph,
          prefixCls: `${prefixCls}-paragraph`,
          ...getParagraphBasicProps(hasAvatar, hasTitle),
          ...getComponentProps(paragraph),
          style: mergedStyles.paragraph
        };
        paragraphNode = /*#__PURE__*/React.createElement(_Paragraph.default, {
          ...paragraphProps
        });
      }
      contentNode = /*#__PURE__*/React.createElement("div", {
        className: (0, _clsx.clsx)(mergedClassNames.section, `${prefixCls}-section`),
        style: mergedStyles.section
      }, $title, paragraphNode);
    }
    const cls = (0, _clsx.clsx)(prefixCls, {
      [`${prefixCls}-with-avatar`]: hasAvatar,
      [`${prefixCls}-active`]: active,
      [`${prefixCls}-rtl`]: direction === 'rtl',
      [`${prefixCls}-round`]: round
    }, mergedClassNames.root, contextClassName, className, rootClassName, hashId, cssVarCls);
    return /*#__PURE__*/React.createElement("div", {
      className: cls,
      style: {
        ...mergedStyles.root,
        ...contextStyle,
        ...style
      }
    }, avatarNode, contentNode);
  }
  return children ?? null;
};
Skeleton.Button = _Button.default;
Skeleton.Avatar = _Avatar.default;
Skeleton.Input = _Input.default;
Skeleton.Image = _Image.default;
Skeleton.Node = _Node.default;
if (process.env.NODE_ENV !== 'production') {
  Skeleton.displayName = 'Skeleton';
}
var _default = exports.default = Skeleton;