import isMobile from 'is-mobile';
let cached;
export default (() => {
  if (typeof cached === 'undefined') {
    cached = isMobile();
  }
  return cached;
});