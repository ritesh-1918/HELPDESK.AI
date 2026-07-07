"use client";

import _classCallCheck from "@babel/runtime/helpers/esm/classCallCheck";
import _createClass from "@babel/runtime/helpers/esm/createClass";
import _callSuper from "@babel/runtime/helpers/esm/callSuper";
import _inherits from "@babel/runtime/helpers/esm/inherits";
import * as React from 'react';
import Alert from './Alert';
let ErrorBoundary = /*#__PURE__*/function (_React$Component) {
  function ErrorBoundary() {
    var _this;
    _classCallCheck(this, ErrorBoundary);
    _this = _callSuper(this, ErrorBoundary, arguments);
    _this.state = {
      error: undefined,
      info: {
        componentStack: ''
      }
    };
    return _this;
  }
  _inherits(ErrorBoundary, _React$Component);
  return _createClass(ErrorBoundary, [{
    key: "componentDidCatch",
    value: function componentDidCatch(error, info) {
      this.setState({
        error,
        info
      });
    }
  }, {
    key: "render",
    value: function render() {
      const {
        message,
        title,
        description,
        id,
        children
      } = this.props;
      const {
        error,
        info
      } = this.state;
      const mergedTitle = title ?? message;
      const componentStack = info?.componentStack || null;
      const errorMessage = typeof mergedTitle === 'undefined' ? (error || '').toString() : mergedTitle;
      const errorDescription = typeof description === 'undefined' ? componentStack : description;
      if (error) {
        return /*#__PURE__*/React.createElement(Alert, {
          id: id,
          type: "error",
          title: errorMessage,
          description: /*#__PURE__*/React.createElement("pre", {
            style: {
              fontSize: '0.9em',
              overflowX: 'auto'
            }
          }, errorDescription)
        });
      }
      return children;
    }
  }]);
}(React.Component);
export default ErrorBoundary;