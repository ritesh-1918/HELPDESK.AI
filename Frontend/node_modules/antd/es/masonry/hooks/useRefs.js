import * as React from 'react';
export default function useRefs() {
  const refs = React.useRef(null);
  if (refs.current === null) {
    refs.current = new Map();
  }
  const setRef = (key, element) => {
    refs.current.set(key, element);
  };
  const getRef = key => refs.current.get(key);
  return [setRef, getRef];
}