import { createContext, createImmutable } from '@rc-component/context';
const {
  makeImmutable,
  responseImmutable,
  useImmutableMark
} = createImmutable();
export { makeImmutable, responseImmutable, useImmutableMark };
const TableContext = createContext();
export default TableContext;