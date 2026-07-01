import canUseDom from "@rc-component/util/es/Dom/canUseDom";
import React from 'react';
const defaultOptions = {
  subtree: true,
  childList: true,
  attributeFilter: ['style', 'class']
};
const useMutateObserver = (nodeOrList, callback, options = defaultOptions) => {
  React.useEffect(() => {
    if (!canUseDom() || !nodeOrList) {
      return;
    }
    let instance;
    const nodeList = Array.isArray(nodeOrList) ? nodeOrList : [nodeOrList];
    if ('MutationObserver' in window) {
      instance = new MutationObserver(callback);
      nodeList.forEach(element => {
        instance.observe(element, options);
      });
    }
    return () => {
      instance?.takeRecords();
      instance?.disconnect();
    };
  }, [options, nodeOrList]);
};
export default useMutateObserver;