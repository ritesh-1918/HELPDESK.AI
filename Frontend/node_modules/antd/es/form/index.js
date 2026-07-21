"use client";

import { FormProvider } from './context';
import ErrorList from './ErrorList';
import InternalForm, { useForm, useWatch } from './Form';
import Item from './FormItem';
import List from './FormList';
import useFormInstance from './hooks/useFormInstance';
const Form = InternalForm;
Form.Item = Item;
Form.List = List;
Form.ErrorList = ErrorList;
Form.useForm = useForm;
Form.useFormInstance = useFormInstance;
Form.useWatch = useWatch;
Form.Provider = FormProvider;
export default Form;