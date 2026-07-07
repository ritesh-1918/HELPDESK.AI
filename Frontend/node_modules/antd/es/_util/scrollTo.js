import raf from "@rc-component/util/es/raf";
import { easeInOutCubic } from './easings';
import getScroll, { isWindow } from './getScroll';
export default function scrollTo(y, options = {}) {
  const {
    getContainer = () => window,
    callback,
    duration = 450
  } = options;
  const container = getContainer();
  const scrollTop = getScroll(container);
  const startTime = Date.now();
  let rafId;
  const frameFunc = () => {
    const timestamp = Date.now();
    const time = timestamp - startTime;
    const nextScrollTop = easeInOutCubic(time > duration ? duration : time, scrollTop, y, duration);
    if (isWindow(container)) {
      container.scrollTo(window.pageXOffset, nextScrollTop);
    } else if (container instanceof Document || container.constructor.name === 'HTMLDocument') {
      container.documentElement.scrollTop = nextScrollTop;
    } else {
      container.scrollTop = nextScrollTop;
    }
    if (time < duration) {
      rafId = raf(frameFunc);
    } else if (typeof callback === 'function') {
      callback();
    }
  };
  rafId = raf(frameFunc);
  return () => {
    raf.cancel(rafId);
  };
}