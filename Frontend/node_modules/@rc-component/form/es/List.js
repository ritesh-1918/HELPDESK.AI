import * as React from 'react';
import warning from "@rc-component/util/es/warning";
import FieldContext from "./FieldContext";
import Field from "./Field";
import { move, getNamePath } from "./utils/valueUtil";
import ListContext from "./ListContext";
function List({
  name,
  initialValue,
  children,
  rules,
  validateTrigger,
  isListField
}) {
  const context = React.useContext(FieldContext);
  const wrapperListContext = React.useContext(ListContext);
  const keyRef = React.useRef({
    keys: [],
    id: 0
  });
  const keyManager = keyRef.current;
  const prefixName = React.useMemo(() => {
    const parentPrefixName = getNamePath(context.prefixName) || [];
    return [...parentPrefixName, ...getNamePath(name)];
  }, [context.prefixName, name]);
  const fieldContext = React.useMemo(() => ({
    ...context,
    prefixName
  }), [context, prefixName]);

  // List context
  const listContext = React.useMemo(() => ({
    getKey: namePath => {
      const len = prefixName.length;
      const pathName = namePath[len];
      return [keyManager.keys[pathName], namePath.slice(len + 1)];
    }
  }), [keyManager, prefixName]);

  // User should not pass `children` as other type.
  if (typeof children !== 'function') {
    warning(false, 'Form.List only accepts function as children.');
    return null;
  }
  const shouldUpdate = (prevValue, nextValue, {
    source
  }) => {
    if (source === 'internal') {
      return false;
    }
    return prevValue !== nextValue;
  };
  return /*#__PURE__*/React.createElement(ListContext.Provider, {
    value: listContext
  }, /*#__PURE__*/React.createElement(FieldContext.Provider, {
    value: fieldContext
  }, /*#__PURE__*/React.createElement(Field, {
    name: [],
    shouldUpdate: shouldUpdate,
    rules: rules,
    validateTrigger: validateTrigger,
    initialValue: initialValue,
    isList: true,
    isListField: isListField ?? !!wrapperListContext
  }, ({
    value = [],
    onChange
  }, meta) => {
    const {
      getFieldValue
    } = context;
    const getNewValue = () => {
      const values = getFieldValue(prefixName || []);
      return values || [];
    };
    /**
     * Always get latest value in case user update fields by `form` api.
     */
    const operations = {
      add: (defaultValue, index) => {
        // Mapping keys
        const newValue = getNewValue();
        if (index >= 0 && index <= newValue.length) {
          keyManager.keys = [...keyManager.keys.slice(0, index), keyManager.id, ...keyManager.keys.slice(index)];
          onChange([...newValue.slice(0, index), defaultValue, ...newValue.slice(index)]);
        } else {
          if (process.env.NODE_ENV !== 'production' && (index < 0 || index > newValue.length)) {
            warning(false, 'The second parameter of the add function should be a valid positive number.');
          }
          keyManager.keys = [...keyManager.keys, keyManager.id];
          onChange([...newValue, defaultValue]);
        }
        keyManager.id += 1;
      },
      remove: index => {
        const newValue = getNewValue();
        const indexSet = new Set(Array.isArray(index) ? index : [index]);
        if (indexSet.size <= 0) {
          return;
        }
        keyManager.keys = keyManager.keys.filter((_, keysIndex) => !indexSet.has(keysIndex));

        // Trigger store change
        onChange(newValue.filter((_, valueIndex) => !indexSet.has(valueIndex)));
      },
      move(from, to) {
        if (from === to) {
          return;
        }
        const newValue = getNewValue();

        // Do not handle out of range
        if (from < 0 || from >= newValue.length || to < 0 || to >= newValue.length) {
          return;
        }
        keyManager.keys = move(keyManager.keys, from, to);

        // Trigger store change
        onChange(move(newValue, from, to));
      }
    };
    let listValue = value || [];
    if (!Array.isArray(listValue)) {
      listValue = [];
      if (process.env.NODE_ENV !== 'production') {
        warning(false, `Current value of '${prefixName.join(' > ')}' is not an array type.`);
      }
    }
    return children(listValue.map((__, index) => {
      let key = keyManager.keys[index];
      if (key === undefined) {
        keyManager.keys[index] = keyManager.id;
        key = keyManager.keys[index];
        keyManager.id += 1;
      }
      return {
        name: index,
        key,
        isListField: true
      };
    }), operations, meta);
  })));
}
export default List;