import warning from './warning';
const execCopy = (text, isHtmlFormat) => {
  let copySuccess = false;
  const onCopy = event => {
    event.stopPropagation();
    event.preventDefault();
    event.clipboardData?.clearData();
    event.clipboardData?.setData('text/plain', text);
    if (isHtmlFormat) {
      event.clipboardData?.setData('text/html', text);
    }
    copySuccess = true;
  };
  try {
    document.addEventListener('copy', onCopy, {
      capture: true
    });
    document.execCommand('copy');
    return copySuccess;
  } catch {
    return false;
  } finally {
    document.removeEventListener('copy', onCopy, {
      capture: true
    });
  }
};
const asyncCopy = async (text, isHtmlFormat) => {
  try {
    if (isHtmlFormat) {
      await navigator.clipboard.write([new ClipboardItem({
        'text/html': new Blob([text], {
          type: 'text/html'
        }),
        'text/plain': new Blob([text], {
          type: 'text/plain'
        })
      })]);
    } else {
      await navigator.clipboard.writeText(text);
    }
    return true;
  } catch {
    return false;
  }
};
async function copy(text, config) {
  if (typeof text !== 'string') {
    process.env.NODE_ENV !== "production" ? warning(false, 'The clipboard content must be of string type', '') : void 0;
    return false;
  }
  const isHtmlFormat = config?.format === 'text/html';
  if (await asyncCopy(text, isHtmlFormat)) {
    return true;
  }
  if (execCopy(text, isHtmlFormat)) {
    return true;
  }
  return false;
}
export default copy;