import { prepareComponentToken, prepareToken } from '.';
import capitalize from '../../_util/capitalize';
import { genSubStyleComponent } from '../../theme/internal';
const genTagStatusStyle = (token, status, cssVariableType) => {
  const capitalizedCssVariableType = capitalize(cssVariableType);
  return {
    [`${token.componentCls}${token.componentCls}-${status}:not(${token.componentCls}-disabled)`]: {
      [`&${token.componentCls}-outlined`]: {
        backgroundColor: token[`color${capitalizedCssVariableType}Bg`],
        borderColor: token[`color${capitalizedCssVariableType}Border`],
        color: token[`color${cssVariableType}`]
      },
      [`&${token.componentCls}-solid`]: {
        backgroundColor: token[`color${cssVariableType}`],
        borderColor: token[`color${cssVariableType}`]
      },
      [`&${token.componentCls}-filled`]: {
        backgroundColor: token[`color${capitalizedCssVariableType}Bg`],
        color: token[`color${cssVariableType}`]
      }
    }
  };
};
// ============================== Export ==============================
export default genSubStyleComponent(['Tag', 'status'], token => {
  const tagToken = prepareToken(token);
  return [genTagStatusStyle(tagToken, 'success', 'Success'), genTagStatusStyle(tagToken, 'processing', 'Info'), genTagStatusStyle(tagToken, 'error', 'Error'), genTagStatusStyle(tagToken, 'warning', 'Warning')];
}, prepareComponentToken);