export function toArray(value) {
  if (Array.isArray(value)) {
    return value;
  }
  return value !== undefined ? [value] : [];
}
export const isClient = typeof window !== 'undefined' && window.document && window.document.documentElement;

/** Is client side and not jsdom */
export const isBrowserClient = process.env.NODE_ENV !== 'test' && isClient;
export function hasValue(value) {
  return value !== undefined && value !== null;
}

/** combo mode no value judgment function */
export function isComboNoValue(value) {
  return !value && value !== 0;
}
function isTitleType(title) {
  return ['string', 'number'].includes(typeof title);
}
export function getTitle(item) {
  let title = undefined;
  if (item) {
    if (isTitleType(item.title)) {
      title = item.title.toString();
    } else if (isTitleType(item.label)) {
      title = item.label.toString();
    }
  }
  return title;
}