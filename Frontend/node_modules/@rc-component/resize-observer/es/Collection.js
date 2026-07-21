import * as React from 'react';
export const CollectionContext = /*#__PURE__*/React.createContext(null);
/**
 * Collect all the resize event from children ResizeObserver
 */
export function Collection({
  children,
  onBatchResize
}) {
  const resizeIdRef = React.useRef(0);
  const resizeInfosRef = React.useRef([]);
  const onCollectionResize = React.useContext(CollectionContext);
  const onResize = React.useCallback((size, element, data) => {
    resizeIdRef.current += 1;
    const currentId = resizeIdRef.current;
    resizeInfosRef.current.push({
      size,
      element,
      data
    });
    Promise.resolve().then(() => {
      if (currentId === resizeIdRef.current) {
        onBatchResize?.(resizeInfosRef.current);
        resizeInfosRef.current = [];
      }
    });

    // Continue bubbling if parent exist
    onCollectionResize?.(size, element, data);
  }, [onBatchResize, onCollectionResize]);
  return /*#__PURE__*/React.createElement(CollectionContext.Provider, {
    value: onResize
  }, children);
}