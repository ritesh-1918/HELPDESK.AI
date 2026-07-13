"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _clsx = require("clsx");
var _hooks = require("../../_util/hooks");
var _context = require("../../config-provider/context");
const useMergedPickerSemantic = (pickerType, classNames, styles, popupClassName, popupStyle, mergedProps) => {
  const {
    classNames: contextClassNames,
    styles: contextStyles
  } = (0, _context.useComponentConfig)(pickerType);
  const [mergedClassNames, mergedStyles] = (0, _hooks.useMergeSemantic)([contextClassNames, classNames], [contextStyles, styles], {
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
        root: (0, _clsx.clsx)(mergedClassNames.popup?.root, popupClassName)
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
var _default = exports.default = useMergedPickerSemantic;