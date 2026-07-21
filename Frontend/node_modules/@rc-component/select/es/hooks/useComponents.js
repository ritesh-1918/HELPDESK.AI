import * as React from 'react';
export default function useComponents(components, getInputElement, getRawInputElement) {
  return React.useMemo(() => {
    let {
      root,
      input
    } = components || {};

    // root: getRawInputElement
    if (getRawInputElement) {
      root = getRawInputElement();
    }

    // input: getInputElement
    if (getInputElement) {
      input = getInputElement();
    }
    return {
      root,
      input
    };
  }, [components, getInputElement, getRawInputElement]);
}