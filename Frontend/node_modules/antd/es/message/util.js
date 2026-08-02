export function getMotion(prefixCls, transitionName) {
  return {
    motionName: transitionName ?? `${prefixCls}-move-up`
  };
}
/** Wrap message open with promise like function */
export function wrapPromiseFn(openFn) {
  let closeFn;
  const closePromise = new Promise(resolve => {
    closeFn = openFn(() => {
      resolve(true);
    });
  });
  const result = () => {
    closeFn?.();
  };
  result.then = (filled, rejected) => closePromise.then(filled, rejected);
  result.promise = closePromise;
  return result;
}