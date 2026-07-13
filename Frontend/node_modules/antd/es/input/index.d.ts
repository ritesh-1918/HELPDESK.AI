import Group from './Group';
import InternalInput from './Input';
import OTP from './OTP';
import Password from './Password';
import Search from './Search';
import TextArea from './TextArea';
export type { GroupProps } from './Group';
export type { InputProps, InputRef, InputSemanticClassNames, InputSemanticName, InputSemanticStyles, } from './Input';
export type { PasswordProps } from './Password';
export type { InputSearchSemanticClassNames, InputSearchSemanticName, InputSearchSemanticStyles, SearchProps, } from './Search';
export type { TextAreaProps, TextAreaSemanticClassNames, TextAreaSemanticName, TextAreaSemanticStyles, } from './TextArea';
type CompoundedComponent = typeof InternalInput & {
    /** @deprecated Please use `Space.Compact` */
    Group: typeof Group;
    Search: typeof Search;
    TextArea: typeof TextArea;
    Password: typeof Password;
    OTP: typeof OTP;
};
declare const Input: CompoundedComponent;
export default Input;
