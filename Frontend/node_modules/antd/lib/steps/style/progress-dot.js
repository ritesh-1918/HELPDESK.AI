"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _genStyleUtils = require("../../theme/util/genStyleUtils");
var _util = require("./util");
const genDotStyle = token => {
  const {
    componentCls,
    iconSize,
    dotSize,
    dotCurrentSize,
    marginXXS,
    lineWidthBold,
    fontSizeSM,
    antCls
  } = token;
  const itemCls = `${componentCls}-item`;
  const [varName, varRef] = (0, _genStyleUtils.genCssVar)(antCls, 'cmp-steps');
  return {
    [`${componentCls}${componentCls}-dot`]: {
      [varName('icon-size-active')]: dotCurrentSize,
      [varName('icon-size')]: dotSize,
      [varName('dot-icon-size')]: dotSize,
      [varName('dot-icon-border-width')]: lineWidthBold,
      [varName('rail-size')]: lineWidthBold,
      [varName('icon-border-width')]: lineWidthBold,
      // ========================= Shared ==========================
      // Icon
      [`${itemCls}-custom ${itemCls}-icon`]: {
        fontSize: fontSizeSM
      },
      [`${itemCls}-icon`]: {
        position: 'relative',
        '&:after': {
          content: '""',
          width: iconSize,
          height: iconSize,
          display: 'block',
          position: 'absolute',
          top: '50%',
          left: {
            _skip_check_: true,
            value: '50%'
          },
          transform: 'translate(-50%, -50%)'
        }
      },
      // // >>> active
      [`${itemCls}-active ${itemCls}-icon`]: {
        [varName('icon-size')]: varRef('icon-size-active')
      },
      // ======================= Horizontal ========================
      [`&${componentCls}-horizontal`]: {
        // With descriptionMaxWidth
        [`&, &${componentCls}-small`]: (0, _util.getItemWithWidthStyle)(token, marginXXS)
      }
    }
  };
};
var _default = exports.default = genDotStyle;