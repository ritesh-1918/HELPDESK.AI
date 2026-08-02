function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
/* eslint react/prop-types:0 */
import React, { Component } from 'react';
import AjaxUpload from "./AjaxUploader";
function empty() {}
class Upload extends Component {
  static defaultProps = {
    component: 'span',
    prefixCls: 'rc-upload',
    data: {},
    headers: {},
    name: 'file',
    multipart: false,
    onStart: empty,
    onError: empty,
    onSuccess: empty,
    multiple: false,
    beforeUpload: null,
    customRequest: null,
    withCredentials: false,
    openFileDialogOnClick: true,
    hasControlInside: false
  };
  uploader;
  abort(file) {
    this.uploader.abort(file);
  }
  saveUploader = node => {
    this.uploader = node;
  };
  render() {
    return /*#__PURE__*/React.createElement(AjaxUpload, _extends({}, this.props, {
      ref: this.saveUploader
    }));
  }
}
export default Upload;