"use client";

import { omit } from '@rc-component/util';
import genPurePanel from '../_util/PurePanel';
import Select from '../select';
import RefAutoComplete from './AutoComplete';
const {
  Option
} = Select;
// We don't care debug panel
/* istanbul ignore next */
const PurePanel = genPurePanel(RefAutoComplete, 'popupAlign', props => omit(props, ['visible']));
const AutoComplete = RefAutoComplete;
AutoComplete.Option = Option;
AutoComplete._InternalPanelDoNotUseOrYouWillBeFired = PurePanel;
export default AutoComplete;