"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _pickAttrs = _interopRequireDefault(require("@rc-component/util/lib/pickAttrs"));
var _clsx = require("clsx");
var _react = _interopRequireWildcard(require("react"));
var _attrAccept = _interopRequireDefault(require("./attr-accept"));
var _request = _interopRequireDefault(require("./request"));
var _traverseFileTree = _interopRequireDefault(require("./traverseFileTree"));
var _uid = _interopRequireDefault(require("./uid"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } /* eslint react/no-is-mounted:0,react/sort-comp:0,react/prop-types:0 */
class AjaxUploader extends _react.Component {
  state = {
    uid: (0, _uid.default)()
  };
  reqs = {};
  fileInput;
  _isMounted;
  filterFile = (file, force = false) => {
    const {
      accept,
      directory
    } = this.props;
    let filterFn;
    let acceptFormat;
    if (typeof accept === 'string') {
      acceptFormat = accept;
    } else {
      const {
        filter,
        format
      } = accept || {};
      acceptFormat = format;
      if (filter === 'native') {
        filterFn = () => true;
      } else {
        filterFn = filter;
      }
    }
    const mergedFilter = filterFn || (directory || force ? currentFile => (0, _attrAccept.default)(currentFile, acceptFormat) : () => true);
    return mergedFilter(file);
  };
  onChange = e => {
    const {
      files
    } = e.target;
    const acceptedFiles = [...files].filter(file => this.filterFile(file));
    this.uploadFiles(acceptedFiles);
    this.reset();
  };
  onClick = event => {
    const el = this.fileInput;
    if (!el) {
      return;
    }
    const target = event.target;
    const {
      onClick
    } = this.props;
    if (target && target.tagName === 'BUTTON') {
      const parent = el.parentNode;
      parent.focus();
      target.blur();
    }
    el.click();
    if (onClick) {
      onClick(event);
    }
  };
  onKeyDown = e => {
    if (e.key === 'Enter') {
      this.onClick(e);
    }
  };
  onDataTransferFiles = async (dataTransfer, existFileCallback) => {
    const {
      multiple,
      directory
    } = this.props;
    const items = [...(dataTransfer.items || [])];
    let files = [...(dataTransfer.files || [])];
    if (files.length > 0 || items.some(item => item.kind === 'file')) {
      existFileCallback?.();
    }
    if (directory) {
      files = await (0, _traverseFileTree.default)(Array.prototype.slice.call(items), this.filterFile);
      this.uploadFiles(files);
    } else {
      let acceptFiles = [...files].filter(file => this.filterFile(file, true));
      if (multiple === false) {
        acceptFiles = files.slice(0, 1);
      }
      this.uploadFiles(acceptFiles);
    }
  };
  onFilePaste = async e => {
    const {
      pastable
    } = this.props;
    if (!pastable) {
      return;
    }
    if (e.type === 'paste') {
      const clipboardData = e.clipboardData;
      return this.onDataTransferFiles(clipboardData, () => {
        e.preventDefault();
      });
    }
  };
  onFileDragOver = e => {
    e.preventDefault();
  };
  onFileDrop = async e => {
    e.preventDefault();
    if (e.type === 'drop') {
      const dataTransfer = e.dataTransfer;
      return this.onDataTransferFiles(dataTransfer);
    }
  };
  componentDidMount() {
    this._isMounted = true;
    const {
      pastable
    } = this.props;
    if (pastable) {
      document.addEventListener('paste', this.onFilePaste);
    }
  }
  componentWillUnmount() {
    this._isMounted = false;
    this.abort();
    document.removeEventListener('paste', this.onFilePaste);
  }
  componentDidUpdate(prevProps) {
    const {
      pastable
    } = this.props;
    if (pastable && !prevProps.pastable) {
      document.addEventListener('paste', this.onFilePaste);
    } else if (!pastable && prevProps.pastable) {
      document.removeEventListener('paste', this.onFilePaste);
    }
  }
  uploadFiles = files => {
    const originFiles = [...files];
    const postFiles = originFiles.map(file => {
      // eslint-disable-next-line no-param-reassign
      file.uid = (0, _uid.default)();
      return this.processFile(file, originFiles);
    });

    // Batch upload files
    Promise.all(postFiles).then(fileList => {
      const {
        onBatchStart
      } = this.props;
      onBatchStart?.(fileList.map(({
        origin,
        parsedFile
      }) => ({
        file: origin,
        parsedFile
      })));
      fileList.filter(file => file.parsedFile !== null).forEach(file => {
        this.post(file);
      });
    });
  };

  /**
   * Process file before upload. When all the file is ready, we start upload.
   */
  processFile = async (file, fileList) => {
    const {
      beforeUpload
    } = this.props;
    let transformedFile = file;
    if (beforeUpload) {
      try {
        transformedFile = await beforeUpload(file, fileList);
      } catch (e) {
        // Rejection will also trade as false
        transformedFile = false;
      }
      if (transformedFile === false) {
        return {
          origin: file,
          parsedFile: null,
          action: null,
          data: null
        };
      }
    }

    // Get latest action
    const {
      action
    } = this.props;
    let mergedAction;
    if (typeof action === 'function') {
      mergedAction = await action(file);
    } else {
      mergedAction = action;
    }

    // Get latest data
    const {
      data
    } = this.props;
    let mergedData;
    if (typeof data === 'function') {
      mergedData = await data(file);
    } else {
      mergedData = data;
    }
    const parsedData =
    // string type is from legacy `transformFile`.
    // Not sure if this will work since no related test case works with it
    (typeof transformedFile === 'object' || typeof transformedFile === 'string') && transformedFile ? transformedFile : file;
    let parsedFile;
    if (parsedData instanceof File) {
      parsedFile = parsedData;
    } else {
      parsedFile = new File([parsedData], file.name, {
        type: file.type
      });
    }
    const mergedParsedFile = parsedFile;
    mergedParsedFile.uid = file.uid;
    return {
      origin: file,
      data: mergedData,
      parsedFile: mergedParsedFile,
      action: mergedAction
    };
  };
  post({
    data,
    origin,
    action,
    parsedFile
  }) {
    if (!this._isMounted) {
      return;
    }
    const {
      onStart,
      customRequest,
      name,
      headers,
      withCredentials,
      method
    } = this.props;
    const {
      uid
    } = origin;
    const request = customRequest || _request.default;
    const requestOption = {
      action,
      filename: name,
      data,
      file: parsedFile,
      headers,
      withCredentials,
      method: method || 'post',
      onProgress: e => {
        const {
          onProgress
        } = this.props;
        onProgress?.(e, parsedFile);
      },
      onSuccess: (ret, xhr) => {
        const {
          onSuccess
        } = this.props;
        onSuccess?.(ret, parsedFile, xhr);
        delete this.reqs[uid];
      },
      onError: (err, ret) => {
        const {
          onError
        } = this.props;
        onError?.(err, ret, parsedFile);
        delete this.reqs[uid];
      }
    };
    onStart(origin);
    this.reqs[uid] = request(requestOption, {
      defaultRequest: _request.default
    });
  }
  reset() {
    this.setState({
      uid: (0, _uid.default)()
    });
  }
  abort(file) {
    const {
      reqs
    } = this;
    if (file) {
      const uid = file.uid ? file.uid : file;
      if (reqs[uid] && reqs[uid].abort) {
        reqs[uid].abort();
      }
      delete reqs[uid];
    } else {
      Object.keys(reqs).forEach(uid => {
        if (reqs[uid] && reqs[uid].abort) {
          reqs[uid].abort();
        }
        delete reqs[uid];
      });
    }
  }
  saveFileInput = node => {
    this.fileInput = node;
  };
  render() {
    const {
      component: Tag,
      prefixCls,
      className,
      classNames = {},
      disabled,
      id,
      name,
      style,
      styles = {},
      multiple,
      accept,
      capture,
      children,
      directory,
      openFileDialogOnClick,
      onMouseEnter,
      onMouseLeave,
      hasControlInside,
      ...otherProps
    } = this.props;

    // Extract accept format for input element
    const acceptFormat = typeof accept === 'string' ? accept : accept?.format;
    const cls = (0, _clsx.clsx)(prefixCls, {
      [`${prefixCls}-disabled`]: disabled,
      [className]: className
    });
    // because input don't have directory/webkitdirectory type declaration
    const dirProps = directory ? {
      directory: 'directory',
      webkitdirectory: 'webkitdirectory'
    } : {};
    const events = disabled ? {} : {
      onClick: openFileDialogOnClick ? this.onClick : () => {},
      onKeyDown: openFileDialogOnClick ? this.onKeyDown : () => {},
      onMouseEnter,
      onMouseLeave,
      onDrop: this.onFileDrop,
      onDragOver: this.onFileDragOver,
      tabIndex: hasControlInside ? undefined : '0'
    };
    return /*#__PURE__*/_react.default.createElement(Tag, _extends({}, events, {
      className: cls,
      role: hasControlInside ? undefined : 'button',
      style: style
    }), /*#__PURE__*/_react.default.createElement("input", _extends({}, (0, _pickAttrs.default)(otherProps, {
      aria: true,
      data: true
    }), {
      id: id
      /**
       * https://github.com/ant-design/ant-design/issues/50643,
       * https://github.com/react-component/upload/pull/575#issuecomment-2320646552
       */,
      name: name,
      disabled: disabled,
      type: "file",
      ref: this.saveFileInput,
      onClick: e => e.stopPropagation() // https://github.com/ant-design/ant-design/issues/19948
      ,
      key: this.state.uid,
      style: {
        display: 'none',
        ...styles.input
      },
      className: classNames.input,
      accept: acceptFormat
    }, dirProps, {
      multiple: multiple,
      onChange: this.onChange
    }, capture != null ? {
      capture
    } : {})), children);
  }
}
var _default = exports.default = AjaxUploader;