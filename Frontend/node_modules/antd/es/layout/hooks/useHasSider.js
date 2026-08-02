import { toArray } from '@rc-component/util';
import Sider from '../Sider';
export default function useHasSider(siders, children, hasSider) {
  if (typeof hasSider === 'boolean') {
    return hasSider;
  }
  if (siders.length) {
    return true;
  }
  const childNodes = toArray(children);
  return childNodes.some(node => node.type === Sider);
}