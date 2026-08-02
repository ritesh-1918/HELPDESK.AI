import Panel from './Panel';
import SplitterComp from './Splitter';
export type { DraggerSemantic, DraggerSemanticClassNames, DraggerSemanticStyles, SplitterProps, SplitterSemanticClassNames, SplitterSemanticName, SplitterSemanticStyles, } from './interface';
type CompoundedComponent = typeof SplitterComp & {
    Panel: typeof Panel;
};
declare const Splitter: CompoundedComponent;
export default Splitter;
