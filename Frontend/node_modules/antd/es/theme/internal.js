import { useStyleRegister } from '@ant-design/cssinjs';
import { genCalc as calc, mergeToken, statistic, statisticToken } from '@ant-design/cssinjs-utils';
import { PresetColors } from './interface';
import { getLineHeight } from './themes/shared/genFontSizes';
import useToken from './useToken';
import { genComponentStyleHook, genStyleHooks, genSubStyleComponent } from './util/genStyleUtils';
import genPresetColor from './util/genPresetColor';
import useResetIconStyle from './util/useResetIconStyle';
export { defaultConfig, DesignTokenContext } from './context';
export { calc,
// generators
genComponentStyleHook, genPresetColor, genStyleHooks, genSubStyleComponent, getLineHeight,
// utils
mergeToken,
// constant
PresetColors, statistic, statisticToken,
// hooks
useResetIconStyle, useStyleRegister, useToken };