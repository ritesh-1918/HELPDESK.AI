import { createContext, useContext } from "./context";
import createImmutable from "./Immutable";

// For legacy usage, we export it directly
const {
  makeImmutable,
  responseImmutable,
  useImmutableMark
} = createImmutable();
export { createContext, useContext, createImmutable, makeImmutable, responseImmutable, useImmutableMark };