import warning from "@rc-component/util/es/warning";
import canUseDom from "@rc-component/util/es/Dom/canUseDom";
export function parseWidthHeight(value) {
  if (typeof value === 'string') {
    const num = Number(value.replace(/px$/i, ''));
    const floatNum = parseFloat(value);
    if (floatNum === num) {
      warning(false, 'Invalid value type of `width` or `height` which should be number type instead.');
    }
    if (!Number.isNaN(num)) {
      return num;
    }
  }
  return value;
}
export function warnCheck(props) {
  warning(!('wrapperClassName' in props), `'wrapperClassName' is removed. Please use 'rootClassName' instead.`);
  warning(canUseDom() || !props.open, `Drawer with 'open' in SSR is not work since no place to createPortal. Please move to 'useEffect' instead.`);
}