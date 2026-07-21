import warning from "@rc-component/util/es/warning";
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import FieldContext, { HOOK_MARK } from "../FieldContext";
import { isFormInstance } from "../utils/typeUtil";
import { getNamePath, getValue } from "../utils/valueUtil";
import { useEvent } from '@rc-component/util';
export function stringify(value) {
  try {
    return JSON.stringify(value);
  } catch {
    return Math.random();
  }
}

// ------- selector type -------

// ------- selector type end -------

function useWatch(...args) {
  const [dependencies, _form = {}] = args;
  const options = isFormInstance(_form) ? {
    form: _form
  } : _form;
  const form = options.form;
  const [value, setValue] = useState(() => typeof dependencies === 'function' ? dependencies({}) : undefined);
  const valueStr = useMemo(() => stringify(value), [value]);
  const valueStrRef = useRef(valueStr);
  valueStrRef.current = valueStr;
  const fieldContext = useContext(FieldContext);
  const formInstance = form || fieldContext;
  const isValidForm = formInstance && formInstance._init;

  // Warning if not exist form instance
  if (process.env.NODE_ENV !== 'production') {
    warning(args.length === 2 ? form ? isValidForm : true : isValidForm, 'useWatch requires a form instance since it can not auto detect from context.');
  }

  // ============================== Form ==============================
  const {
    getFieldsValue,
    getInternalHooks
  } = formInstance;
  const {
    registerWatch
  } = getInternalHooks(HOOK_MARK);

  // ============================= Update =============================
  const triggerUpdate = useEvent((values, allValues) => {
    const watchValue = options.preserve ? allValues ?? getFieldsValue(true) : values ?? getFieldsValue();
    const nextValue = typeof dependencies === 'function' ? dependencies(watchValue) : getValue(watchValue, getNamePath(dependencies));
    if (stringify(value) !== stringify(nextValue)) {
      setValue(nextValue);
    }
  });

  // ============================= Effect =============================
  const flattenDeps = typeof dependencies === 'function' ? dependencies : JSON.stringify(dependencies);

  // Deps changed
  useEffect(() => {
    // Skip if not exist form instance
    if (!isValidForm) {
      return;
    }
    triggerUpdate();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isValidForm, flattenDeps]);

  // Value changed
  useEffect(() => {
    // Skip if not exist form instance
    if (!isValidForm) {
      return;
    }
    const cancelRegister = registerWatch((values, allValues) => {
      triggerUpdate(values, allValues);
    });
    return cancelRegister;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isValidForm]);
  return value;
}
export default useWatch;