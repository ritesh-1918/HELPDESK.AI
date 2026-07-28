import { initFadeMotion } from '../../style/motion/fade';
import { genStyleHooks, mergeToken } from '../../theme/internal';
import genFloatButtonStyle from './button';
import genGroupStyle from './group';
// ============================== Export ==============================
export const prepareComponentToken = () => ({});
export default genStyleHooks('FloatButton', token => {
  const {
    controlHeightLG,
    marginXXL,
    marginLG,
    fontSizeIcon,
    calc
  } = token;
  const floatButtonToken = mergeToken(token, {
    floatButtonIconSize: calc(fontSizeIcon).mul(1.5).equal(),
    floatButtonSize: controlHeightLG,
    floatButtonInsetBlockEnd: marginXXL,
    floatButtonInsetInlineEnd: marginLG
  });
  return [genFloatButtonStyle(floatButtonToken), genGroupStyle(floatButtonToken), initFadeMotion(token)];
}, prepareComponentToken, {
  // Should be higher than Button (-999)
  order: -998
});