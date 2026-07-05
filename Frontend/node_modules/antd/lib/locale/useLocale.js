"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _context = _interopRequireDefault(require("./context"));
var _en_US = _interopRequireDefault(require("./en_US"));
const useLocale = (componentName, defaultLocale) => {
  const fullLocale = React.useContext(_context.default);
  const getLocale = React.useMemo(() => {
    const locale = defaultLocale || _en_US.default[componentName];
    const localeFromContext = fullLocale?.[componentName] ?? {};
    return {
      ...(typeof locale === 'function' ? locale() : locale),
      ...(localeFromContext || {})
    };
  }, [componentName, defaultLocale, fullLocale]);
  const getLocaleCode = React.useMemo(() => {
    const localeCode = fullLocale?.locale;
    // Had use LocaleProvide but didn't set locale
    if (fullLocale?.exist && !localeCode) {
      return _en_US.default.locale;
    }
    return localeCode;
  }, [fullLocale]);
  return [getLocale, getLocaleCode];
};
var _default = exports.default = useLocale;