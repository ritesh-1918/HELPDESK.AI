import useEvent from "@rc-component/util/es/hooks/useEvent";
import useLayoutEffect from "@rc-component/util/es/hooks/useLayoutEffect";
import isEqual from "@rc-component/util/es/isEqual";
import * as React from 'react';
import { unstable_batchedUpdates } from 'react-dom';
export function createContext(defaultValue) {
  const Context = /*#__PURE__*/React.createContext(undefined);
  const Provider = ({
    value,
    children
  }) => {
    const valueRef = React.useRef(value);
    valueRef.current = value;
    const [context] = React.useState(() => ({
      getValue: () => valueRef.current,
      listeners: new Set()
    }));
    useLayoutEffect(() => {
      unstable_batchedUpdates(() => {
        context.listeners.forEach(listener => {
          listener(value);
        });
      });
    }, [value]);
    return /*#__PURE__*/React.createElement(Context.Provider, {
      value: context
    }, children);
  };
  return {
    Context,
    Provider,
    defaultValue
  };
}

/** e.g. useSelect(userContext) => user */

/** e.g. useSelect(userContext, user => user.name) => user.name */

/** e.g. useSelect(userContext, ['name', 'age']) => user { name, age } */

/** e.g. useSelect(userContext, 'name') => user.name */

export function useContext(holder, selector) {
  const eventSelector = useEvent(typeof selector === 'function' ? selector : ctx => {
    if (selector === undefined) {
      return ctx;
    }
    if (!Array.isArray(selector)) {
      return ctx[selector];
    }
    const obj = {};
    selector.forEach(key => {
      obj[key] = ctx[key];
    });
    return obj;
  });
  const context = React.useContext(holder?.Context);
  const {
    listeners,
    getValue
  } = context || {};
  const valueRef = React.useRef();
  valueRef.current = eventSelector(context ? getValue() : holder?.defaultValue);
  const [, forceUpdate] = React.useState({});
  useLayoutEffect(() => {
    if (!context) {
      return;
    }
    function trigger(nextValue) {
      const nextSelectorValue = eventSelector(nextValue);
      if (!isEqual(valueRef.current, nextSelectorValue, true)) {
        forceUpdate({});
      }
    }
    listeners.add(trigger);
    return () => {
      listeners.delete(trigger);
    };
  }, [context]);
  return valueRef.current;
}