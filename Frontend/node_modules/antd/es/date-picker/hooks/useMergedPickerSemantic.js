import * as React from 'react';
import { clsx } from 'clsx';
import { useMergeSemantic } from '../../_util/hooks';
import { useComponentConfig } from '../../config-provider/context';
const useMergedPickerSemantic = (pickerType, classNames, styles, popupClassName, popupStyle, mergedProps) => {
  const {
    classNames: contextClassNames,
    styles: contextStyles
  } = useComponentConfig(pickerType);
  const [mergedClassNames, mergedStyles] = useMergeSemantic([contextClassNames, classNames], [contextStyles, styles], {
    props: mergedProps
  }, {
    popup: {
      _default: 'root'
    }
  });
  return React.useMemo(() => {
    // ClassNames
    const filledClassNames = {
      ...mergedClassNames,
      popup: {
        ...mergedClassNames.popup,
        root: clsx(mergedClassNames.popup?.root, popupClassName)
      }
    };
    // Styles
    const filledStyles = {
      ...mergedStyles,
      popup: {
        ...mergedStyles.popup,
        root: {
          ...mergedStyles.popup?.root,
          ...popupStyle
        }
      }
    };
    // Return
    return [filledClassNames, filledStyles];
  }, [mergedClassNames, mergedStyles, popupClassName, popupStyle]);
};
export default useMergedPickerSemantic;