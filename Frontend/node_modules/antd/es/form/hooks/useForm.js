import * as React from 'react';
import { useForm as useRcForm } from '@rc-component/form';
import { getDOM } from "@rc-component/util/es/Dom/findDOMNode";
import scrollIntoView from 'scroll-into-view-if-needed';
import { getFieldId, toArray } from '../util';
export function toNamePathStr(name) {
  const namePath = toArray(name);
  return namePath.join('_');
}
function getFieldDOMNode(name, wrapForm) {
  const field = wrapForm.getFieldInstance(name);
  const fieldDom = getDOM(field);
  if (fieldDom) {
    return fieldDom;
  }
  const fieldId = getFieldId(toArray(name), wrapForm.__INTERNAL__.name);
  if (fieldId) {
    return document.getElementById(fieldId);
  }
}
export default function useForm(form) {
  const [rcForm] = useRcForm();
  const itemsRef = React.useRef({});
  const wrapForm = React.useMemo(() => form ?? {
    ...rcForm,
    __INTERNAL__: {
      itemRef: name => node => {
        const namePathStr = toNamePathStr(name);
        if (node) {
          itemsRef.current[namePathStr] = node;
        } else {
          delete itemsRef.current[namePathStr];
        }
      }
    },
    scrollToField: (name, options = {}) => {
      const {
        focus,
        ...restOpt
      } = options;
      const node = getFieldDOMNode(name, wrapForm);
      if (node) {
        scrollIntoView(node, {
          scrollMode: 'if-needed',
          block: 'nearest',
          ...restOpt
        });
        // Focus if scroll success
        if (focus) {
          wrapForm.focusField(name);
        }
      }
    },
    focusField: name => {
      const itemRef = wrapForm.getFieldInstance(name);
      if (typeof itemRef?.focus === 'function') {
        itemRef.focus();
      } else {
        getFieldDOMNode(name, wrapForm)?.focus?.();
      }
    },
    getFieldInstance: name => {
      const namePathStr = toNamePathStr(name);
      return itemsRef.current[namePathStr];
    }
  }, [form, rcForm]);
  return [wrapForm];
}