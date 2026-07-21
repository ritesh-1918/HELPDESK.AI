import * as React from 'react';
import DefaultPanel from "./DefaultPanel";
const TourStep = props => {
  const {
    current,
    renderPanel
  } = props;
  return /*#__PURE__*/React.createElement(React.Fragment, null, typeof renderPanel === 'function' ? renderPanel(props, current) : /*#__PURE__*/React.createElement(DefaultPanel, props));
};
export default TourStep;