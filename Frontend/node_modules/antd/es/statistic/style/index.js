import { resetComponent } from '../../style';
import { genStyleHooks, mergeToken } from '../../theme/internal';
const genStatisticStyle = token => {
  const {
    componentCls,
    marginXXS,
    padding,
    colorTextDescription,
    titleFontSize,
    colorTextHeading,
    contentFontSize,
    fontFamily
  } = token;
  return {
    [componentCls]: {
      ...resetComponent(token),
      [`${componentCls}-header`]: {
        paddingBottom: marginXXS,
        [`${componentCls}-title`]: {
          color: colorTextDescription,
          fontSize: titleFontSize
        }
      },
      [`${componentCls}-skeleton`]: {
        paddingTop: padding
      },
      [`${componentCls}-content`]: {
        color: colorTextHeading,
        fontSize: contentFontSize,
        fontFamily,
        [`${componentCls}-content-value`]: {
          display: 'inline-block',
          direction: 'ltr'
        },
        [`${componentCls}-content-prefix, ${componentCls}-content-suffix`]: {
          display: 'inline-block'
        },
        [`${componentCls}-content-prefix`]: {
          marginInlineEnd: marginXXS
        },
        [`${componentCls}-content-suffix`]: {
          marginInlineStart: marginXXS
        }
      }
    }
  };
};
// ============================== Export ==============================
export const prepareComponentToken = token => {
  const {
    fontSizeHeading3,
    fontSize
  } = token;
  return {
    titleFontSize: fontSize,
    contentFontSize: fontSizeHeading3
  };
};
export default genStyleHooks('Statistic', token => {
  const statisticToken = mergeToken(token, {});
  return genStatisticStyle(statisticToken);
}, prepareComponentToken);