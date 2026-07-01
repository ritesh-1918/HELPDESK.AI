"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.prepareToken = exports.prepareComponentToken = void 0;
var _cssinjs = require("@ant-design/cssinjs");
var _color = require("../../color-picker/color");
var _ColorPresets = require("../../color-picker/components/ColorPresets");
var _interface = require("../../theme/interface");
var _internal = require("../../theme/internal");
var _getAlphaColor = _interopRequireDefault(require("../../theme/util/getAlphaColor"));
const prepareToken = token => {
  const {
    paddingInline,
    onlyIconSize,
    borderColorDisabled
  } = token;
  const buttonToken = (0, _internal.mergeToken)(token, {
    buttonPaddingHorizontal: paddingInline,
    buttonPaddingVertical: 0,
    buttonIconOnlyFontSize: onlyIconSize,
    colorBorderDisabled: borderColorDisabled
  });
  return buttonToken;
};
exports.prepareToken = prepareToken;
const prepareComponentToken = token => {
  const contentFontSize = token.contentFontSize ?? token.fontSize;
  const contentFontSizeSM = token.contentFontSizeSM ?? token.fontSize;
  const contentFontSizeLG = token.contentFontSizeLG ?? token.fontSizeLG;
  const contentLineHeight = token.contentLineHeight ?? (0, _internal.getLineHeight)(contentFontSize);
  const contentLineHeightSM = token.contentLineHeightSM ?? (0, _internal.getLineHeight)(contentFontSizeSM);
  const contentLineHeightLG = token.contentLineHeightLG ?? (0, _internal.getLineHeight)(contentFontSizeLG);
  const solidTextColor = (0, _ColorPresets.isBright)(new _color.AggregationColor(token.colorBgSolid), '#fff') ? '#000' : '#fff';
  const shadowColorTokens = _interface.PresetColors.reduce((prev, colorKey) => ({
    ...prev,
    [`${colorKey}ShadowColor`]: `0 ${(0, _cssinjs.unit)(token.controlOutlineWidth)} 0 ${(0, _getAlphaColor.default)(token[`${colorKey}1`], token.colorBgContainer)}`
  }), {});
  const defaultBgDisabled = token.colorBgContainerDisabled;
  const dashedBgDisabled = token.colorBgContainerDisabled;
  return {
    ...shadowColorTokens,
    fontWeight: 400,
    iconGap: token.marginXS,
    defaultShadow: `0 ${token.controlOutlineWidth}px 0 ${token.controlTmpOutline}`,
    primaryShadow: `0 ${token.controlOutlineWidth}px 0 ${token.controlOutline}`,
    dangerShadow: `0 ${token.controlOutlineWidth}px 0 ${token.colorErrorOutline}`,
    primaryColor: token.colorTextLightSolid,
    dangerColor: token.colorTextLightSolid,
    borderColorDisabled: token.colorBorderDisabled,
    defaultGhostColor: token.colorBgContainer,
    ghostBg: 'transparent',
    defaultGhostBorderColor: token.colorBgContainer,
    paddingInline: token.paddingContentHorizontal - token.lineWidth,
    paddingInlineLG: token.paddingContentHorizontal - token.lineWidth,
    paddingInlineSM: 8 - token.lineWidth,
    onlyIconSize: 'inherit',
    onlyIconSizeSM: 'inherit',
    onlyIconSizeLG: 'inherit',
    groupBorderColor: token.colorPrimaryHover,
    linkHoverBg: 'transparent',
    textTextColor: token.colorText,
    textTextHoverColor: token.colorText,
    textTextActiveColor: token.colorText,
    textHoverBg: token.colorFillTertiary,
    defaultColor: token.colorText,
    defaultBg: token.colorBgContainer,
    defaultBorderColor: token.colorBorder,
    defaultBorderColorDisabled: token.colorBorder,
    defaultHoverBg: token.colorBgContainer,
    defaultHoverColor: token.colorPrimaryHover,
    defaultHoverBorderColor: token.colorPrimaryHover,
    defaultActiveBg: token.colorBgContainer,
    defaultActiveColor: token.colorPrimaryActive,
    defaultActiveBorderColor: token.colorPrimaryActive,
    solidTextColor,
    contentFontSize,
    contentFontSizeSM,
    contentFontSizeLG,
    contentLineHeight,
    contentLineHeightSM,
    contentLineHeightLG,
    paddingBlock: Math.max((token.controlHeight - contentFontSize * contentLineHeight) / 2 - token.lineWidth, 0),
    paddingBlockSM: Math.max((token.controlHeightSM - contentFontSizeSM * contentLineHeightSM) / 2 - token.lineWidth, 0),
    paddingBlockLG: Math.max((token.controlHeightLG - contentFontSizeLG * contentLineHeightLG) / 2 - token.lineWidth, 0),
    defaultBgDisabled,
    dashedBgDisabled
  };
};
exports.prepareComponentToken = prepareComponentToken;