import { generate } from '@ant-design/colors';
import { PresetColors } from '../../interface/presetColors';
import defaultAlgorithm from '../default';
import { defaultPresetColors } from '../seed';
import genColorMapToken from '../shared/genColorMapToken';
import { generateColorPalettes, generateNeutralColorPalettes } from './colors';
const derivative = (token, mapToken) => {
  const colorPalettes = Object.keys(defaultPresetColors).map(colorKey => {
    const colors = generate(token[colorKey], {
      theme: 'dark'
    });
    return Array.from({
      length: 10
    }, () => 1).reduce((prev, _, i) => {
      prev[`${colorKey}-${i + 1}`] = colors[i];
      prev[`${colorKey}${i + 1}`] = colors[i];
      return prev;
    }, {});
  }).reduce((prev, cur) => {
    prev = {
      ...prev,
      ...cur
    };
    return prev;
  }, {});
  const mergedMapToken = mapToken ?? defaultAlgorithm(token);
  const colorMapToken = genColorMapToken(token, {
    generateColorPalettes,
    generateNeutralColorPalettes
  });
  const presetColorHoverActiveTokens = PresetColors.reduce((prev, colorKey) => {
    const colorBase = token[colorKey];
    if (colorBase) {
      const colorPalette = generateColorPalettes(colorBase);
      prev[`${colorKey}Hover`] = colorPalette[7];
      prev[`${colorKey}Active`] = colorPalette[5];
    }
    return prev;
  }, {});
  return {
    ...mergedMapToken,
    // Dark tokens
    ...colorPalettes,
    // Colors
    ...colorMapToken,
    ...presetColorHoverActiveTokens,
    // Customize selected item background color
    // https://github.com/ant-design/ant-design/issues/30524#issuecomment-871961867
    colorPrimaryBg: colorMapToken.colorPrimaryBorder,
    colorPrimaryBgHover: colorMapToken.colorPrimaryBorderHover
  };
};
export default derivative;