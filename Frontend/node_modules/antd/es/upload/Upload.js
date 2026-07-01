"use client";

import _toConsumableArray from "@babel/runtime/helpers/esm/toConsumableArray";
import * as React from 'react';
import { flushSync } from 'react-dom';
import RcUpload from '@rc-component/upload';
import { useControlledState } from '@rc-component/util';
import { clsx } from 'clsx';
import { useMergeSemantic } from '../_util/hooks';
import { devUseWarning } from '../_util/warning';
import { useComponentConfig } from '../config-provider/context';
import DisabledContext from '../config-provider/DisabledContext';
import { useLocale } from '../locale';
import defaultLocale from '../locale/en_US';
import useStyle from './style';
import UploadList from './UploadList';
import { file2Obj, getFileItem, removeFileItem, updateFileList } from './utils';
export const LIST_IGNORE = `__LIST_IGNORE_${Date.now()}__`;
const InternalUpload = (props, ref) => {
  const config = useComponentConfig('upload');
  const {
    fileList,
    defaultFileList,
    onRemove,
    showUploadList = true,
    listType = 'text',
    onPreview,
    onDownload,
    onChange,
    onDrop,
    previewFile,
    disabled: customDisabled,
    locale: propLocale,
    iconRender,
    isImageUrl,
    progress,
    prefixCls: customizePrefixCls,
    className,
    type = 'select',
    children,
    style,
    itemRender,
    maxCount,
    data = {},
    multiple = false,
    hasControlInside = true,
    action = '',
    accept = '',
    supportServerRender = true,
    rootClassName,
    styles,
    classNames
  } = props;
  // ===================== Disabled =====================
  const disabled = React.useContext(DisabledContext);
  const mergedDisabled = customDisabled ?? disabled;
  const customRequest = props.customRequest || config.customRequest;
  const [internalFileList, setMergedFileList] = useControlledState(defaultFileList, fileList);
  const mergedFileList = internalFileList || [];
  const [dragState, setDragState] = React.useState('drop');
  const upload = React.useRef(null);
  const wrapRef = React.useRef(null);
  if (process.env.NODE_ENV !== 'production') {
    const warning = devUseWarning('Upload');
    process.env.NODE_ENV !== "production" ? warning('fileList' in props || !('value' in props), 'usage', '`value` is not a valid prop, do you mean `fileList`?') : void 0;
  }
  // Control mode will auto fill file uid if not provided
  React.useMemo(() => {
    // eslint-disable-next-line react-hooks/purity
    const timestamp = Date.now();
    (fileList || []).forEach((file, index) => {
      if (!file.uid && !Object.isFrozen(file)) {
        file.uid = `__AUTO__${timestamp}_${index}__`;
      }
    });
  }, [fileList]);
  const onInternalChange = (file, changedFileList, event) => {
    let cloneList = _toConsumableArray(changedFileList);
    let exceedMaxCount = false;
    // Cut to match count
    if (maxCount === 1) {
      cloneList = cloneList.slice(-1);
    } else if (maxCount) {
      exceedMaxCount = cloneList.length > maxCount;
      cloneList = cloneList.slice(0, maxCount);
    }
    // Prevent React18 auto batch since input[upload] trigger process at same time
    // which makes fileList closure problem
    // eslint-disable-next-line react-dom/no-flush-sync
    flushSync(() => {
      setMergedFileList(cloneList);
    });
    const changeInfo = {
      file: file,
      fileList: cloneList
    };
    if (event) {
      changeInfo.event = event;
    }
    if (!exceedMaxCount || file.status === 'removed' ||
    // We should ignore event if current file is exceed `maxCount`
    cloneList.some(f => f.uid === file.uid)) {
      // eslint-disable-next-line react-dom/no-flush-sync
      flushSync(() => {
        onChange?.(changeInfo);
      });
    }
  };
  const mergedBeforeUpload = async (file, fileListArgs) => {
    const {
      beforeUpload
    } = props;
    let parsedFile = file;
    if (beforeUpload) {
      const result = await beforeUpload(file, fileListArgs);
      if (result === false) {
        return false;
      }
      // Hack for LIST_IGNORE, we add additional info to remove from the list
      delete file[LIST_IGNORE];
      if (result === LIST_IGNORE) {
        Object.defineProperty(file, LIST_IGNORE, {
          value: true,
          configurable: true
        });
        return false;
      }
      if (typeof result === 'object' && result) {
        parsedFile = result;
      }
    }
    return parsedFile;
  };
  const onBatchStart = batchFileInfoList => {
    // Skip file which marked as `LIST_IGNORE`, these file will not add to file list
    const filteredFileInfoList = batchFileInfoList.filter(info => !info.file[LIST_IGNORE]);
    // Nothing to do since no file need upload
    if (!filteredFileInfoList.length) {
      return;
    }
    const objectFileList = filteredFileInfoList.map(info => file2Obj(info.file));
    // Concat new files with prev files
    let newFileList = _toConsumableArray(mergedFileList);
    objectFileList.forEach(fileObj => {
      // Replace file if exist
      newFileList = updateFileList(fileObj, newFileList);
    });
    objectFileList.forEach((fileObj, index) => {
      // Repeat trigger `onChange` event for compatible
      let triggerFileObj = fileObj;
      if (!filteredFileInfoList[index].parsedFile) {
        // `beforeUpload` return false
        const {
          originFileObj
        } = fileObj;
        let clone;
        try {
          clone = new File([originFileObj], originFileObj.name, {
            type: originFileObj.type
          });
        } catch {
          clone = new Blob([originFileObj], {
            type: originFileObj.type
          });
          clone.name = originFileObj.name;
          clone.lastModifiedDate = new Date();
          clone.lastModified = new Date().getTime();
        }
        clone.uid = fileObj.uid;
        triggerFileObj = clone;
      } else {
        // Inject `uploading` status
        fileObj.status = 'uploading';
      }
      onInternalChange(triggerFileObj, newFileList);
    });
  };
  const onSuccess = (response, file, xhr) => {
    try {
      if (typeof response === 'string') {
        response = JSON.parse(response);
      }
    } catch {
      /* do nothing */
    }
    // removed
    if (!getFileItem(file, mergedFileList)) {
      return;
    }
    const targetItem = file2Obj(file);
    targetItem.status = 'done';
    targetItem.percent = 100;
    targetItem.response = response;
    targetItem.xhr = xhr;
    const nextFileList = updateFileList(targetItem, mergedFileList);
    onInternalChange(targetItem, nextFileList);
  };
  const onProgress = (e, file) => {
    // removed
    if (!getFileItem(file, mergedFileList)) {
      return;
    }
    const targetItem = file2Obj(file);
    targetItem.status = 'uploading';
    targetItem.percent = e.percent;
    const nextFileList = updateFileList(targetItem, mergedFileList);
    onInternalChange(targetItem, nextFileList, e);
  };
  const onError = (error, response, file) => {
    // removed
    if (!getFileItem(file, mergedFileList)) {
      return;
    }
    const targetItem = file2Obj(file);
    targetItem.error = error;
    targetItem.response = response;
    targetItem.status = 'error';
    const nextFileList = updateFileList(targetItem, mergedFileList);
    onInternalChange(targetItem, nextFileList);
  };
  const handleRemove = file => {
    let currentFile;
    Promise.resolve(typeof onRemove === 'function' ? onRemove(file) : onRemove).then(ret => {
      // Prevent removing file
      if (ret === false) {
        return;
      }
      const removedFileList = removeFileItem(file, mergedFileList);
      if (removedFileList) {
        currentFile = {
          ...file,
          status: 'removed'
        };
        mergedFileList?.forEach(item => {
          const matchKey = currentFile.uid !== undefined ? 'uid' : 'name';
          if (item[matchKey] === currentFile[matchKey] && !Object.isFrozen(item)) {
            item.status = 'removed';
          }
        });
        upload.current?.abort(currentFile);
        onInternalChange(currentFile, removedFileList);
      }
    });
  };
  const onFileDrop = e => {
    setDragState(e.type);
    if (e.type === 'drop') {
      onDrop?.(e);
    }
  };
  // Test needs
  React.useImperativeHandle(ref, () => ({
    onBatchStart,
    onSuccess,
    onProgress,
    onError,
    fileList: mergedFileList,
    upload: upload.current,
    nativeElement: wrapRef.current
  }));
  const {
    getPrefixCls,
    direction,
    className: contextClassName,
    style: contextStyle,
    classNames: contextClassNames,
    styles: contextStyles
  } = useComponentConfig('upload');
  const prefixCls = getPrefixCls('upload', customizePrefixCls);
  // =========== Merged Props for Semantic ==========
  const mergedProps = {
    ...props,
    listType,
    showUploadList,
    type,
    multiple,
    hasControlInside,
    supportServerRender,
    disabled: mergedDisabled
  };
  const [mergedClassNames, mergedStyles] = useMergeSemantic([contextClassNames, classNames], [contextStyles, styles], {
    props: mergedProps
  });
  const rcUploadProps = {
    onBatchStart,
    onError,
    onProgress,
    onSuccess,
    ...props,
    customRequest,
    data,
    multiple,
    action,
    accept,
    supportServerRender,
    prefixCls,
    disabled: mergedDisabled,
    beforeUpload: mergedBeforeUpload,
    onChange: undefined,
    hasControlInside
  };
  delete rcUploadProps.className;
  delete rcUploadProps.style;
  // Remove id to avoid open by label when trigger is hidden
  // !children: https://github.com/ant-design/ant-design/issues/14298
  // disabled: https://github.com/ant-design/ant-design/issues/16478
  //           https://github.com/ant-design/ant-design/issues/24197
  if (!children || mergedDisabled) {
    delete rcUploadProps.id;
  }
  const wrapperCls = `${prefixCls}-wrapper`;
  const [hashId, cssVarCls] = useStyle(prefixCls, wrapperCls);
  const [contextLocale] = useLocale('Upload', defaultLocale.Upload);
  const {
    showRemoveIcon,
    showPreviewIcon,
    showDownloadIcon,
    removeIcon,
    previewIcon,
    downloadIcon,
    extra
  } = typeof showUploadList === 'boolean' ? {} : showUploadList;
  // use showRemoveIcon if it is specified explicitly
  const realShowRemoveIcon = typeof showRemoveIcon === 'undefined' ? !mergedDisabled : showRemoveIcon;
  const renderUploadList = (button, buttonVisible) => {
    if (!showUploadList) {
      return button;
    }
    return /*#__PURE__*/React.createElement(UploadList, {
      classNames: mergedClassNames,
      styles: mergedStyles,
      prefixCls: prefixCls,
      listType: listType,
      items: mergedFileList,
      previewFile: previewFile,
      onPreview: onPreview,
      onDownload: onDownload,
      onRemove: handleRemove,
      showRemoveIcon: realShowRemoveIcon,
      showPreviewIcon: showPreviewIcon,
      showDownloadIcon: showDownloadIcon,
      removeIcon: removeIcon,
      previewIcon: previewIcon,
      downloadIcon: downloadIcon,
      iconRender: iconRender,
      extra: extra,
      locale: {
        ...contextLocale,
        ...propLocale
      },
      isImageUrl: isImageUrl,
      progress: progress,
      appendAction: button,
      appendActionVisible: buttonVisible,
      itemRender: itemRender,
      disabled: mergedDisabled
    });
  };
  const mergedRootCls = clsx(wrapperCls, className, rootClassName, hashId, cssVarCls, contextClassName, mergedClassNames.root, {
    [`${prefixCls}-rtl`]: direction === 'rtl',
    [`${prefixCls}-picture-card-wrapper`]: listType === 'picture-card',
    [`${prefixCls}-picture-circle-wrapper`]: listType === 'picture-circle'
  });
  const mergedRootStyle = {
    ...mergedStyles.root
  };
  const mergedStyle = {
    ...contextStyle,
    ...style
  };
  // ======================== Render ========================
  if (type === 'drag') {
    const dragCls = clsx(hashId, prefixCls, `${prefixCls}-drag`, {
      [`${prefixCls}-drag-uploading`]: mergedFileList.some(file => file.status === 'uploading'),
      [`${prefixCls}-drag-hover`]: dragState === 'dragover',
      [`${prefixCls}-disabled`]: mergedDisabled,
      [`${prefixCls}-rtl`]: direction === 'rtl'
    }, mergedClassNames.trigger);
    return /*#__PURE__*/React.createElement("span", {
      className: mergedRootCls,
      ref: wrapRef,
      style: mergedRootStyle
    }, /*#__PURE__*/React.createElement("div", {
      className: dragCls,
      style: {
        ...mergedStyle,
        ...mergedStyles.trigger
      },
      onDrop: onFileDrop,
      onDragOver: onFileDrop,
      onDragLeave: onFileDrop
    }, /*#__PURE__*/React.createElement(RcUpload, {
      ...rcUploadProps,
      ref: upload,
      className: `${prefixCls}-btn`
    }, /*#__PURE__*/React.createElement("div", {
      className: `${prefixCls}-drag-container`
    }, children))), renderUploadList());
  }
  const uploadBtnCls = clsx(prefixCls, `${prefixCls}-select`, {
    [`${prefixCls}-disabled`]: mergedDisabled,
    [`${prefixCls}-hidden`]: !children
  }, mergedClassNames.trigger);
  const uploadButton = /*#__PURE__*/React.createElement("div", {
    className: uploadBtnCls,
    style: {
      ...mergedStyle,
      ...mergedStyles.trigger
    }
  }, /*#__PURE__*/React.createElement(RcUpload, {
    ...rcUploadProps,
    ref: upload
  }));
  if (listType === 'picture-card' || listType === 'picture-circle') {
    return /*#__PURE__*/React.createElement("span", {
      className: mergedRootCls,
      ref: wrapRef,
      style: mergedRootStyle
    }, renderUploadList(uploadButton, !!children));
  }
  return /*#__PURE__*/React.createElement("span", {
    className: mergedRootCls,
    ref: wrapRef,
    style: mergedRootStyle
  }, uploadButton, renderUploadList());
};
const Upload = /*#__PURE__*/React.forwardRef(InternalUpload);
if (process.env.NODE_ENV !== 'production') {
  Upload.displayName = 'Upload';
}
export default Upload;