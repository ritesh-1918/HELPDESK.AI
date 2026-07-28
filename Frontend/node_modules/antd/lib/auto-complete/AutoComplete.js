"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _util = require("@rc-component/util");
var _clsx = require("clsx");
var _hooks = require("../_util/hooks");
var _warning = require("../_util/warning");
var _configProvider = require("../config-provider");
var _select = _interopRequireDefault(require("../select"));
const {
  Option
} = _select.default;
function isSelectOptionOrSelectOptGroup(child) {
  return child?.type && (child.type.isSelectOption || child.type.isSelectOptGroup);
}
const AutoComplete = (props, ref) => {
  const {
    prefixCls: customizePrefixCls,
    className,
    style,
    popupClassName,
    dropdownClassName,
    children,
    dataSource,
    rootClassName,
    dropdownStyle,
    dropdownRender,
    popupRender,
    onDropdownVisibleChange,
    onOpenChange,
    styles,
    classNames
  } = props;
  const childNodes = (0, _util.toArray)(children);
  const mergedPopupRender = popupRender || dropdownRender;
  const mergedOnOpenChange = onOpenChange || onDropdownVisibleChange;
  // ============================= Input =============================
  let customizeInput;
  if (childNodes.length === 1 && /*#__PURE__*/React.isValidElement(childNodes[0]) && !isSelectOptionOrSelectOptGroup(childNodes[0])) {
    [customizeInput] = childNodes;
  }
  const getInputElement = customizeInput ? () => customizeInput : undefined;
  // ============================ Options ============================
  let optionChildren;
  // [Legacy] convert `children` or `dataSource` into option children
  if (childNodes.length && isSelectOptionOrSelectOptGroup(childNodes[0])) {
    optionChildren = children;
  } else {
    optionChildren = dataSource ? dataSource.map(item => {
      if (/*#__PURE__*/React.isValidElement(item)) {
        return item;
      }
      switch (typeof item) {
        case 'string':
          return /*#__PURE__*/React.createElement(Option, {
            key: item,
            value: item
          }, item);
        case 'object':
          {
            const {
              value: optionValue
            } = item;
            return /*#__PURE__*/React.createElement(Option, {
              key: optionValue,
              value: optionValue
            }, item.text);
          }
        default:
          return undefined;
      }
    }) : [];
  }
  // ====================== Warning ======================
  if (process.env.NODE_ENV !== 'production') {
    const warning = (0, _warning.devUseWarning)('AutoComplete');
    process.env.NODE_ENV !== "production" ? warning(!customizeInput || !('size' in props), 'usage', 'You need to control style self instead of setting `size` when using customize input.') : void 0;
    const deprecatedProps = {
      dropdownMatchSelectWidth: 'popupMatchSelectWidth',
      dropdownStyle: 'styles.popup.root',
      dropdownClassName: 'classNames.popup.root',
      popupClassName: 'classNames.popup.root',
      dropdownRender: 'popupRender',
      onDropdownVisibleChange: 'onOpenChange',
      dataSource: 'options'
    };
    Object.entries(deprecatedProps).forEach(([oldProp, newProp]) => {
      warning.deprecated(!(oldProp in props), oldProp, newProp);
    });
  }
  const {
    getPrefixCls
  } = React.useContext(_configProvider.ConfigContext);
  const prefixCls = getPrefixCls('select', customizePrefixCls);
  // =========== Merged Props for Semantic ===========
  const mergedProps = {
    ...props,
    dataSource,
    status: props.status,
    popupMatchSelectWidth: props.popupMatchSelectWidth || props.dropdownMatchSelectWidth,
    popupRender: mergedPopupRender,
    onOpenChange: mergedOnOpenChange
  };
  // ========================= Style ==========================
  const [mergedClassNames, mergedStyles] = (0, _hooks.useMergeSemantic)([classNames], [styles], {
    props: mergedProps
  }, {
    popup: {
      _default: 'root'
    }
  });
  const finalClassNames = React.useMemo(() => ({
    root: (0, _clsx.clsx)(`${prefixCls}-auto-complete`, className, rootClassName, mergedClassNames.root, {
      [`${prefixCls}-customize`]: customizeInput
    }),
    prefix: mergedClassNames.prefix,
    input: mergedClassNames.input,
    placeholder: mergedClassNames.placeholder,
    content: mergedClassNames.content,
    popup: {
      root: (0, _clsx.clsx)(popupClassName, dropdownClassName, mergedClassNames.popup?.root),
      list: mergedClassNames.popup?.list,
      listItem: mergedClassNames.popup?.listItem
    }
  }), [prefixCls, className, rootClassName, mergedClassNames, popupClassName, dropdownClassName]);
  const finalStyles = React.useMemo(() => ({
    root: {
      ...mergedStyles.root,
      ...style
    },
    input: mergedStyles.input,
    prefix: mergedStyles.prefix,
    placeholder: mergedStyles.placeholder,
    content: mergedStyles.content,
    popup: {
      root: {
        ...dropdownStyle,
        ...mergedStyles.popup?.root
      },
      list: mergedStyles.popup?.list,
      listItem: mergedStyles.popup?.listItem
    }
  }), [mergedStyles, style, dropdownStyle]);
  return /*#__PURE__*/React.createElement(_select.default, {
    ref: ref,
    suffixIcon: null,
    ...(0, _util.omit)(props, ['dataSource', 'dropdownClassName', 'popupClassName']),
    prefixCls: prefixCls,
    classNames: finalClassNames,
    styles: finalStyles,
    mode: _select.default.SECRET_COMBOBOX_MODE_DO_NOT_USE,
    popupRender: mergedPopupRender,
    onPopupVisibleChange: mergedOnOpenChange,
    // Internal api
    getInputElement
  }, optionChildren);
};
const RefAutoComplete = /*#__PURE__*/React.forwardRef(AutoComplete);
if (process.env.NODE_ENV !== 'production') {
  RefAutoComplete.displayName = 'AutoComplete';
}
var _default = exports.default = RefAutoComplete;