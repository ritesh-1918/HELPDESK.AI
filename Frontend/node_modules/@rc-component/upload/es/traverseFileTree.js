// https://github.com/ant-design/ant-design/issues/50080
const traverseFileTree = async (files, isAccepted) => {
  const flattenFileList = [];
  const progressFileList = [];
  files.forEach(file => progressFileList.push(file.webkitGetAsEntry()));
  async function readDirectory(directory) {
    const dirReader = directory.createReader();
    const entries = [];
    while (true) {
      const results = await new Promise(resolve => {
        dirReader.readEntries(resolve, () => resolve([]));
      });
      const n = results.length;
      if (!n) {
        break;
      }
      for (let i = 0; i < n; i++) {
        entries.push(results[i]);
      }
    }
    return entries;
  }
  async function readFile(item) {
    return new Promise(reslove => {
      item.file(file => {
        if (isAccepted(file)) {
          // https://github.com/ant-design/ant-design/issues/16426
          if (item.fullPath && !file.webkitRelativePath) {
            Object.defineProperties(file, {
              webkitRelativePath: {
                writable: true
              }
            });
            // eslint-disable-next-line no-param-reassign
            file.webkitRelativePath = item.fullPath.replace(/^\//, '');
            Object.defineProperties(file, {
              webkitRelativePath: {
                writable: false
              }
            });
          }
          reslove(file);
        } else {
          reslove(null);
        }
      });
    });
  }

  // eslint-disable-next-line @typescript-eslint/naming-convention
  const _traverseFileTree = async (item, path) => {
    if (!item) {
      return;
    }
    // eslint-disable-next-line no-param-reassign
    item.path = path || '';
    if (item.isFile) {
      const file = await readFile(item);
      if (file) {
        flattenFileList.push(file);
      }
    } else if (item.isDirectory) {
      const entries = await readDirectory(item);
      progressFileList.push(...entries);
    }
  };
  let wipIndex = 0;
  while (wipIndex < progressFileList.length) {
    await _traverseFileTree(progressFileList[wipIndex]);
    wipIndex++;
  }
  return flattenFileList;
};
export default traverseFileTree;