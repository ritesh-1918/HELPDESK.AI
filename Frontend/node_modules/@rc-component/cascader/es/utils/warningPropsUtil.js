import warning from "@rc-component/util/es/warning";
// value in Cascader options should not be null
export function warningNullOptions(options, fieldNames) {
  if (options) {
    const recursiveOptions = optionsList => {
      for (let i = 0; i < optionsList.length; i++) {
        const option = optionsList[i];
        if (option[fieldNames?.value] === null) {
          warning(false, '`value` in Cascader options should not be `null`.');
          return true;
        }
        if (Array.isArray(option[fieldNames?.children]) && recursiveOptions(option[fieldNames?.children])) {
          return true;
        }
      }
    };
    recursiveOptions(options);
  }
}