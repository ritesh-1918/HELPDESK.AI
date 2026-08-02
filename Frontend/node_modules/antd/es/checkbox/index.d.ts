import type { CheckboxRef } from '@rc-component/checkbox';
import InternalCheckbox from './Checkbox';
import Group from './Group';
export type { CheckboxChangeEvent, CheckboxProps, CheckboxSemanticClassNames, CheckboxSemanticName, CheckboxSemanticStyles, } from './Checkbox';
export type { CheckboxGroupProps, CheckboxOptionType } from './Group';
export type { CheckboxRef };
type CompoundedComponent = typeof InternalCheckbox & {
    Group: typeof Group;
};
declare const Checkbox: CompoundedComponent;
export default Checkbox;
