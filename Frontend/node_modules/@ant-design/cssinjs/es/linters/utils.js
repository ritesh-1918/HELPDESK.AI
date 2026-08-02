import devWarning from "@rc-component/util/es/warning";
export function lintWarning(message, info) {
  const {
    path,
    parentSelectors
  } = info;
  devWarning(false, `[Ant Design CSS-in-JS] ${path ? `Error in ${path}: ` : ''}${message}${parentSelectors.length ? ` Selector: ${parentSelectors.join(' | ')}` : ''}`);
}