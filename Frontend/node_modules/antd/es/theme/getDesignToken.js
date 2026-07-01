import { createTheme, getComputedToken } from '@ant-design/cssinjs';
import defaultTheme from './themes/default/theme';
import seedToken from './themes/seed';
import formatToken from './util/alias';
const getDesignToken = config => {
  const theme = config?.algorithm ? createTheme(config.algorithm) : defaultTheme;
  const mergedToken = {
    ...seedToken,
    ...config?.token
  };
  return getComputedToken(mergedToken, {
    override: config?.token
  }, theme, formatToken);
};
export default getDesignToken;