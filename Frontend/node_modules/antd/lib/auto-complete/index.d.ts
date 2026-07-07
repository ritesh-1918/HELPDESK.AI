import RefAutoComplete from './AutoComplete';
export type { AutoCompleteProps, AutoCompleteSemanticClassNames, AutoCompleteSemanticName, AutoCompleteSemanticStyles, } from './AutoComplete';
declare const Option: import("@rc-component/select/lib/Option").OptionFC;
declare const PurePanel: (props: import("../_util/type").AnyObject) => import("react").JSX.Element;
type CompoundedComponent = typeof RefAutoComplete & {
    /** @deprecated Please use `options` instead. */
    Option: typeof Option;
    _InternalPanelDoNotUseOrYouWillBeFired: typeof PurePanel;
};
declare const AutoComplete: CompoundedComponent;
export default AutoComplete;
