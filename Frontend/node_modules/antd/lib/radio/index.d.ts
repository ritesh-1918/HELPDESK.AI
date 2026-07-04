import Group from './group';
import InternalRadio from './radio';
import Button from './radioButton';
export type { RadioChangeEvent, RadioChangeEventTarget, RadioGroupButtonStyle, RadioGroupContextProps, RadioGroupOptionType, RadioGroupProps, RadioProps, RadioRef, RadioSemanticClassNames, RadioSemanticName, RadioSemanticStyles, } from './interface';
export { Button, Group };
type CompoundedComponent = typeof InternalRadio & {
    Group: typeof Group;
    Button: typeof Button;
};
declare const Radio: CompoundedComponent;
export default Radio;
