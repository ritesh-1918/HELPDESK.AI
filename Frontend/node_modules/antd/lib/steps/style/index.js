"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.prepareComponentToken = exports.default = void 0;
var _style = require("../../style");
var _internal = require("../../theme/internal");
var _genStyleUtils = require("../../theme/util/genStyleUtils");
var _horizontal = _interopRequireDefault(require("./horizontal"));
var _icon = _interopRequireDefault(require("./icon"));
var _inline = _interopRequireDefault(require("./inline"));
var _labelPlacement = _interopRequireDefault(require("./label-placement"));
var _nav = _interopRequireDefault(require("./nav"));
var _panel = _interopRequireDefault(require("./panel"));
var _progress = _interopRequireDefault(require("./progress"));
var _progressDot = _interopRequireDefault(require("./progress-dot"));
var _rtl = _interopRequireDefault(require("./rtl"));
var _small = _interopRequireDefault(require("./small"));
var _status = _interopRequireDefault(require("./status"));
var _vertical = _interopRequireDefault(require("./vertical"));
const genBasicStyle = token => {
  const {
    componentCls,
    antCls
  } = token;
  const itemCls = `${componentCls}-item`;
  const [varName, varRef] = (0, _genStyleUtils.genCssVar)(antCls, 'cmp-steps');
  return {
    [componentCls]: {
      [varName('title-font-size')]: token.fontSizeLG,
      [varName('title-line-height')]: token.lineHeightLG,
      [varName('subtitle-font-size')]: token.fontSize,
      [varName('subtitle-line-height')]: token.lineHeight,
      [varName('item-wrapper-padding-top')]: '0px',
      [varName('rail-size')]: token.lineWidth,
      [varName('rail-line-style')]: token.lineType,
      ...(0, _style.resetComponent)(token),
      display: 'flex',
      flexWrap: 'nowrap',
      alignItems: 'flex-start',
      [itemCls]: {
        flex: 'none',
        position: 'relative'
      },
      [`${itemCls}-wrapper`]: {
        display: 'flex',
        flexWrap: 'nowrap',
        paddingTop: varRef('item-wrapper-padding-top')
      },
      // Icon
      // Check `./icon.ts`
      // Header
      [`${itemCls}-header`]: {
        display: 'flex',
        flexWrap: 'nowrap',
        alignItems: 'center'
      },
      // >>> Title
      [`${itemCls}-title`]: {
        color: token.colorText,
        fontSize: varRef('title-font-size'),
        lineHeight: varRef('title-line-height'),
        wordBreak: 'break-word'
      },
      // >>> Sub Title
      [`${itemCls}-subtitle`]: {
        color: token.colorTextDescription,
        fontWeight: 'normal',
        fontSize: varRef('subtitle-font-size'),
        lineHeight: varRef('subtitle-line-height'),
        marginInlineStart: token.marginXS,
        wordBreak: 'break-word'
      },
      // Content
      [`${itemCls}-content`]: {
        color: token.colorTextDescription,
        fontSize: token.fontSize,
        lineHeight: token.lineHeight,
        wordBreak: 'break-word'
      },
      // Rail
      [`${itemCls}-rail`]: {
        borderStyle: varRef('rail-line-style'),
        borderWidth: 0
      },
      // Motion
      [`${itemCls}-title, ${itemCls}-subtitle, ${itemCls}-content, ${itemCls}-rail`]: {
        transition: `all ${token.motionDurationSlow}`
      },
      // ========================== Ellipsis ==========================
      [`&${componentCls}-ellipsis`]: {
        [`${itemCls}-title, ${itemCls}-subtitle, ${itemCls}-content`]: _style.textEllipsis
      },
      // ========================= Clickable ==========================
      [`${itemCls}[role='button']:not(${itemCls}-active):hover`]: {
        cursor: 'pointer'
      }
    }
  };
};
// ============================== Export ==============================
const prepareComponentToken = token => ({
  titleLineHeight: token.controlHeight,
  customIconSize: token.controlHeight,
  customIconTop: 0,
  customIconFontSize: token.controlHeightSM,
  iconSize: token.controlHeight,
  iconTop: -0.5,
  // magic for ui experience
  iconFontSize: token.fontSize,
  iconSizeSM: token.fontSizeHeading3,
  dotSize: token.controlHeight / 4,
  dotCurrentSize: token.controlHeightLG / 4,
  navArrowColor: token.colorTextDisabled,
  navContentMaxWidth: 'unset',
  descriptionMaxWidth: undefined,
  // should be `undefined` to create css var
  waitIconColor: token.wireframe ? token.colorTextDisabled : token.colorTextLabel,
  waitIconBgColor: token.wireframe ? token.colorBgContainer : token.colorFillContent,
  waitIconBorderColor: token.wireframe ? token.colorTextDisabled : 'transparent',
  finishIconBgColor: token.wireframe ? token.colorBgContainer : token.controlItemBgActive,
  finishIconBorderColor: token.wireframe ? token.colorPrimary : token.controlItemBgActive
});
exports.prepareComponentToken = prepareComponentToken;
var _default = exports.default = (0, _internal.genStyleHooks)('Steps', token => {
  const stepsToken = (0, _internal.mergeToken)(token, {
    inlineDotSize: 6
  });
  return [genBasicStyle(stepsToken), (0, _icon.default)(stepsToken), (0, _vertical.default)(stepsToken), (0, _horizontal.default)(stepsToken), (0, _labelPlacement.default)(stepsToken), (0, _small.default)(stepsToken), (0, _progressDot.default)(stepsToken), (0, _status.default)(stepsToken), (0, _nav.default)(stepsToken), (0, _panel.default)(stepsToken), (0, _inline.default)(stepsToken), (0, _progress.default)(stepsToken), (0, _rtl.default)(stepsToken)];
}, prepareComponentToken);