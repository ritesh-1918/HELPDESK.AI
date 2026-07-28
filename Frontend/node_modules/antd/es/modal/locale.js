import defaultLocale from '../locale/en_US';
let runtimeLocale = {
  ...defaultLocale.Modal
};
let localeList = [];
const generateLocale = () => localeList.reduce((merged, locale) => ({
  ...merged,
  ...locale
}), defaultLocale.Modal);
export function changeConfirmLocale(newLocale) {
  if (newLocale) {
    const cloneLocale = {
      ...newLocale
    };
    localeList.push(cloneLocale);
    runtimeLocale = generateLocale();
    return () => {
      localeList = localeList.filter(locale => locale !== cloneLocale);
      runtimeLocale = generateLocale();
    };
  }
  runtimeLocale = {
    ...defaultLocale.Modal
  };
}
export function getConfirmLocale() {
  return runtimeLocale;
}