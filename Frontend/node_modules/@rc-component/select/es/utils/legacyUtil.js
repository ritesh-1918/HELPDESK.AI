import * as React from 'react';
import toArray from "@rc-component/util/es/Children/toArray";
function convertNodeToOption(node) {
  const {
    key,
    props: {
      children,
      value,
      ...restProps
    }
  } = node;
  return {
    key,
    value: value !== undefined ? value : key,
    children,
    ...restProps
  };
}
export function convertChildrenToData(nodes, optionOnly = false) {
  return toArray(nodes).map((node, index) => {
    if (! /*#__PURE__*/React.isValidElement(node) || !node.type) {
      return null;
    }
    const {
      type: {
        isSelectOptGroup
      },
      key,
      props: {
        children,
        ...restProps
      }
    } = node;
    if (optionOnly || !isSelectOptGroup) {
      return convertNodeToOption(node);
    }
    return {
      key: `__RC_SELECT_GRP__${key === null ? index : key}__`,
      label: key,
      ...restProps,
      options: convertChildrenToData(children)
    };
  }).filter(data => data);
}