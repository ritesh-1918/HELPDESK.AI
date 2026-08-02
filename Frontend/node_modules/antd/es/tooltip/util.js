import { clsx } from 'clsx';
import { isPresetColor } from '../_util/colors';
import { generateColor } from '../color-picker/util';
import { genCssVar } from '../theme/util/genStyleUtils';
export const parseColor = (rootPrefixCls, prefixCls, color) => {
  const isInternalColor = isPresetColor(color);
  const [varName] = genCssVar(rootPrefixCls, 'tooltip');
  const className = clsx({
    [`${prefixCls}-${color}`]: color && isInternalColor
  });
  const overlayStyle = {};
  const arrowStyle = {};
  const rgb = generateColor(color).toRgb();
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  const textColor = luminance < 0.5 ? '#FFF' : '#000';
  if (color && !isInternalColor) {
    overlayStyle.background = color;
    overlayStyle[varName('overlay-color')] = textColor;
    arrowStyle[varName('arrow-background-color')] = color;
  }
  return {
    className,
    overlayStyle,
    arrowStyle
  };
};